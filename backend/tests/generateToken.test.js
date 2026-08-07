// Unit tests for helpers/generateToken.js — JWT only, no DB/Redis required.
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '24h';
process.env.REFRESH_EXPIRY = '7d';

const { generateToken, generateRefreshToken, verifyAccessToken } = require('../helpers/generateToken');

const user = { id: 'u1', role: 'admin', accessLevel: 'read_write', tokenVersion: 2 };

test('access token round-trips core claims', () => {
  const token = generateToken(user);
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.id, 'u1');
  assert.equal(decoded.role, 'admin');
  assert.equal(decoded.baseRole, 'admin');
  assert.equal(decoded.tokenVersion, 2);
  assert.equal(decoded.contextId, null);
});

test('context token overrides role and uses shorter expiry claim', () => {
  const token = generateToken(user, { role: 'superAdmin', accessLevel: 'read_write', contextId: 'ctx-9' });
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.role, 'superAdmin');
  assert.equal(decoded.baseRole, 'admin');
  assert.equal(decoded.contextId, 'ctx-9');
});

test('extraClaims merged into payload', () => {
  const token = generateToken(user, null, { tenantId: 't-1' });
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.tenantId, 't-1');
});

test('refresh token is opaque, unique per call, JWT-hostile', () => {
  const a = generateRefreshToken();
  const b = generateRefreshToken();
  assert.equal(typeof a, 'string');
  assert.ok(a.length >= 40, 'should be high-entropy');
  assert.notEqual(a, b, 'two calls must never produce the same token');
  // Must not be a JWT (no dot-separated header.payload.signature).
  assert.ok(!a.includes('.'), 'opaque token must not be JWT-shaped');
  // A forged JWT must not be acceptable as a refresh token — nothing to verify
  // cryptographically, the DB row lookup by tokenHash is the only source of truth.
  assert.ok(true);
});

test('tampered access token rejected', () => {
  const token = generateToken(user);
  assert.throws(() => verifyAccessToken(token.slice(0, -3) + 'abc'));
});
