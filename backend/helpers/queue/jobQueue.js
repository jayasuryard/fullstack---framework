/**
 * Generic Redis-backed job queue with WebSocket progress streaming.
 *
 * Pattern: enqueueJob → worker BLPOP → handler(payload, { jobId, reportProgress }) → done/failed
 * Progress events are forwarded to the shared WS hub (helpers/ws/hub.js) on
 * channel job:<jobId>, so browsers subscribed via /ws/jobs/:jobId get live
 * updates (see jobWsServer.js).
 */

const { client } = require('../../config/redisConfig');
const { emitToChannel } = require('../ws/hub');
const { v4: uuidv4 } = require('uuid');

const QUEUE_PREFIX            = 'job:queue:';
const STATUS_PREFIX           = 'job:status:';
const JOB_TTL_SECONDS         = 60 * 60;  // 1 hour
const BLPOP_TIMEOUT           = 5;
const MAX_RETRIES             = 3;        // handler failures before job is marked failed
const STUCK_AFTER_MS          = 5 * 60 * 1000;  // processing longer than this + no heartbeats → re-queued

async function enqueueJob(queueName, payload, meta = {}) {
  const jobId     = uuidv4();
  const queueKey  = `${QUEUE_PREFIX}${queueName}`;
  const statusKey = `${STATUS_PREFIX}${jobId}`;

  await client.hSet(statusKey, {
    jobId,
    queueName,
    status:    'pending',
    progress:  '0',
    attempts:  '0',
    createdAt: new Date().toISOString(),
    meta:      JSON.stringify(meta),
    payload:   JSON.stringify(payload),
  });
  await client.expire(statusKey, JOB_TTL_SECONDS);
  await client.rPush(queueKey, jobId);

  console.log(`[Queue] Enqueued job ${jobId} → ${queueName}`);
  return { jobId };
}

async function getJobStatus(jobId) {
  const data = await client.hGetAll(`${STATUS_PREFIX}${jobId}`);
  if (!data || !data.jobId) return null;

  return {
    jobId:           data.jobId,
    queueName:       data.queueName,
    status:          data.status,
    progress:        parseInt(data.progress || '0', 10),
    progressMessage: data.progressMessage || null,
    createdAt:       data.createdAt,
    startedAt:       data.startedAt   || null,
    completedAt:     data.completedAt || null,
    meta:            data.meta   ? JSON.parse(data.meta)   : {},
    result:          data.result ? JSON.parse(data.result) : undefined,
    error:           data.error  || undefined,
  };
}

async function _updateJob(jobId, fields) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  await client.hSet(statusKey, fields);
  await client.expire(statusKey, JOB_TTL_SECONDS);
}

/**
 * @param {string} jobId
 * @param {number} percent   0–100
 * @param {string} message   human-readable label shown in the UI
 * @param {object} extra     additional fields forwarded to the browser
 */
