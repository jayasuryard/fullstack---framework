// Unit tests for helpers/apiResponse.js — no DB/Redis required.
const test = require('node:test');
const assert = require('node:assert/strict');
const apiResponse = require('../helpers/apiResponse');

test('SUCCESS returns envelope with code 1000', () => {
  const res = apiResponse.response('SUCCESS', { rows: [1] });
  assert.equal(res.responseCode, 1000);
  assert.equal(res.responseMessage, 'Operation completed successfully.');
  assert.deepEqual(res.responseData.result, { rows: [1] });
});

test('unknown key returns code -1 instead of throwing', () => {
  const res = apiResponse.response('NOT_A_REAL_KEY', { a: 1 });
  assert.equal(res.responseCode, -1);
  assert.deepEqual(res.responseData.result, { a: 1 });
});

test('default data is empty object', () => {
  const res = apiResponse.response('SUCCESS');
  assert.deepEqual(res.responseData.result, {});
});
