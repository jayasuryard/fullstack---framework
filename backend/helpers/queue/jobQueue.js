/**
 * Generic Redis-backed job queue with WebSocket progress streaming.
 *
 * Pattern: enqueueJob → worker BLMOVE (atomic claim) → handler(payload, { jobId, reportProgress }) → done/failed
 * Progress events are forwarded to the shared WS hub (helpers/ws/hub.js) on
 * channel job:<jobId>, so browsers subscribed via /ws/jobs/:jobId get live
 * updates (see jobWsServer.js).
 *
 * Reliability model (see F07):
 *  - Popping a job and marking it "in flight" is a single atomic Redis op
 *    (BLMOVE from the queue list into a per-queue processing list), so a
 *    worker crash can never leave a job in neither the queue nor processing.
 *  - Each claimed job gets a lease (workerId + expiry) in a global ZSET,
 *    renewed by a heartbeat every HEARTBEAT_MS while the handler runs.
 *  - A periodic sweep requeues only jobs whose lease has actually expired —
 *    a long-running job with a live heartbeat is never touched, regardless
 *    of total elapsed time.
 */

const { client } = require('../../config/redisConfig');
const { emitToChannel } = require('../ws/hub');
const { v4: uuidv4 } = require('uuid');

const QUEUE_PREFIX            = 'job:queue:';
const PROCESSING_LIST_PREFIX  = 'job:processing:list:'; // per-queue "claimed, not yet finished" list (BLMOVE destination)
const PROCESSING_ZSET         = 'job:processing:leases'; // global lease index — member: jobId, score: lease expiry (ms epoch)
const STATUS_PREFIX           = 'job:status:';

const BLPOP_TIMEOUT           = 5;
const MAX_ATTEMPTS            = 3;              // total handler executions before a job is marked failed
const LEASE_MS                = 60 * 1000;      // how long a claim is valid without a heartbeat
const HEARTBEAT_MS            = 20 * 1000;      // lease renewal interval — well under LEASE_MS
const RECOVERY_INTERVAL_MS    = 30 * 1000;      // periodic sweep for expired leases, after the startup sweep
const PROCESSING_TTL_SECONDS  = 2 * 60 * 60;    // safety-net TTL on the status hash while actively processing, refreshed by heartbeat
const TERMINAL_TTL_SECONDS    = 24 * 60 * 60;   // retention for completed/failed job status (matches the framework's other 24h-class windows)

const LIVENESS_KEY            = 'job:worker:heartbeat'; // last-write timestamp — proves the worker loop is actually looping, not just that the process is up
const LIVENESS_INTERVAL_MS    = 10 * 1000;
const LIVENESS_TTL_SECONDS    = 30;             // 3x the write interval — a stalled/crashed worker's key expires on its own
const DEFAULT_DRAIN_TIMEOUT_MS = 25 * 1000;     // bounded grace period for SIGTERM: let the in-flight job finish, then force-exit

async function enqueueJob(queueName, payload, meta = {}, opts = {}) {
  const jobId     = uuidv4();
  const queueKey  = `${QUEUE_PREFIX}${queueName}`;
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  const { idempotencyKey = null } = opts;

  await client.hSet(statusKey, {
    jobId,
    queueName,
    status:    'pending',
    progress:  '0',
    attempts:  '0',
    createdAt: new Date().toISOString(),
    meta:      JSON.stringify(meta),
    payload:   JSON.stringify(payload),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  });
  // Deliberately no TTL here — a job must not lose its payload while it's still
  // sitting in the backlog, only a worker actually starting/finishing it should
  // touch the status hash's expiry (see _claimJob / terminal-state updates below).
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
    idempotencyKey:  data.idempotencyKey || null,
  };
}

/**
 * @param {string|null} ttl  null = leave expiry untouched, 'persist' = strip any
 *                           TTL (job went back to pending), or a number of seconds
 *                           to (re)apply — used for the processing safety-net TTL
 *                           and the terminal-state retention window.
 */
