/**
 * Cron job stub — copy this file to add a scheduled task.
 * Source: Product/backend/jobs/ (pattern extracted from all 9 cron jobs)
 *
 * Naming convention:  <domain><Action>Cron.js   e.g. feeReminderCron.js
 *
 * Schedule syntax: node-cron (standard cron with optional seconds field)
 *   '0 8 * * *'   → 8:00 AM every day
 *   '0 0 1 * *'   → midnight on the 1st of each month
 *   '*/5 * * * *' → every 5 minutes
 */
const cron = require('node-cron');

function start<FeatureName>Cron() {
  cron.schedule('<cron-expression>', async () => {
    try {
      console.log('[Cron] <FeatureName>: starting');
      // ── business logic here ────────────────────────────────────────────────
      // For long-running work, enqueue a background job instead:
      //   await enqueueJob('<queue-name>', { ...payload });
      console.log('[Cron] <FeatureName>: done');
    } catch (error) {
      console.error('[Cron] <FeatureName> failed:', error);
    }
  });
}

module.exports = { start<FeatureName>Cron };
