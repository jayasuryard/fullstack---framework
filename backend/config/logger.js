// Structured logger (pino). Use `req.log` inside request handlers (pino-http
// attaches it); use this module directly in workers/cron.
// JSON lines to stdout — pipe to whatever log aggregator you run (CloudWatch,
// Loki, Datadog…). No console.log in production code paths.
const { pino } = require('pino');

// Redaction is baked into the logger at creation — pino-http's request-scoped
// child loggers inherit it, so req/res auth material never reaches stdout even
// if a route later logs req.body wholesale.
const logger = pino({
  level:     process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base:      { app: 'api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'req.body.password',
      'req.body.newPassword',
      'req.body.token',
      'req.body.refreshToken',
      'req.body.otp',
      'req.body.code',
      'password',
      'newPassword',
      'token',
      'refreshToken',
      'otp',
      'code',
    ],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
