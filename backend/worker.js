/**
 * Background job worker process.
 * Source: Product/backend/worker.js (generalized: product-specific handlers removed)
 *
 * Run as a SEPARATE PM2 process (fork mode, NOT cluster) — see ecosystem.config.js.
 * Register your product's job handlers in the `handlers` map below.
 *
 * Each key is a queue name (string); the value is an async handler function.
 * The handler receives (payload, { jobId, reportProgress }) and should return a result object.
 * Copy workers/_stub.js to create a new handler.
 */
require('dotenv').config();

const { startWorker } = require('./helpers/queue/jobQueue');

// ── Register your product's job handlers here ──────────────────────────────────
// const { handleMyFeature } = require('./workers/myFeatureJobHandler');

const handlers = {
  // 'my-feature:action': handleMyFeature,
};

startWorker(handlers, { exitOnError: false });

process.on('SIGINT',  () => { console.log('[Worker] SIGINT received, shutting down.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('[Worker] SIGTERM received, shutting down.'); process.exit(0); });
