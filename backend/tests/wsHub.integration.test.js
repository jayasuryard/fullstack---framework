// WS hub integration tests (real http.Server + real Postgres + Redis) — cover the
// three P0 fixes from the WS audit:
//
//   F04 — server no longer destroys a WS connection it just accepted
//         (single 'upgrade' dispatcher, no duplicate-listener race).
//   F05 — generic channel subscriptions are fail-closed: user A cannot
//         subscribe to user B's channel; a deactivated user's still-valid JWT
//         is rejected (DB identity re-check at connect time).
//   F06 — both hubs (generic + job) receive relay-dispatched emitToChannel
//         messages, not just whichever hub attached first.
//
// Boots the ACTUAL production wiring (helpers/ws/hub.js attachWsHub +
// helpers/queue/jobWsServer.js attachJobWsServer against a real http.Server),
// not a substitute. Requires Postgres + Redis — same infra as
// tests/auth.integration.test.js (TEST_DATABASE_URL / TEST_REDIS_HOST etc.),
// and skips cleanly when RUN_INTEGRATION isn't set.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http   = require('node:http');

const ENABLED = process.env.RUN_INTEGRATION === '1' || !!process.env.TEST_DATABASE_URL;
const skip    = ENABLED ? false : 'integration infra not configured (set RUN_INTEGRATION=1)';

if (ENABLED) {
  process.env.DATABASE_URL   = process.env.TEST_DATABASE_URL || 'postgresql://postgres:test@localhost:55432/framework?schema=public';
  process.env.REDIS_HOST     = process.env.TEST_REDIS_HOST || '127.0.0.1';
  process.env.REDIS_PORT     = process.env.TEST_REDIS_PORT || '56379';
  process.env.JWT_SECRET     = process.env.TEST_JWT_SECRET || 'itest-jwt-secret-itest-jwt-secret-0000000000';
  process.env.REFRESH_SECRET = process.env.TEST_REFRESH_SECRET || 'itest-refresh-secret-itest-refresh-0000000000';
}

let WebSocket, prisma, client, redisReady, bcrypt;
let generateToken, emitToChannel, attachWsHub, attachJobWsServer, enqueueJob, _closeRelayForTests;
let userA, userB, tokenA, tokenB;
let server, port;

const uniq = (p) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function wsUrl(path) {
  return `ws://127.0.0.1:${port}${path}`;
}

// Tracks every socket opened by a test so after() can force-close any that a
// failed assertion left dangling (otherwise server.close() hangs forever).
function openWs(path) {
  const ws = new WebSocket(wsUrl(path));
  server.__testSockets.push(ws);
  return ws;
}

// Collects messages on a socket until `predicate` matches one, or times out.
function waitForMessage(ws, predicate, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const seen = [];
    const timer = setTimeout(() => {
      ws.removeListener('message', onMsg);
      reject(new Error(`waitForMessage timed out. Seen: ${JSON.stringify(seen)}`));
    }, timeoutMs);

    function onMsg(raw) {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      seen.push(msg);
      if (predicate(msg)) {
        clearTimeout(timer);
        ws.removeListener('message', onMsg);
        resolve(msg);
      }
    }
    ws.on('message', onMsg);
  });
}

function waitForOpenOrClose(ws) {
  return new Promise((resolve) => {
    let closeInfo = null;
    ws.once('open', () => resolve({ opened: true }));
    ws.once('close', (code, reason) => { closeInfo = { opened: false, code, reason: reason?.toString() }; resolve(closeInfo); });
    ws.once('unexpected-response', (_, res) => resolve({ opened: false, httpStatus: res.statusCode }));
  });
}

