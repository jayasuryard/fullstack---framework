// Structured logger (pino). Use `req.log` inside request handlers (pino-http
// attaches it); use this module directly in workers/cron.
// JSON lines to stdout — pipe to whatever log aggregator you run (CloudWatch,
// Loki, Datadog…). No console.log in production code paths.
const { pino } = require('pino');

const logger = pino({
  level:     process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base:      { app: 'api' },
});

module.exports = logger;
