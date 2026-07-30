/**
 * Rate-limit middleware factory.
 *
 * Pre-built limiters (tune windowMs/max as needed):
 *   loginLimiter          — 5 req / 15 min (auth brute-force protection)
 *   otpSendLimiter        — 3 req / 1 hr   (OTP / forgot-password abuse)
 *   generalLimiter        — 200 req / min per authenticated user
 *
 * For custom limiters: use createLimiter({ windowMs, max, keyGenerator? })
 *
 * Note: Uses in-memory store by default. In a PM2 cluster (instances: "max"),
 * each worker process maintains its own counter — effective limit per IP is
 * max × worker_count. For shared limits across workers, swap the store for
 * a Redis-backed store (e.g., rate-limit-redis).
 */
const rateLimit   = require('express-rate-limit');
const apiResponse = require('../helpers/apiResponse');

const RATE_LIMIT_MESSAGE = apiResponse.response('RATE_LIMIT_EXCEEDED');

function createLimiter({ windowMs, max, keyGenerator }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    message:         RATE_LIMIT_MESSAGE,
    ...(keyGenerator ? { keyGenerator } : {}),
  });
}

const loginLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

const otpSendLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

const generalLimiter = createLimiter({
  windowMs:      60 * 1000,
  max:           200,
  keyGenerator:  (req, ipKeyGenerator) => req.user?.id || ipKeyGenerator(req),
});

module.exports = { loginLimiter, otpSendLimiter, generalLimiter, createLimiter };
