// Contract check for scripts/generatePostman.js — NOT a full test suite.
// Actually executes a couple of the collection's generated example request bodies
// against a running instance of the app, confirming they don't fail with a 400
// VALIDATION_ERROR purely because the generated example body is malformed
// (missing required fields, wrong shape, etc).
//
// Enable with:  RUN_INTEGRATION=1 npm run test:integration
// (or set TEST_DATABASE_URL). Skips cleanly when infra is absent, same as
// tests/auth.integration.test.js.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');

const ENABLED = process.env.RUN_INTEGRATION === '1' || !!process.env.TEST_DATABASE_URL;
const skip    = ENABLED ? false : 'integration infra not configured (set RUN_INTEGRATION=1)';

if (ENABLED) {
  process.env.DATABASE_URL   = process.env.TEST_DATABASE_URL || 'postgresql://postgres:test@localhost:55432/framework?schema=public';
  process.env.REDIS_HOST     = process.env.TEST_REDIS_HOST || '127.0.0.1';
  process.env.REDIS_PORT     = process.env.TEST_REDIS_PORT || '56379';
  process.env.JWT_SECRET     = process.env.TEST_JWT_SECRET || 'itest-jwt-secret-itest-jwt-secret-0000000000';
  process.env.REFRESH_SECRET = process.env.TEST_REFRESH_SECRET || 'itest-refresh-secret-itest-refresh-0000000000';
  process.env.REFRESH_EXPIRY = '7d';
  process.env.SMTP_HOST      = '';
  process.env.TRUST_PROXY    = '1';
}

let express, supertest, prisma, client, redisReady, routes, apiResponse, generatePostman;
let request;

function buildApp() {
  const app = express();
  app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', routes);
  app.use('/api/v1', (req, res) => apiResponse.send(res, 'NOT_FOUND'));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    return apiResponse.send(res, 'SERVER_ERROR');
  });
  return app;
}

before(async () => {
  if (!ENABLED) return;
  express         = require('express');
  supertest       = require('supertest');
  prisma          = require('../config/dbConnect');
  ({ client, redisReady } = require('../config/redisConfig'));
  routes          = require('../routes');
  apiResponse     = require('../helpers/apiResponse');
  generatePostman = require('../scripts/generatePostman');

  await redisReady;
  request = supertest(buildApp());
});

after(async () => {
  if (!ENABLED) return;
  await client.flushDb().catch(() => {});
  await prisma.$disconnect();
  client.quit().catch(() => {});
});

function findRequest(collection, name) {
  for (const folder of collection.item) {
    const found = folder.item.find((it) => it.name === name);
    if (found) return found;
  }
  throw new Error(`No generated request named "${name}" found in the collection`);
}

test('generated Login example body passes validation (real mount path + real schema)', { skip }, async () => {
  const { outputFile } = generatePostman.generate();
  const collection = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const loginReq = findRequest(collection, 'Login');

  assert.match(loginReq.request.url.raw, /\/api\/v1\/common\/auth\/login$/,
    'generated Login URL must include the real "/common" mount prefix');

  const body = JSON.parse(loginReq.request.body.raw);
  const res = await request.post('/api/v1/common/auth/login').send(body);

  // Credentials are fabricated, so a 401 (bad credentials) is expected and fine —
  // the contract we're checking is that the body clears validation (no 400).
  assert.notEqual(res.status, 400, `Login example body failed validation: ${JSON.stringify(res.body)}`);
});

test('generated Forgot Password example body passes validation', { skip }, async () => {
  const { outputFile } = generatePostman.generate();
  const collection = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const forgotReq = findRequest(collection, 'Forgot Password');

  assert.match(forgotReq.request.url.raw, /\/api\/v1\/common\/auth\/forgot-password$/);

  const body = JSON.parse(forgotReq.request.body.raw);
  const res = await request.post('/api/v1/common/auth/forgot-password').send(body);

  assert.notEqual(res.status, 400, `Forgot Password example body failed validation: ${JSON.stringify(res.body)}`);
});
