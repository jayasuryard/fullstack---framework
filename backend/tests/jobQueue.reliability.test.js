// Reliability tests for the Redis-backed job queue (F07): atomic BLMOVE claim
// recovery, lease/heartbeat-based stuck-job sweep (a long job with a live
// heartbeat must survive it), retry count, and queued-job payload retention.
//
// Needs a REAL Redis — enable with:  RUN_INTEGRATION=1 npm run test:integration
// (or set TEST_REDIS_HOST/PORT), matching tests/auth.integration.test.js.
// Skips cleanly otherwise so plain `npm test` still passes without infra.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const ENABLED = process.env.RUN_INTEGRATION === '1' || !!process.env.TEST_REDIS_HOST;
const skip    = ENABLED ? false : 'integration infra not configured (set RUN_INTEGRATION=1)';

// Same key scheme as helpers/queue/jobQueue.js — duplicated here (not exported)
// so these tests can poke at "mid-crash" states directly (white-box).
const QUEUE_PREFIX           = 'job:queue:';
const PROCESSING_LIST_PREFIX = 'job:processing:list:';
const PROCESSING_ZSET        = 'job:processing:leases';
const STATUS_PREFIX          = 'job:status:';

let jobQueue, client;

before(async () => {
  if (!ENABLED) return;

  // Must be set BEFORE requiring jobQueue.js — it connects to Redis at require time.
  process.env.REDIS_HOST     = process.env.TEST_REDIS_HOST || '127.0.0.1';
  process.env.REDIS_PORT     = process.env.TEST_REDIS_PORT || '56379';
  process.env.REDIS_PASSWORD = process.env.TEST_REDIS_PASSWORD || '';

  jobQueue = require('../helpers/queue/jobQueue');
  const redisConfig = require('../config/redisConfig');
  client = redisConfig.client;

  const ok = await redisConfig.redisReady;
  if (!ok) throw new Error('Could not connect to test Redis — check TEST_REDIS_HOST/PORT and that it is running.');
});

after(async () => {
  // startWorker() in test (c) below never returns — force the (per-file, child
  // process) test run to exit instead of hanging on that loop / open socket.
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

test('(a) job orphaned between the atomic claim and the lease write is recovered, not lost', { skip }, async () => {
  const queueName = 'reliability-test-orphan';
  const { jobId } = await jobQueue.enqueueJob(queueName, { n: 1 });

  // Simulate exactly what BLMOVE does (atomically move queue -> processing
  // list) but without the follow-up lease write — i.e. a worker that crashed
  // in that instant, which is the exact F07 gap this fix targets.
  await client.lRem(`${QUEUE_PREFIX}${queueName}`, 0, jobId);
  await client.rPush(`${PROCESSING_LIST_PREFIX}${queueName}`, jobId);

  let status = await jobQueue.getJobStatus(jobId);
  assert.equal(status.status, 'pending'); // claim never ran, so status was never flipped

  const recovered = await jobQueue.recoverStuckJobs();
  assert.ok(recovered >= 1, 'sweep should have recovered at least this job');

  const queueMembers = await client.lRange(`${QUEUE_PREFIX}${queueName}`, 0, -1);
  assert.ok(queueMembers.includes(jobId), 'job must be back on the queue, not nowhere');

  const procMembers = await client.lRange(`${PROCESSING_LIST_PREFIX}${queueName}`, 0, -1);
  assert.ok(!procMembers.includes(jobId), 'job must not remain in the processing list');

  status = await jobQueue.getJobStatus(jobId);
  assert.equal(status.status, 'pending');

  await client.del(`${QUEUE_PREFIX}${queueName}`, `${PROCESSING_LIST_PREFIX}${queueName}`);
});

test('(b) a job with a live heartbeat lease is never requeued, however long it runs', { skip }, async () => {
  const queueName = 'reliability-test-longrun';
  const { jobId } = await jobQueue.enqueueJob(queueName, { n: 1 });
  const statusKey = `${STATUS_PREFIX}${jobId}`;

  // Simulate a worker that claimed this job 10 minutes ago (older than the old,
  // naive 5-minute AGE threshold that used to trigger a wrongful requeue — see
  // the reproduced 6-minute-job bug in F07) but that has been heartbeating, so
  // its LEASE is still in the future.
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const futureLease   = Date.now() + 60_000;

  await client.lRem(`${QUEUE_PREFIX}${queueName}`, 0, jobId);
  await client.rPush(`${PROCESSING_LIST_PREFIX}${queueName}`, jobId);
  await client.hSet(statusKey, {
    status: 'processing', startedAt: tenMinutesAgo, workerId: 'w-test', leaseExpiresAt: String(futureLease),
  });
  await client.zAdd(PROCESSING_ZSET, { score: futureLease, value: jobId });

  await jobQueue.recoverStuckJobs();

  let status = await jobQueue.getJobStatus(jobId);
  assert.equal(status.status, 'processing', 'a live-leased job must not be touched regardless of total age');
  const procMembers = await client.lRange(`${PROCESSING_LIST_PREFIX}${queueName}`, 0, -1);
  assert.ok(procMembers.includes(jobId));

  // Now let the lease actually expire (no further heartbeats) and confirm the
  // sweep DOES recover it once it is genuinely stalled.
  await client.zAdd(PROCESSING_ZSET, { score: Date.now() - 1000, value: jobId });
  const recovered = await jobQueue.recoverStuckJobs();
  assert.ok(recovered >= 1);

  status = await jobQueue.getJobStatus(jobId);
  assert.equal(status.status, 'pending');

  await client.del(`${QUEUE_PREFIX}${queueName}`, `${PROCESSING_LIST_PREFIX}${queueName}`);
});

test('(c) a handler that always fails runs exactly 3 times total, then the job is marked failed', { skip }, async () => {
  const queueName = 'reliability-test-retries';
  let calls = 0;
  const handlers = {
    [queueName]: async () => { calls += 1; throw new Error('always fails'); },
  };
  jobQueue.startWorker(handlers, { exitOnError: false });

  const { jobId } = await jobQueue.enqueueJob(queueName, { n: 1 });

  const deadline = Date.now() + 20_000;
  let status;
  do {
    await new Promise(r => setTimeout(r, 250));
    status = await jobQueue.getJobStatus(jobId);
  } while (status.status !== 'failed' && Date.now() < deadline);

  assert.equal(status.status, 'failed');
  assert.equal(calls, 3, 'MAX_ATTEMPTS=3 must mean exactly 3 executions, not 4 (off-by-one fix)');
});

test('(d) a queued (not yet started) job does not lose its payload to a TTL', { skip }, async () => {
  const queueName = 'reliability-test-retention';
  const { jobId } = await jobQueue.enqueueJob(queueName, { n: 1 });
  const statusKey = `${STATUS_PREFIX}${jobId}`;

  const ttl = await client.ttl(statusKey);
  assert.equal(ttl, -1, 'a pending job must have no TTL, so a backlog cannot outlive its own payload');

  const raw = await client.hGetAll(statusKey);
  assert.ok(raw.payload, 'payload must still be present');
  assert.deepEqual(JSON.parse(raw.payload), { n: 1 });

  await client.del(`${QUEUE_PREFIX}${queueName}`, statusKey);
});
