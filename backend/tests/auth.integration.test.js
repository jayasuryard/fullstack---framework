// Auth integration tests (supertest) — run against a REAL Postgres + Redis.
// These cover the security-critical paths: login, refresh rotation, tokenVersion
// revocation, lockout, OTP reset flow, validation, upload filtering, HTTP statuses.
//
// Enable with:  RUN_INTEGRATION=1 npm run test:integration
// (or set TEST_DATABASE_URL). Skips cleanly when infra is absent so plain `npm test`
// still passes in CI without a database.
const { test, before, after } = require('node:test');
const assert = require('node:assert');

const ENABLED = process.env.RUN_INTEGRATION === '1' || !!process.env.TEST_DATABASE_URL;
const skip    = ENABLED ? false : 'integration infra not configured (set RUN_INTEGRATION=1)';

if (ENABLED) {
  // ── Env must be set BEFORE any infra module is required ─────────────────────
  process.env.DATABASE_URL     = process.env.TEST_DATABASE_URL || 'postgresql://postgres:test@localhost:55432/framework?schema=public';
  process.env.REDIS_HOST       = process.env.TEST_REDIS_HOST || '127.0.0.1';
  process.env.REDIS_PORT       = process.env.TEST_REDIS_PORT || '56379';
  process.env.JWT_SECRET       = process.env.TEST_JWT_SECRET || 'itest-jwt-secret-itest-jwt-secret-0000000000';
  process.env.REFRESH_SECRET   = process.env.TEST_REFRESH_SECRET || 'itest-refresh-secret-itest-refresh-0000000000';
  process.env.REFRESH_EXPIRY   = '7d';
  process.env.SMTP_HOST        = ''; // dev email mode (logs OTP, doesn't send)
  process.env.TRUST_PROXY      = '1';
}

// Infra modules are required LAZILY inside before() so that a plain `npm test`
// (RUN_INTEST not set) never loads them: connecting Redis/Postgres would keep the
// event loop alive and hang the unit-test run.
let express, supertest, bcrypt, multer;
let prisma, client, redisReady, routes, apiResponse;
let request;
let admin;          // seeded user
let adminPassword;

function buildApp() {
  const app = express();
  app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', routes);
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/health/deep', async (req, res) => {
    const [db, redis] = await Promise.allSettled([prisma.$queryRaw`SELECT 1`, client.ping()]);
    const ok = db.status === 'fulfilled' && redis.status === 'fulfilled';
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded' });
  });
  app.use('/api/v1', (req, res) => apiResponse.send(res, 'NOT_FOUND'));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    // Mirror server.js: upload rejections and oversized payloads are client errors.
    if (err instanceof multer.MulterError || err.type === 'entity.too.large') {
      return apiResponse.send(res, 'INVALID_REQUEST', { message: err.message });
    }
    console.error('[test app]', err);
    return apiResponse.send(res, 'SERVER_ERROR');
  });
  return app;
}

const uniq = (p) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const userFor = (p) => {
  const userName = uniq(p);
  return { userName, name: 'Integration Test', email: `${userName}@test.local`, password: 'Str0ng!Passw0rd' };
};

before(async () => {
  if (!ENABLED) return;
  express     = require('express');
  supertest   = require('supertest');
  bcrypt      = require('bcrypt');
  multer      = require('multer');
  prisma      = require('../config/dbConnect');
  ({ client, redisReady } = require('../config/redisConfig'));
  routes      = require('../routes');
  apiResponse = require('../helpers/apiResponse');

  await redisReady;
  await client.flushDb();

  // Seed one user for the happy-path flows.
  admin = userFor('itest_admin');
  adminPassword = admin.password;
  await prisma.user.create({
    data: {
      userName: admin.userName,
      email:    admin.email,
      name:     admin.name,
      password: bcrypt.hashSync(admin.password, 12),
      role:     'admin',
    },
  });

  request = supertest(buildApp());
});

after(async () => {
  if (!ENABLED) return;
  try {
    // RefreshToken rows reference users (FK) — delete children first.
    await prisma.refreshToken.deleteMany({ where: { user: { userName: { startsWith: 'itest_' } } } });
    await prisma.user.deleteMany({ where: { userName: { startsWith: 'itest_' } } });
  } catch (err) {
    console.error('[itest after] cleanup failed:', err.message);
  } finally {
    await client.flushDb().catch(() => {});
    await prisma.$disconnect();
    client.quit().catch(() => {});
  }
});

const withIp = (ip) => ({
  post: (url) => request.post(url).set('X-Forwarded-For', ip),
});

// ── HTTP semantics ─────────────────────────────────────────────────────────────

test('unknown API route → 404 JSON envelope', { skip }, async () => {
  const res = await request.get('/api/v1/definitely-not-a-route');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.responseCode, 1004);
});