before(async () => {
  if (!ENABLED) return;

  WebSocket = require('ws');
  bcrypt    = require('bcrypt');
  prisma    = require('../config/dbConnect');
  ({ client, redisReady } = require('../config/redisConfig'));
  ({ generateToken } = require('../helpers/generateToken'));
  ({ emitToChannel, attachWsHub, _closeRelayForTests } = require('../helpers/ws/hub'));
  ({ attachJobWsServer } = require('../helpers/queue/jobWsServer'));
  ({ enqueueJob } = require('../helpers/queue/jobQueue'));

  await redisReady;

  const uA = uniq('wsit_a');
  const uB = uniq('wsit_b');
  userA = await prisma.user.create({
    data: { userName: uA, email: `${uA}@test.local`, name: 'WS Test A', password: bcrypt.hashSync('x', 4), role: 'user' },
  });
  userB = await prisma.user.create({
    data: { userName: uB, email: `${uB}@test.local`, name: 'WS Test B', password: bcrypt.hashSync('x', 4), role: 'user' },
  });
  tokenA = generateToken(userA);
  tokenB = generateToken(userB);

  // Real production wiring: one http.Server, both hubs attached exactly the
  // way server.js does it (single dispatcher installed inside attachWsHub).
  server = http.createServer((req, res) => { res.writeHead(404); res.end(); });
  server.__testSockets = [];
  attachWsHub(server);
  attachJobWsServer(server);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});

after(async () => {
  if (!ENABLED) return;
  // Defensive: terminate any sockets a failed assertion left open, otherwise
  // server.close() would hang forever waiting for them to close on their own.
  for (const ws of server.__testSockets || []) {
    try { ws.terminate(); } catch { /* already closed */ }
  }
  await new Promise((resolve) => server.close(resolve));
  await _closeRelayForTests();
  try {
    await prisma.user.deleteMany({ where: { userName: { startsWith: 'wsit_' } } });
  } catch (err) {
    console.error('[wsit after] cleanup failed:', err.message);
  } finally {
    await prisma.$disconnect();
    client.quit().catch(() => {});
  }
});

// ── F04: connection survives the accept (no duplicate-listener destroy race) ──

test('F04: generic WS connection with a valid token stays open', { skip }, async () => {
  const ws = openWs(`/ws?token=${tokenA}`);
  const result = await waitForOpenOrClose(ws);
  assert.strictEqual(result.opened, true, `expected connection to open, got ${JSON.stringify(result)}`);

  const connected = await waitForMessage(ws, (m) => m.type === 'connected');
  assert.ok(connected);

  // Give the "destroy any unclaimed upgrade" style bug a moment to fire, if present.
  await new Promise((r) => setTimeout(r, 300));
  assert.strictEqual(ws.readyState, WebSocket.OPEN, 'socket must still be open after accept');

  ws.close();
});

// ── F05: fail-closed channel authorization + identity checks ──────────────────

test('F05: user A cannot subscribe to user B\'s channel', { skip }, async () => {
  const ws = openWs(`/ws?token=${tokenA}`);
  await waitForOpenOrClose(ws);
  await waitForMessage(ws, (m) => m.type === 'connected');

  ws.send(JSON.stringify({ type: 'subscribe', channels: [`user:${userB.id}`] }));
  const denied = await waitForMessage(ws, (m) => m.type === 'error' && m.code === 4003);
  assert.match(denied.message, new RegExp(`user:${userB.id}`));

  ws.close();
});

test('F05: user A CAN subscribe to their own channel', { skip }, async () => {
  const ws = openWs(`/ws?token=${tokenA}`);
  await waitForOpenOrClose(ws);
  await waitForMessage(ws, (m) => m.type === 'connected');

  ws.send(JSON.stringify({ type: 'subscribe', channels: [`user:${userA.id}`] }));
  const subscribed = await waitForMessage(ws, (m) => m.type === 'subscribed');
  assert.deepStrictEqual(subscribed.channels, [`user:${userA.id}`]);

  ws.close();
});

test('F05: unknown channel prefix is denied by default (fail-closed)', { skip }, async () => {
  const ws = openWs(`/ws?token=${tokenA}`);
  await waitForOpenOrClose(ws);
  await waitForMessage(ws, (m) => m.type === 'connected');

  ws.send(JSON.stringify({ type: 'subscribe', channels: ['org:some-org-id'] }));
  const denied = await waitForMessage(ws, (m) => m.type === 'error' && m.code === 4003);
  assert.match(denied.message, /org:some-org-id/);

  ws.close();
});