async function _updateJob(jobId, fields, ttl = null) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  await client.hSet(statusKey, fields);
  if (ttl === 'persist') await client.persist(statusKey);
  else if (typeof ttl === 'number') await client.expire(statusKey, ttl);
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
  await _updateJob(jobId, hashFields, PROCESSING_TTL_SECONDS);

  await emitToChannel(`job:${jobId}`, { jobId, status: 'processing', progress: percent, progressMessage: message, ...extra });
}

/**
 * Atomically record that `workerId` owns `jobId` until `leaseExpiresAt`.
 * The job already left the queue via BLMOVE before this runs, so a failure
 * here does not lose the job — the caller puts it back on the queue instead.
 */
async function _claimJob(jobId, workerId) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  const leaseExpiresAt = Date.now() + LEASE_MS;

  const multi = client.multi();
  multi.hSet(statusKey, {
    status:         'processing',
    startedAt:      new Date().toISOString(),
    progress:       '0',
    workerId,
    leaseExpiresAt: String(leaseExpiresAt),
  });
  multi.persist(statusKey);
  multi.zAdd(PROCESSING_ZSET, { score: leaseExpiresAt, value: jobId });
  await multi.exec();

  return leaseExpiresAt;
}

async function _renewLease(jobId) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  const leaseExpiresAt = Date.now() + LEASE_MS;

  const multi = client.multi();
  multi.zAdd(PROCESSING_ZSET, { score: leaseExpiresAt, value: jobId });
  multi.hSet(statusKey, { leaseExpiresAt: String(leaseExpiresAt) });
  multi.expire(statusKey, PROCESSING_TTL_SECONDS);
  await multi.exec();
}

/**
 * Move a job that's no longer legitimately "in processing" back onto its
 * queue. Used both by the lease sweep (expired lease) and the orphaned-claim
 * sweep (BLMOVE succeeded but the claim write never completed).
 */
async function _requeueOrphan(jobId, fallbackQueueName) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;
  const data = await client.hGetAll(statusKey);
  const queueName = (data && data.queueName) || fallbackQueueName;
  if (!queueName) return false;

  if (data && data.jobId && data.status !== 'processing' && data.status !== 'pending') {
    return false; // already reached done/failed through the normal path — nothing to recover
  }

  await client.lRem(`${PROCESSING_LIST_PREFIX}${queueName}`, 0, jobId);
  if (data && data.jobId) {
    await client.hSet(statusKey, { status: 'pending', progress: '0', startedAt: '', workerId: '', leaseExpiresAt: '' });
    await client.persist(statusKey);
  }
  await client.rPush(`${QUEUE_PREFIX}${queueName}`, jobId);
  console.warn(`[Worker] Recovered job ${jobId} (queue: ${queueName})`);
  return true;
}

/**
 * Sweep for jobs that are no longer legitimately in flight:
 *  1. Leases past their expiry with no heartbeat — the owning worker crashed
 *     or hung. `zRem` is atomic, so when multiple worker processes sweep
 *     concurrently, only the one that actually removes a given member acts
 *     on it — no double-requeue race.
 *  2. Jobs sitting in a processing list with no lease at all — the worker
 *     died in the (very small) window between the atomic BLMOVE claim and
 *     the lease write completing.
 * A job with a live, renewed lease is never touched, however long it runs.
 */