test('health/deep → 200 when DB + Redis answer', { skip }, async () => {
  const res = await request.get('/health/deep');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('validation: missing password → 400 + 1006', { skip }, async () => {
  const res = await request.post('/api/v1/common/auth/login').send({ userName: 'x' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.responseCode, 1006);
});

// ── Login / me ─────────────────────────────────────────────────────────────────

test('login: unknown user → 401 (anti-enumeration timing burn)', { skip }, async () => {
  const res = await request.post('/api/v1/common/auth/login')
    .send({ userName: uniq('itest_ghost'), password: 'whatever' });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.responseCode, 1002);
});

test('login: wrong password → 401', { skip }, async () => {
  const res = await request.post('/api/v1/common/auth/login')
    .send({ userName: admin.userName, password: 'WrongPass!' });
  assert.strictEqual(res.status, 401);
});

test('login + me: success flow', { skip }, async () => {
  const login = await request.post('/api/v1/common/auth/login')
    .send({ userName: admin.userName, password: adminPassword });
  assert.strictEqual(login.status, 200);
  assert.strictEqual(login.body.responseCode, 1000);
  assert.ok(login.body.responseData.result.token);
  assert.ok(login.body.responseData.result.refreshToken);
  assert.strictEqual(login.body.responseData.result.user.email, admin.email);

  const me = await request.get('/api/v1/common/auth/me')
    .set('Authorization', `Bearer ${login.body.responseData.result.token}`);
  assert.strictEqual(me.status, 200);
  assert.strictEqual(me.body.responseData.result.email, admin.email);
});

test('login: deactivated account → 403', { skip }, async () => {
  const u = userFor('itest_inactive');
  await prisma.user.create({
    data: {
      userName: u.userName, email: u.email, name: u.name,
      password: bcrypt.hashSync(u.password, 12), role: 'admin', active: false,
    },
  });
  const res = await request.post('/api/v1/common/auth/login')
    .send({ userName: u.userName, password: u.password });
  assert.strictEqual(res.status, 403);
});

// ── Lockout ────────────────────────────────────────────────────────────────────

test('lockout: 5 consecutive failures → 429', { skip }, async () => {
  const u = userFor('itest_lock');
  await prisma.user.create({
    data: {
      userName: u.userName, email: u.email, name: u.name,
      password: bcrypt.hashSync(u.password, 12), role: 'admin',
    },
  });
  const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  let last;
  for (let i = 0; i < 6; i += 1) {
    last = await withIp(ip).post('/api/v1/common/auth/login')
      .send({ userName: u.userName, password: 'NopeWrong!' });
  }
  assert.strictEqual(last.status, 429);
  // Service lockout (1008) or route limiter (1011) — both are correct 429 paths.
  assert.ok([1008, 1011].includes(last.body.responseCode), `got ${last.body.responseCode}`);
});

// ── Refresh rotation ───────────────────────────────────────────────────────────

test('refresh: rotation revokes old token, new pair works', { skip }, async () => {
  const login = await request.post('/api/v1/common/auth/login')
    .send({ userName: admin.userName, password: adminPassword });
  const { token, refreshToken } = login.body.responseData.result;

  const refresh = await request.post('/api/v1/common/auth/refresh')
    .send({ refreshToken });
  assert.strictEqual(refresh.status, 200);
  const { token: newToken, refreshToken: newRefresh } = refresh.body.responseData.result;

  // Old refresh token must now be revoked → rejected.
  const replay = await request.post('/api/v1/common/auth/refresh').send({ refreshToken });
  assert.strictEqual(replay.status, 401);

  // New pair works.
  const me = await request.get('/api/v1/common/auth/me').set('Authorization', `Bearer ${newToken}`);
  assert.strictEqual(me.status, 200);
  const again = await request.post('/api/v1/common/auth/refresh').send({ refreshToken: newRefresh });
  assert.strictEqual(again.status, 200);
});

test('refresh: garbage token → 401', { skip }, async () => {
  const res = await request.post('/api/v1/common/auth/refresh').send({ refreshToken: 'not-a-real-token' });
  assert.strictEqual(res.status, 401);
});

// ── Logout / tokenVersion ──────────────────────────────────────────────────────

test('logout: revokes all sessions, tokenVersion invalidates access token', { skip }, async () => {
  const u = userFor('itest_logout');
  await prisma.user.create({
    data: {
      userName: u.userName, email: u.email, name: u.name,
      password: bcrypt.hashSync(u.password, 12), role: 'admin',
    },
  });
  const login = await request.post('/api/v1/common/auth/login')
    .send({ userName: u.userName, password: u.password });
  const { token, refreshToken } = login.body.responseData.result;

  // Second device.
  const login2 = await request.post('/api/v1/common/auth/login')
    .send({ userName: u.userName, password: u.password });
  const token2 = login2.body.responseData.result.token;

  const out = await request.post('/api/v1/common/auth/logout')
    .set('Authorization', `Bearer ${token}`)
    .send({ refreshToken });
  assert.strictEqual(out.status, 200);

  // Old access token dead (tokenVersion bumped).
  const me = await request.get('/api/v1/common/auth/me').set('Authorization', `Bearer ${token2}`);
  assert.strictEqual(me.status, 401);

  // All refresh tokens revoked.
  const refresh = await request.post('/api/v1/common/auth/refresh')
    .send({ refreshToken: login2.body.responseData.result.refreshToken });
  assert.strictEqual(refresh.status, 401);
});

// ── Forgot / reset password ────────────────────────────────────────────────────

test('forgot-password: unknown email → 200 same message (no enumeration)', { skip }, async () => {
  const res = await request.post('/api/v1/common/auth/forgot-password')
    .send({ email: 'nobody@nowhere.invalid' });
  assert.strictEqual(res.status, 200);
  assert.match(res.body.responseData.result.message, /If that email exists/);
});

test('reset-password: full OTP flow (wrong OTP → cap → correct OTP → login)', { skip }, async () => {
  const u = userFor('itest_reset');
  await prisma.user.create({
    data: {
      userName: u.userName, email: u.email, name: u.name,
      password: bcrypt.hashSync(u.password, 12), role: 'admin',
    },
  });
  const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;

  await withIp(ip).post('/api/v1/common/auth/forgot-password').send({ email: u.email });

  // OTP is stored hashed in Redis — read it, we can't see it in the email log.
  const storedHash = await client.get(`auth:reset:otp:${u.email.toLowerCase()}`);
  assert.ok(storedHash, 'OTP hash should exist in Redis');

  // Wrong OTP → 400, and it consumes the per-email attempt budget. Each attempt
  // uses a fresh XFF IP so the route-level otpSendLimiter (3/hr/IP) stays out of
  // the way — the email-bound budget is what we're testing here.
  for (let i = 0; i < 5; i += 1) {
    const bad = await withIp(`198.51.100.${200 + i}`).post('/api/v1/common/auth/reset-password')
      .send({ email: u.email, otp: '000000', newPassword: 'AnotherStr0ng!' });
    assert.strictEqual(bad.status, 400);
  }
  // Budget exhausted → rejected even before checking the OTP.
  const capped = await withIp('198.51.100.210').post('/api/v1/common/auth/reset-password')
    .send({ email: u.email, otp: '000000', newPassword: 'AnotherStr0ng!' });
  assert.strictEqual(capped.status, 400);
  assert.match(capped.body.responseData.result.message, /Too many attempts/);

  // The resend cooldown (F01 fix) intentionally blocks a same-account resend
  // within 60s — without it, an attacker could call forgot-password again to
  // reset the attempt budget and keep grinding the OTP. Simulate the cooldown
  // having elapsed rather than waiting 60s in-test.
  await client.del(`auth:reset:resend:${u.email.toLowerCase()}`);

  // Fresh OTP → fresh budget → correct reset.
  await withIp('198.51.100.211').post('/api/v1/common/auth/forgot-password').send({ email: u.email });
  const hash2 = await client.get(`auth:reset:otp:${u.email.toLowerCase()}`);
  assert.ok(hash2);

  // Recover the OTP by brute-forcing the 10^6 digit space against its sha256
  // (~1M hashes, a fraction of a second locally).
  const crypto = require('node:crypto');
  let realOtp = null;
  for (let i = 0; i < 1000000 && !realOtp; i += 1) {
    const cand = String(i).padStart(6, '0');
    if (crypto.createHash('sha256').update(cand).digest('hex') === hash2) realOtp = cand;
  }
  assert.ok(realOtp, 'should recover the OTP from its hash');

  const ok = await withIp('198.51.100.212').post('/api/v1/common/auth/reset-password')
    .send({ email: u.email, otp: realOtp, newPassword: 'BrandNew!Pass1' });
  assert.strictEqual(ok.status, 200);

  // New password works, old password does not.
  const oldLogin = await request.post('/api/v1/common/auth/login')
    .send({ userName: u.userName, password: u.password });
  assert.strictEqual(oldLogin.status, 401);
  const newLogin = await request.post('/api/v1/common/auth/login')
    .send({ userName: u.userName, password: 'BrandNew!Pass1' });
  assert.strictEqual(newLogin.status, 200);
});

// ── Upload filtering ───────────────────────────────────────────────────────────

test('upload: svg rejected → 400 even with a valid token', { skip }, async () => {
  const login = await request.post('/api/v1/common/auth/login')
    .send({ userName: admin.userName, password: adminPassword });
  const token = login.body.responseData.result.token;

  const res = await request.post('/api/v1/common/auth/profile/update')
    .set('Authorization', `Bearer ${token}`)
    .attach('photo', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), {
      filename: 'evil.svg',
      contentType: 'image/svg+xml',
    });
  assert.strictEqual(res.status, 400);
});
