/**
 * Rate-limit middleware factory.
 *
 * Pre-built limiters (tune windowMs/max as needed):
 *   loginLimiter      — 5 req / 15 min per IP+userName (auth brute-force protection)
 *   otpSendLimiter    — 3 req / 1 hr   (OTP / forgot-password abuse)
 *   refreshLimiter    — 20 req / 15 min (refresh-token brute force)
 *   generalLimiter    — 200 req / min per authenticated user
 *
 * For custom limiters: use createLimiter({ windowMs, max, keyGenerator? })
 *
 * Store: Redis-backed (rate-limit-redis) — limits shared across all PM2 cluster
 * workers. Requires the same REDIS_* env vars as the rest of the app. If Redis is
 * temporarily unavailable the store degrades to an in-process sliding window
 * (per-instance only) instead of hanging or 500-ing every request.
 */
const rateLimit   = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RedisStore: RateLimitRedisStore } = require('rate-limit-redis');
const apiResponse = require('../helpers/apiResponse');
const { client }  = require('../config/redisConfig');

const RATE_LIMIT_MESSAGE = apiResponse.response('RATE_LIMIT_EXCEEDED');

// Hybrid store: delegate to Redis when connected, else slide-window in memory.
// Prevents two failure modes: (1) hanging on buffered Redis commands while the
// client reconnects, (2) 500s when the store rejects mid-request.
class HybridStore {
  constructor(windowMs, prefix) {
    this.windowMs         = windowMs;
    this.mem              = new Map();
    this.redisUp          = false;
    this.redisInitialized = false;
    this.warnedMem        = false;
    this.redisStore = new RateLimitRedisStore({
      // NOTE: rate-limit-redis spreads the command as SEPARATE args
      // (`sendCommandFn(...command)`) — the wrapper must collect variadic args.
      sendCommand: async (...command) => client.sendCommand(command),
      prefix:      prefix || 'rl:',
    });
  }

  // express-rate-limit calls store.init(options) at limiter creation — must
  // forward so the RedisStore EVAL script is loaded and windowMs is set.
  async init(options) {
    this.windowMs = options.windowMs;
    this.mem       = new Map();
    if (this.redisUp) {
      await this._ensureRedisStoreInit();
    }
  }

  async _ensureRedisStoreInit() {
    if (this.redisInitialized) return;
    try {
      await this.redisStore.init({ windowMs: this.windowMs });
      this.redisInitialized = true;
    } catch (err) {
      this._fallbackLog(err);
    }
  }

  _syncRedisStatus() {
    const up = client.isReady;
    if (up && !this.redisUp) {
      // Back to Redis — clear the memory window so counters don't double-count.
      this.mem.clear();
    }
    this.redisUp = up;
  }

  async increment(key) {
    this._syncRedisStatus();
    if (this.redisUp) {
      await this._ensureRedisStoreInit();
      try { return await this.redisStore.increment(key); }
      catch (err) { this._fallbackLog(err); }
    }
    return this._memIncrement(key);
  }

  async decrement(key) {
    this._syncRedisStatus();
    if (this.redisUp) {
      try { return await this.redisStore.decrement(key); } catch { /* ignore */ }
    }
    const rec = this.mem.get(key);
    if (rec && rec.totalHits > 0) rec.totalHits -= 1;
    return { totalHits: rec?.totalHits || 0, resetTime: new Date(rec?.resetTime || Date.now()) };
  }

  async resetKey(key) {
    this._syncRedisStatus();
    this.mem.delete(key);
    if (this.redisUp) { try { await this.redisStore.resetKey(key); } catch { /* ignore */ } }
  }

  async resetAll() {
    this._syncRedisStatus();
    this.mem.clear();
    if (this.redisUp) { try { await this.redisStore.resetAll(); } catch { /* ignore */ } }
  }

  _fallbackLog(err) {
    if (!this.warnedMem) {
      this.warnedMem = true;
      console.warn(`[rateLimit] Redis unavailable (${err.message}) — using in-memory fallback until reconnect.`);
    }
  }

  _memIncrement(key) {
    const now = Date.now();
    let rec   = this.mem.get(key);
    if (!rec || rec.resetTime <= now) {
      rec = { totalHits: 0, resetTime: now + this.windowMs };
    }
    rec.totalHits += 1;
    this.mem.set(key, rec);
    return { totalHits: rec.totalHits, resetTime: new Date(rec.resetTime) };
  }
}

function createLimiter({ windowMs, max, keyGenerator, prefix }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    message:         RATE_LIMIT_MESSAGE,
    store:           new HybridStore(windowMs, prefix),
    ...(keyGenerator ? { keyGenerator } : {}),
  });
}

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max:      5,
  prefix:   'rl:login:',
  // Hybrid key: IP + normalized userName. Prevents an office NAT (one IP) from
  // locking everyone out after 5 total failures, and keeps the bare-IP key from
  // colliding with other limiters' counters (each limiter has its own prefix).
  keyGenerator: (req) => {
    const userKey = String(req.body?.userName || 'anonymous').toLowerCase().trim() || 'anonymous';
    return `${ipKeyGenerator(req.ip)}:${userKey}`;
  },
});

const otpSendLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max:      3,
  prefix:   'rl:otp:',
});

// Refresh endpoint brute-force guard (refresh tokens live 7d — must be rate-limited).
const refreshLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max:      20,
  prefix:   'rl:refresh:',
});

const generalLimiter = createLimiter({
  windowMs:     60 * 1000,
  max:          200,
  prefix:       'rl:general:',
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
});

module.exports = { loginLimiter, otpSendLimiter, refreshLimiter, generalLimiter, createLimiter };