async function recoverStuckJobs() {
  let recovered = 0;

  const expired = await client.zRangeByScore(PROCESSING_ZSET, 0, Date.now());
  for (const jobId of expired) {
    const removed = await client.zRem(PROCESSING_ZSET, jobId);
    if (!removed) continue;
    try {
      if (await _requeueOrphan(jobId)) recovered += 1;
    } catch (err) {
      console.error(`[Worker] Lease-expiry recovery failed for ${jobId}:`, err.message);
    }
  }

  let cursor = '0';
  do {
    const { cursor: nextCursor, keys } = await client.scan(cursor, { MATCH: `${PROCESSING_LIST_PREFIX}*`, COUNT: 100 });
    cursor = nextCursor;

    for (const listKey of keys) {
      const queueName = listKey.slice(PROCESSING_LIST_PREFIX.length);
      const jobIds = await client.lRange(listKey, 0, -1);

      for (const jobId of jobIds) {
        try {
          const score = await client.zScore(PROCESSING_ZSET, jobId);
          if (score !== null) continue; // has a lease — handled by the pass above (or still legitimately fresh)

          const removedCount = await client.lRem(listKey, 1, jobId);
          if (!removedCount) continue;
          if (await _requeueOrphan(jobId, queueName)) recovered += 1;
        } catch (err) {
          console.error(`[Worker] Orphaned-claim recovery failed for ${jobId}:`, err.message);
        }
      }
    }
  } while (cursor !== '0');

  if (recovered) console.log(`[Worker] Recovered ${recovered} stuck job(s).`);
  return recovered;
}

/**
 * Write a heartbeat timestamp so external tooling can observe "the worker
 * loop is actually looping", not just that the process/container is up (the
 * container healthcheck only proves the API answers — it says nothing about
 * the separately-supervised worker). The key self-expires, so a stalled or
 * crashed worker's liveness silently goes stale rather than requiring a
 * separate cleanup step.
 */
async function _writeLiveness() {
  await client.set(LIVENESS_KEY, new Date().toISOString(), { EX: LIVENESS_TTL_SECONDS });
}

async function getWorkerLiveness() {
  const ts = await client.get(LIVENESS_KEY);
  return ts ? { lastHeartbeat: ts, aliveMs: Date.now() - new Date(ts).getTime() } : null;
}

/**
 * @param {() => boolean} shouldStop   Returns true once shutdown has been requested —
 *                                     checked only between jobs (BLMOVE claims are atomic,
 *                                     so a job already claimed is always run to completion).
 * @param {Set<Promise>}  inFlight     Shared set the caller drains on shutdown; holds the
 *                                     promise of whichever job is currently being processed.
 * @param {Array}         blockingClients  Shared array the caller appends this loop's
 *                                     dedicated BLMOVE connection to, so it can be closed on shutdown.
 */
async function _runQueueLoop(queueName, handler, workerId, exitOnError, shouldStop, inFlight, blockingClients) {
  const { createClient } = require('redis');
  const blockingClient = createClient({
    url:      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  });
  blockingClient.on('error', err => console.error(`[Worker:${queueName}] Redis error:`, err.message));
  await blockingClient.connect();
  blockingClients.push(blockingClient);

  const queueKey      = `${QUEUE_PREFIX}${queueName}`;
  const processingKey = `${PROCESSING_LIST_PREFIX}${queueName}`;

  console.log(`[Worker] Listening on: ${queueName}`);

  while (!shouldStop()) {
    let jobId;
    try {
      // BLMOVE atomically pops from the queue and pushes into the processing
      // list in one Redis-side step — there is no instant where a popped job
      // exists in neither list, unlike the old BLPOP-then-mark approach.
      jobId = await blockingClient.blMove(queueKey, processingKey, 'LEFT', 'RIGHT', BLPOP_TIMEOUT);
    } catch (err) {
      if (shouldStop()) break; // shutdown closed the connection out from under a pending BLMOVE — expected, not an error
      console.error(`[Worker:${queueName}] BLMOVE error:`, err.message);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }
    if (!jobId) continue;

    // Claimed atomically — always run it to completion even if shutdown was
    // requested mid-flight; only the NEXT loop iteration honors shouldStop().
    const jobPromise = _processClaimedJob(jobId, queueName, queueKey, processingKey, handler, workerId, exitOnError)
      .catch(err => console.error(`[Worker:${queueName}] Unhandled error processing ${jobId}:`, err.message));
    inFlight.add(jobPromise);
    await jobPromise;
    inFlight.delete(jobPromise);
  }

  console.log(`[Worker:${queueName}] Loop stopped.`);
}

