// Nightly purge job (03:00 server-local):
//  - RefreshToken: revoked rows older than 7 days + any expired token
//  - AuditLog: rows older than 90 days (retention window)
// Keeps both tables bounded — without this they grow forever.
const cron  = require('node-cron');
const prisma = require('../config/dbConnect');
const logger = require('../config/logger');

const TOKEN_RETENTION_MS = 7  * 24 * 60 * 60 * 1000;
const AUDIT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

async function purgeExpiredTokens() {
  const now          = new Date();
  const tokenCutoff  = new Date(now.getTime() - TOKEN_RETENTION_MS);
  const auditCutoff  = new Date(now.getTime() - AUDIT_RETENTION_MS);

  const tokens = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { revoked: true, createdAt: { lt: tokenCutoff } },
        { expiredAt: { lt: now } },
      ],
    },
  });

  const audits = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: auditCutoff } },
  });

  logger.info({ tokens: tokens.count, audits: audits.count }, 'purge run complete');
}

// PM2 cluster runs the API on N instances; without this every instance would
// fire the same cron and the purge would run N times concurrently. PM2 sets
// NODE_APP_INSTANCE (0-indexed) on each cluster worker — only instance 0
// schedules it. Outside PM2 (dev, single-process) NODE_APP_INSTANCE is unset,
// which also resolves to "0" so the cron still runs normally.
function isCronOwnerInstance() {
  return (process.env.NODE_APP_INSTANCE || '0') === '0';
}

function startPurgeCron() {
  if (!isCronOwnerInstance()) {
    logger.info({ instance: process.env.NODE_APP_INSTANCE }, 'purge cron skipped — not the owner instance');
    return;
  }
  cron.schedule('0 3 * * *', () => {
    purgeExpiredTokens().catch((err) => logger.error({ err }, 'purge cron failed'));
  });
  logger.info('purge cron scheduled (03:00 daily)');
}

module.exports = { startPurgeCron, purgeExpiredTokens };
