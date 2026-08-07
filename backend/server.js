// Express application entry point.
// Wires middleware, routes, WebSocket servers, and cron jobs.
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const helmet  = require('helmet');
const multer  = require('multer');
const { randomUUID } = require('node:crypto');
const pinoHttp = require('pino-http');
require('dotenv').config();

// ── Production config guard ────────────────────────────────────────────────────
// Runs BEFORE infra modules are required so a misconfigured deploy fails with a
// clear message instead of an obscure Redis/Prisma connection crash.
if (process.env.NODE_ENV === 'production') {
  const weak  = (v) => !v || v.length < 32 || /change-?me/i.test(v);
  const missing = [];
  if (weak(process.env.JWT_SECRET))     missing.push('JWT_SECRET (>=32 chars, not "change-me")');
  if (weak(process.env.REFRESH_SECRET)) missing.push('REFRESH_SECRET (>=32 chars, not "change-me")');
  if (!process.env.DATABASE_URL)        missing.push('DATABASE_URL');
  if (!process.env.REDIS_HOST)          missing.push('REDIS_HOST');
  if (!process.env.REDIS_PORT)          missing.push('REDIS_PORT');
  if (missing.length) {
    console.error(`[config] Refusing to start in production. Missing/weak env: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const routes        = require('./routes');
const apiResponse   = require('./helpers/apiResponse');
const logger        = require('./config/logger');
const { client, redisReady } = require('./config/redisConfig');
const prisma        = require('./config/dbConnect');

const app    = express();
const server = http.createServer(app);
const port   = process.env.PORT || 3000;

// Trust proxy so req.ip reflects the real client behind ALB/nginx. Without this
// every user shares the proxy IP → the login limiter counts them as one bucket.
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

// ── Middleware ─────────────────────────────────────────────────────────────────
// CORS locked to FRONTEND_URL (comma-separated list supported). Dev default:
// localhost:5173 (Vite). Adjust in .env per environment.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

// Security headers: CSP, X-Frame-Options, nosniff, HSTS (behind TLS).
// The API serves JSON only — the SPA (separate container) defines its own CSP.
app.use(helmet());

// Structured request logging with x-request-id correlation across the cluster.
app.use(pinoHttp({
  logger,
  genReqId:  (req) => req.headers['x-request-id'] || randomUUID(),
  autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/health/deep' },
}));

// If your product has a payment webhook that requires the raw body for HMAC verification,
// mount it HERE before express.json() using express.raw({ type: 'application/json' }).

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.locals.redis = client;

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Deep health: verifies DB + Redis actually answer. Blue-green promotion uses
// this, so a broken database never gets promoted. Liveness /health stays shallow.
app.get('/health/deep', async (req, res) => {
  const [db, redis] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    client.ping(),
  ]);
  const ok = db.status === 'fulfilled' && redis.status === 'fulfilled';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db:     db.status === 'fulfilled' ? 'up' : `down: ${db.reason?.message || 'unknown'}`,
    redis:  redis.status === 'fulfilled' ? 'up' : `down: ${redis.reason?.message || 'unknown'}`,
  });
});

// ── 404 + error handling (JSON envelope, never HTML) ──────────────────────────
// Express 5 forwards rejected async handlers here automatically.
app.use('/api/v1', (req, res) => apiResponse.send(res, 'NOT_FOUND'));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    req.log?.warn({ err }, 'upload rejected');
    return apiResponse.send(res, 'INVALID_REQUEST', { message: err.message });
  }
  if (err.type === 'entity.too.large') {
    req.log?.warn({ err }, 'payload too large');
    return apiResponse.send(res, 'INVALID_REQUEST', { message: 'Payload too large.' });
  }

  req.log?.error({ err, reqId: req.id }, 'unhandled error');
  return apiResponse.send(res, 'SERVER_ERROR');
});

// ── Cron jobs ──────────────────────────────────────────────────────────────────
const { startPurgeCron } = require('./jobs/purgeExpiredTokens');
startPurgeCron();

// ── WebSocket hub (shared) ─────────────────────────────────────────────────────
// attachWsHub: generic /ws?token=...&channels=a,b for any realtime feature.
// attachJobWsServer: /ws/jobs/:jobId — live job progress (thin shim over the hub).
// Both share one http.Server; unclaimed upgrade requests are destroyed below.
const { attachWsHub }            = require('./helpers/ws/hub');
const { attachJobWsServer }      = require('./helpers/queue/jobWsServer');

attachWsHub(server);
attachJobWsServer(server);

// Fallback: destroy any unclaimed upgrade request
server.on('upgrade', (req, socket) => { if (!socket.destroyed) socket.destroy(); });

// ── Start ──────────────────────────────────────────────────────────────────────
// Wait for the Redis connection so the first request never hits a rate-limiter /
// OTP / cache race. node-redis retries connect() forever by default, so cap the
// boot wait at 15s. Prod: fail fast when Redis is down — a silently-degraded API
// behind blue-green would promote traffic onto a half-dead instance. Dev: start
// anyway (HybridStore + cache helpers degrade; the client keeps retrying in the
// background and the store picks Redis back up on reconnect).
(async function start() {
  const BOOT_REDIS_TIMEOUT_MS = 15000;
  const redisUp = await Promise.race([
    redisReady,
    new Promise((resolve) => {
      const t = setTimeout(() => resolve(false), BOOT_REDIS_TIMEOUT_MS);
      t.unref();
    }),
  ]);
  if (process.env.NODE_ENV === 'production' && !redisUp) {
    logger.fatal('Redis unreachable in production — refusing to start');
    process.exit(1);
  }
  server.listen(port, () => logger.info({ port }, 'server listening'));
})();

// ── Graceful shutdown ──────────────────────────────────────────────────────────
// Drains in-flight HTTP requests, then disconnects Prisma + Redis. Blue-green
// deploy kills the old container with SIGTERM — without this, requests die mid-flight.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'draining connections');

  const force = setTimeout(() => {
    logger.error('drain timeout — forcing exit');
    process.exit(1);
  }, 10000);
  force.unref();

  server.close(() => {
    Promise.allSettled([
      prisma.$disconnect(),
      client.quit().catch(() => {}),
    ]).finally(() => {
      logger.info('shutdown complete');
      process.exit(0);
    });
  });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
