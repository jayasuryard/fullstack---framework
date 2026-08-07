// Unit tests for helpers/paginate.js — no DB/Redis required.
const test = require('node:test');
const assert = require('node:assert/strict');
const paginate = require('../helpers/paginate');

test('defaults to page 1 limit 20', () => {
  const { skip, take, meta } = paginate({});
  assert.equal(skip, 0);
  assert.equal(take, 20);
  const m = meta(45);
  assert.equal(m.totalPages, 3);
  assert.equal(m.hasNext, true);
  assert.equal(m.hasPrev, false);
});

test('clamps page/limit', () => {
  const a = paginate({ page: '0', limit: '500' });
  assert.equal(a.skip, 0);
  assert.equal(a.take, 100);
  const b = paginate({ page: '-3', limit: '0' });
  assert.equal(b.skip, 0);
  assert.equal(b.take, 20);
});

test('computes skip from page/limit', () => {
  const { skip, take } = paginate({ page: '3', limit: '10' });
  assert.equal(skip, 20);
  assert.equal(take, 10);
});

test('meta on last page has no next', () => {
  const { meta } = paginate({ page: '2', limit: '20' });
  const m = meta(40);
  assert.equal(m.totalPages, 2);
  assert.equal(m.hasNext, false);
  assert.equal(m.hasPrev, true);
});
