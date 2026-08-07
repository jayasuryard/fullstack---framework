// Unit tests for helpers/emailService.js — dev mode (no SMTP_HOST) only.
const test = require('node:test');
const assert = require('node:assert/strict');

// Ensure SMTP is NOT configured so the service runs in dev mode.
delete process.env.SMTP_HOST;

const { sendMail, sendPasswordResetOtp } = require('../helpers/emailService');

test('dev mode returns sent:false dev:true without throwing', async () => {
  const result = await sendMail('a@b.com', 'Subj', '<p>Body</p>', 'Body');
  assert.equal(result.sent, false);
  assert.equal(result.dev, true);
});

test('sendPasswordResetOtp works in dev mode', async () => {
  const result = await sendPasswordResetOtp('a@b.com', '123456', 10);
  assert.equal(result.dev, true);
  assert.equal(result.sent, false);
});