async function _processClaimedJob(jobId, queueName, queueKey, processingKey, handler, workerId, exitOnError) {
  const statusKey = `${STATUS_PREFIX}${jobId}`;

  try {
    await _claimJob(jobId, workerId);
  } catch (claimErr) {
    // The job already left the queue atomically (BLMOVE); if the follow-up
    // lease write fails, put it straight back rather than leave it stranded.
    console.error(`[Worker:${queueName}] Claim failed for ${jobId}, returning to queue:`, claimErr.message);
    try {
      await client.lRem(processingKey, 0, jobId);
      await client.rPush(queueKey, jobId);
    } catch (restoreErr) {
      console.error(`[Worker:${queueName}] Failed to restore ${jobId} to queue:`, restoreErr.message);
    }
    return;
  }

  const rawData = await client.hGetAll(statusKey);
  if (!rawData || !rawData.payload) {
    console.warn(`[Worker:${queueName}] No payload for job ${jobId}, dropping.`);
    await client.lRem(processingKey, 0, jobId);
    await client.zRem(PROCESSING_ZSET, jobId);
    return;
  }

  await emitToChannel(`job:${jobId}`, { jobId, status: 'processing', progress: 0, progressMessage: 'Starting…' });
  console.log(`[Worker] Processing job ${jobId} (${queueName})`);

  const heartbeat = setInterval(() => {
    _renewLease(jobId).catch(err => console.error(`[Worker] Heartbeat failed for ${jobId}:`, err.message));
  }, HEARTBEAT_MS);

  try {
    const attempts = (parseInt(rawData.attempts, 10) || 0) + 1;

    try {
      const payload = JSON.parse(rawData.payload);
      const result = await handler(payload, {
        jobId,
        idempotencyKey: rawData.idempotencyKey || null,
        reportProgress: (pct, msg, extra) => reportProgress(jobId, pct, msg, extra),
      });

      await _updateJob(jobId, {
        status: 'done', progress: '100', completedAt: new Date().toISOString(), result: JSON.stringify(result),
      }, TERMINAL_TTL_SECONDS);
      await emitToChannel(`job:${jobId}`, { jobId, status: 'done', progress: 100, progressMessage: 'Complete.', result });
      console.log(`[Worker] Job ${jobId} done.`);
    } catch (handlerErr) {
      if (attempts < MAX_ATTEMPTS) {
        // Re-queue for retry. Keep the last error on the hash for debugging.
        await _updateJob(jobId, {
          status: 'pending', progress: '0', attempts: String(attempts),
          error: handlerErr.message || 'Unknown error', completedAt: '', startedAt: '', workerId: '', leaseExpiresAt: '',
        }, 'persist');
        await client.rPush(queueKey, jobId);
        await emitToChannel(`job:${jobId}`, { jobId, status: 'retrying', attempts, error: handlerErr.message });
        console.warn(`[Worker] Job ${jobId} failed (attempt ${attempts}/${MAX_ATTEMPTS}), re-queued:`, handlerErr.message);
      } else {
        await _updateJob(jobId, {
          status: 'failed', completedAt: new Date().toISOString(), error: handlerErr.message || 'Unknown error',
        }, TERMINAL_TTL_SECONDS);
        await emitToChannel(`job:${jobId}`, { jobId, status: 'failed', progress: 0, error: handlerErr.message });
        console.error(`[Worker] Job ${jobId} failed permanently after ${attempts} attempts:`, handlerErr.message);
        if (exitOnError) process.exit(1);
      }
    }
  } finally {
    clearInterval(heartbeat);
    await client.lRem(processingKey, 0, jobId).catch(() => {});
    await client.zRem(PROCESSING_ZSET, jobId).catch(() => {});
  }
}