test('F05: deactivated user\'s still-valid JWT is rejected at connect', { skip }, async () => {
  const uD = uniq('wsit_deact');
  const deactivated = await prisma.user.create({
    data: { userName: uD, email: `${uD}@test.local`, name: 'WS Deactivated', password: bcrypt.hashSync('x', 4), role: 'user', active: false },
  });
  const tokenD = generateToken(deactivated);

  const ws = openWs(`/ws?token=${tokenD}`);
  const result = await waitForOpenOrClose(ws);
  // The hub sends an error frame then closes 4001 — by the time we observe
  // 'close' the connection is gone either way.
  if (result.opened) {
    const closed = await new Promise((resolve) => ws.once('close', (code) => resolve(code)));
    assert.strictEqual(closed, 4001);
  } else {
    assert.strictEqual(result.code, 4001);
  }

  await prisma.user.delete({ where: { id: deactivated.id } });
});

test('F05: job hub applies the same ownership + identity checks', { skip }, async () => {
  const { jobId } = await enqueueJob('wsit:test-queue', { hello: 'world' }, { userId: userA.id });

  // Owner (user A) is allowed.
  const wsOwner = openWs(`/ws/jobs/${jobId}?token=${tokenA}`);
  await waitForOpenOrClose(wsOwner);
  const connected = await waitForMessage(wsOwner, (m) => m.type === 'connected');
  assert.deepStrictEqual(connected.channels, [`job:${jobId}`]);
  wsOwner.close();

  // Non-owner (user B) is denied the job channel.
  const wsOther = openWs(`/ws/jobs/${jobId}?token=${tokenB}`);
  await waitForOpenOrClose(wsOther);
  const otherConnected = await waitForMessage(wsOther, (m) => m.type === 'connected');
  assert.deepStrictEqual(otherConnected.channels, [], 'non-owner must not be auto-subscribed to the job channel');
  wsOther.close();
});

// ── F06: relay dispatch reaches ALL hubs, not just the first one attached ────
//
// server.js attaches the generic hub FIRST and the job hub SECOND. Under the
// original bug the Redis pub/sub callback closed over only the first hub's
// WebSocketServer, so the job hub (second-attached) never received ANY relay
// dispatch, even for its own job:<jobId> channel. We verify BOTH hubs still
// receive their own authorized channel's messages: the generic hub via
// `user:<id>` (its own default-authorized channel) and the job hub via
// `job:<jobId>` (its ownership-authorized channel) — each subscription
// legitimate under each hub's own authorization rules (not bypassing F05).
test('F06: both generic and job-specific sockets receive an emitToChannel publish', { skip }, async () => {
  const { jobId } = await enqueueJob('wsit:test-queue', { hello: 'world' }, { userId: userA.id });

  const wsGeneric = openWs(`/ws?token=${tokenA}`);
  await waitForOpenOrClose(wsGeneric);
  await waitForMessage(wsGeneric, (m) => m.type === 'connected');
  wsGeneric.send(JSON.stringify({ type: 'subscribe', channels: [`user:${userA.id}`] }));
  await waitForMessage(wsGeneric, (m) => m.type === 'subscribed');

  const wsJob = openWs(`/ws/jobs/${jobId}?token=${tokenA}`);
  await waitForOpenOrClose(wsJob);
  await waitForMessage(wsJob, (m) => m.type === 'connected'); // initial snapshot (job pending)

  try {
    const marker = `relay-check-${Date.now()}`;
    await Promise.all([
      emitToChannel(`user:${userA.id}`, { marker, via: 'generic' }),
      emitToChannel(`job:${jobId}`, { jobId, status: 'processing', progress: 42, marker, via: 'job' }),
    ]);

    const [genMsg, jobMsg] = await Promise.all([
      waitForMessage(wsGeneric, (m) => m.type === 'event' && m.payload?.marker === marker),
      waitForMessage(wsJob, (m) => m.type === 'event' && m.payload?.marker === marker),
    ]);
    assert.strictEqual(genMsg.payload.via, 'generic');
    assert.strictEqual(jobMsg.payload.via, 'job');
    assert.strictEqual(jobMsg.payload.progress, 42);
  } finally {
    wsGeneric.close();
    wsJob.close();
  }
});