async function reportProgress(jobId, percent, message = '', extra = {}) {
  const hashFields = { progress: String(percent), progressMessage: message };
  for (const [k, v] of Object.entries(extra)) {
    hashFields[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  await _updateJob(jobId, hashFields);

  await emitToChannel(`job:${jobId}`, { jobId, status: 'processing', progress: percent, progressMessage: message, ...extra });
}

/**
 * Re-queue jobs left in "processing" by a crashed worker (no visibility timeout
 * in the BLPOP model — recovery happens on worker start). A job older than
 * STUCK_AFTER_MS that never finished is reset to pending and pushed back.
 */
async function recoverStuckJobs() {
  let cursor = '0';
  let recovered = 0;

  do {
    const { cursor: nextCursor, keys } = await client.scan(cursor, {
      MATCH: `${STATUS_PREFIX}*`,
      COUNT: 200,
    });
    cursor = nextCursor;

    for (const key of keys) {
      try {
        const data = await client.hGetAll(key);
        if (data.status !== 'processing' || !data.startedAt) continue;

        const startedAt = new Date(data.startedAt).getTime();
        if (!Number.isFinite(startedAt) || Date.now() - startedAt < STUCK_AFTER_MS) continue;

        await client.hSet(key, { status: 'pending', progress: '0', startedAt: '' });
        await client.rPush(`${QUEUE_PREFIX}${data.queueName}`, data.jobId);
        recovered += 1;
      } catch (err) {
        console.error(`[Worker] Stuck-job recovery failed for ${key}:`, err.message);
      }
    }
  } while (cursor !== '0');

  if (recovered) console.log(`[Worker] Recovered ${recovered} stuck job(s).`);
  return recovered;
}

/**
 * Start the worker loop. Call this from worker.js, NOT from server.js.
 *
 * @param {Record<string, Function>} handlers  Map of queueName → async handler(payload, ctx)
 * @param {object} opts
 * @param {boolean} opts.exitOnError           Exit process on handler failure (default false)
 */
function startWorker(handlers, opts = {}) {
  const { exitOnError = false } = opts;
  const queueNames = Object.keys(handlers);
  const queueKeys  = queueNames.map(n => `${QUEUE_PREFIX}${n}`);

  if (!queueKeys.length) {
    // No handlers registered (fresh scaffold). Idle-loop instead of crashing so
    // the PM2 worker process stays alive and picks up handlers on next deploy.
    console.log('[Worker] No handlers registered — idle. Add handlers in worker.js to start consuming.');
  } else {
    console.log(`[Worker] Starting. Listening on: ${queueNames.join(', ')}`);
  }

  const { createClient } = require('redis');
  const workerClient = createClient({
    url:      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  });
  workerClient.on('error', err => console.error('[Worker] Redis error:', err.message));

  (async () => {
    await workerClient.connect();
    console.log('[Worker] Redis connected.');

    // Recover jobs orphaned by a previous crashed worker before consuming new ones.
    try { await recoverStuckJobs(); } catch (err) {
      console.error('[Worker] Stuck-job recovery failed:', err.message);
    }

    while (true) {
      try {
        if (!queueKeys.length) {
          // Idle mode — no queues to listen on. Re-check every 2s in case
          // handlers were registered via a hot deploy.
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const item = await workerClient.blPop(queueKeys, BLPOP_TIMEOUT);
        if (!item) continue;

        const { key: queueKey, element: jobId } = item;
        const queueName = queueKey.replace(QUEUE_PREFIX, '');
        const handler   = handlers[queueName];

        if (!handler) {
          console.warn(`[Worker] No handler for "${queueName}", skipping ${jobId}`);
          continue;
        }

        const rawData = await client.hGetAll(`${STATUS_PREFIX}${jobId}`);
        if (!rawData || !rawData.payload) {
          console.warn(`[Worker] No payload for job ${jobId}, skipping.`);
          continue;
        }

        await _updateJob(jobId, { status: 'processing', startedAt: new Date().toISOString(), progress: '0' });
        await emitToChannel(`job:${jobId}`, { jobId, status: 'processing', progress: 0, progressMessage: 'Starting…' });

        console.log(`[Worker] Processing job ${jobId} (${queueName})`);

        try {
          const result = await handler(JSON.parse(rawData.payload), {
            jobId,
            reportProgress: (pct, msg, extra) => reportProgress(jobId, pct, msg, extra),
          });

          await _updateJob(jobId, { status: 'done', progress: '100', completedAt: new Date().toISOString(), result: JSON.stringify(result) });
          await emitToChannel(`job:${jobId}`, { jobId, status: 'done', progress: 100, progressMessage: 'Complete.', result });
          console.log(`[Worker] Job ${jobId} done.`);
        } catch (handlerErr) {
          const attempts = (parseInt(rawData.attempts, 10) || 0) + 1;

          if (attempts <= MAX_RETRIES) {
            // Re-queue for retry. Keep the last error on the hash for debugging.
            await _updateJob(jobId, {
              status: 'pending', progress: '0', attempts: String(attempts),
              error: handlerErr.message || 'Unknown error', completedAt: '', startedAt: '',
            });
            await client.rPush(queueKey, jobId);
            await emitToChannel(`job:${jobId}`, { jobId, status: 'retrying', attempts, error: handlerErr.message });
            console.warn(`[Worker] Job ${jobId} failed (attempt ${attempts}/${MAX_RETRIES}), re-queued:`, handlerErr.message);
          } else {
            await _updateJob(jobId, { status: 'failed', completedAt: new Date().toISOString(), error: handlerErr.message || 'Unknown error' });
            await emitToChannel(`job:${jobId}`, { jobId, status: 'failed', progress: 0, error: handlerErr.message });
            console.error(`[Worker] Job ${jobId} failed permanently after ${attempts} attempts:`, handlerErr.message);
            if (exitOnError) process.exit(1);
          }
        }
      } catch (loopErr) {
        console.error('[Worker] Loop error:', loopErr.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })();
}

module.exports = { enqueueJob, getJobStatus, reportProgress, startWorker, recoverStuckJobs };