/**
 * Start the worker loop. Call this from worker.js, NOT from server.js.
 *
 * @param {Record<string, Function>} handlers  Map of queueName → async handler(payload, ctx)
 * @param {object} opts
 * @param {boolean} opts.exitOnError           Exit process on handler failure (default false)
 * @returns {{ stop: (drainTimeoutMs?: number) => Promise<void> }}
 *          `stop()` hooks into the existing per-queue loop-control rather than adding a
 *          parallel shutdown mechanism: it flips the `shouldStop` flag each loop already
 *          checks between jobs, then waits (bounded) for whatever job is currently in
 *          flight — it never aborts a job mid-handler.
 */
function startWorker(handlers, opts = {}) {
  const { exitOnError = false } = opts;
  const queueNames = Object.keys(handlers);
  const workerId   = uuidv4();

  let stopping = false;
  const shouldStop = () => stopping;
  const inFlight = new Set();
  const blockingClients = [];
  let sweepInterval = null;
  let livenessInterval = null;
  let loopsSettled = Promise.resolve();

  if (!queueNames.length) {
    // No handlers registered (fresh scaffold). Idle instead of crashing so the
    // PM2 worker process stays alive and picks up handlers on next deploy.
    console.log('[Worker] No handlers registered — idle. Add handlers in worker.js to start consuming.');
  } else {
    console.log(`[Worker] Starting (id: ${workerId}). Queues: ${queueNames.join(', ')}`);
  }

  (async () => {
    // Recovery scans ALL queues' processing state globally, not just this
    // process's own handlers — run it (and its periodic sweep) even while idle,
    // so an idle/scaffold worker still helps reclaim jobs orphaned by others.
    try { await recoverStuckJobs(); } catch (err) {
      console.error('[Worker] Startup recovery failed:', err.message);
    }

    sweepInterval = setInterval(() => {
      recoverStuckJobs().catch(err => console.error('[Worker] Recovery sweep failed:', err.message));
    }, RECOVERY_INTERVAL_MS);
    sweepInterval.unref?.();

    _writeLiveness().catch(err => console.error('[Worker] Liveness write failed:', err.message));
    livenessInterval = setInterval(() => {
      _writeLiveness().catch(err => console.error('[Worker] Liveness write failed:', err.message));
    }, LIVENESS_INTERVAL_MS);
    livenessInterval.unref?.();

    loopsSettled = Promise.all(
      queueNames.map((queueName) =>
        _runQueueLoop(queueName, handlers[queueName], workerId, exitOnError, shouldStop, inFlight, blockingClients)
          .catch(err => console.error(`[Worker:${queueName}] Queue loop crashed:`, err.message))
      )
    );
  })();

  async function stop(drainTimeoutMs = DEFAULT_DRAIN_TIMEOUT_MS) {
    if (stopping) return loopsSettled;
    stopping = true;
    console.log(`[Worker] Stop requested — draining in-flight job(s) (up to ${drainTimeoutMs}ms)...`);

    // Force-close the blocking BLMOVE connections right away so a loop
    // currently parked waiting for a job observes shouldStop() and exits
    // immediately, instead of waiting out the rest of its BLPOP_TIMEOUT
    // window. A loop mid-job-handler is unaffected — job processing runs on
    // the shared `client`, not these dedicated blocking connections — so
    // this never interrupts an in-flight handler.
    await Promise.allSettled(blockingClients.map((bc) => bc.disconnect().catch(() => bc.destroy())));

    let timedOut = false;
    const drainDeadline = new Promise((resolve) => {
      const t = setTimeout(() => { timedOut = true; resolve(); }, drainTimeoutMs);
      t.unref?.();
    });

    await Promise.race([loopsSettled, drainDeadline]);

    if (timedOut && inFlight.size > 0) {
      console.warn(`[Worker] Drain timeout (${drainTimeoutMs}ms) reached with ${inFlight.size} job(s) still in flight — forcing shutdown.`);
    } else {
      console.log('[Worker] Drain complete.');
    }

    clearInterval(sweepInterval);
    clearInterval(livenessInterval);
  }

  return { stop };
}

module.exports = { enqueueJob, getJobStatus, reportProgress, startWorker, recoverStuckJobs, getWorkerLiveness };
