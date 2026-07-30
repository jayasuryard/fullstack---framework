/**
 * Generic Redis-backed job queue with WebSocket progress streaming.
 *
 * Pattern: enqueueJob → worker BLPOP → handler(payload, { jobId, reportProgress }) → done/failed
 * Progress events are published to a Redis pub/sub channel so a WebSocket bridge can
 * forward them to the browser in real-time (see jobWsServer.js).
 */

const { client } = require('../../config/redisConfig');
const { v4: uuidv4 } = require('uuid');

const QUEUE_PREFIX            = 'job:queue:';
const STATUS_PREFIX           = 'job:status:';
const PROGRESS_CHANNEL_PREFIX = 'job:progress:';
const JOB_TTL_SECONDS         = 60 * 60;  // 1 hour
const BLPOP_TIMEOUT           = 5;

async function enqueueJob(queueName, payload, meta = {}) {
  const jobId     = uuidv4();
  const queueKey  = `${QUEUE_PREFIX}${queueName}`;
  const statusKey = `${STATUS_PREFIX}${jobId}`;

  await client.hSet(statusKey, {
    jobId,
    queueName,
    status:    'pending',
    progress:  '0',
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

  await client.publish(
    `${PROGRESS_CHANNEL_PREFIX}${jobId}`,
    JSON.stringify({ jobId, status: 'processing', progress: percent, progressMessage: message, ...extra })
  );
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
  if (!queueNames.length) throw new Error('[Worker] No handlers registered.');

  const queueKeys = queueNames.map(n => `${QUEUE_PREFIX}${n}`);
  console.log(`[Worker] Starting. Listening on: ${queueNames.join(', ')}`);

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

    while (true) {
      try {
        const item = await workerClient.blPop(queueKeys, BLPOP_TIMEOUT);
        if (!item) continue;

        const { key: queueKey, element: jobId } = item;
        const queueName = queueKey.replace(QUEUE_PREFIX, '');
        const handler   = handlers[queueName];

        if (!handler) {
          console.warn(`[Worker] No handler for "${queueName}", skipping ${jobId}`);
          continue;
        }

        const rawPayload = await client.hGet(`${STATUS_PREFIX}${jobId}`, 'payload');
        if (!rawPayload) {
          console.warn(`[Worker] No payload for job ${jobId}, skipping.`);
          continue;
        }

        await _updateJob(jobId, { status: 'processing', startedAt: new Date().toISOString(), progress: '0' });
        await client.publish(
          `${PROGRESS_CHANNEL_PREFIX}${jobId}`,
          JSON.stringify({ jobId, status: 'processing', progress: 0, progressMessage: 'Starting…' })
        );

        console.log(`[Worker] Processing job ${jobId} (${queueName})`);

        try {
          const result = await handler(JSON.parse(rawPayload), {
            jobId,
            reportProgress: (pct, msg, extra) => reportProgress(jobId, pct, msg, extra),
          });

          await _updateJob(jobId, { status: 'done', progress: '100', completedAt: new Date().toISOString(), result: JSON.stringify(result) });
          await client.publish(
            `${PROGRESS_CHANNEL_PREFIX}${jobId}`,
            JSON.stringify({ jobId, status: 'done', progress: 100, progressMessage: 'Complete.', result })
          );
          console.log(`[Worker] Job ${jobId} done.`);
        } catch (handlerErr) {
          console.error(`[Worker] Job ${jobId} failed:`, handlerErr.message);
          await _updateJob(jobId, { status: 'failed', completedAt: new Date().toISOString(), error: handlerErr.message || 'Unknown error' });
          await client.publish(
            `${PROGRESS_CHANNEL_PREFIX}${jobId}`,
            JSON.stringify({ jobId, status: 'failed', progress: 0, error: handlerErr.message })
          );
          if (exitOnError) process.exit(1);
        }
      } catch (loopErr) {
        console.error('[Worker] Loop error:', loopErr.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })();
}

module.exports = { enqueueJob, getJobStatus, reportProgress, startWorker, PROGRESS_CHANNEL_PREFIX };
