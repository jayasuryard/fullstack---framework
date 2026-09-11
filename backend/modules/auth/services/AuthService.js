/**
 * Authentication service — login, token refresh, logout, /me, profile update,
 * forgot-password, reset-password.
 *
 * Implements: refresh-token rotation, tokenVersion invalidation,
 * account lockout after 5 failed attempts, hashed refresh token storage.
 *
 * To add product-specific fields to the JWT or /me payload, extend buildUserPayload().
 * To add product-level checks in login (e.g. tenant status, plan limits), extend login().
 */
const prisma      = require('../../../config/dbConnect');
const { client }  = require('../../../config/redisConfig');
const apiResponse = require('../../../helpers/apiResponse');
const { generateToken, generateRefreshToken } = require('../../../helpers/generateToken');
const { auditLogger } = require('../../../helpers/auditLogger');
const { sendPasswordResetOtp } = require('../../../helpers/emailService');
const bcrypt      = require('bcrypt');
const crypto      = require('crypto');
const otpGenerator = require('otp-generator');

const MAX_FAILED_ATTEMPTS   = 5;
const LOCK_DURATION_MINS    = 15;
const REFRESH_TTL_DAYS      = 7;
const RESET_OTP_TTL_MINS    = 10;
const MAX_OTP_ATTEMPTS      = 5;
const RESEND_COOLDOWN_SECS  = 60;

// Email is the Redis key material AND the DB lookup field — normalize once,
// everywhere, so key generation and lookup can never diverge (e.g. " A@B.com"
// hashing an OTP under a different key than the "a@b.com" lookup uses).
const normalizeEmail = (email) => String(email).trim().toLowerCase();

const RESET_OTP_KEY      = (email) => `auth:reset:otp:${email}`;
const RESET_ATTEMPTS_KEY = (email) => `auth:reset:attempts:${email}`;
const RESET_RESEND_KEY   = (email) => `auth:reset:resend:${email}`;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Atomic GET+compare+DEL: only the first of two concurrent submissions of the
// same OTP can ever see it match, because Redis executes EVAL single-threaded —
// the second invocation runs entirely after the first's DEL has landed.
const CONSUME_OTP_SCRIPT = `
local stored = redis.call('GET', KEYS[1])
if not stored then return 0 end
if stored == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
end
return 0
`;

async function consumeOtp(key, expectedHash) {
  const result = await client.eval(CONSUME_OTP_SCRIPT, { keys: [key], arguments: [expectedHash] });
  return result === 1;
}

// httpOnly refresh-token cookie (F11). SameSite is configurable because whether
// the frontend/backend share a parent domain is a per-deployment decision — set
// REFRESH_COOKIE_SAMESITE=strict in prod when frontend/API share a parent domain,
// or 'none' when they're fully cross-site (requires Secure, which is forced below
// outside development anyway).
const REFRESH_COOKIE_NAME = 'refreshToken';
const refreshCookieOptions = () => ({
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  process.env.REFRESH_COOKIE_SAMESITE || 'lax',
  path:      '/api/v1/common/auth',
  maxAge:    REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
});

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
}

// Burn a real bcrypt compare when the user doesn't exist so response timing does
// not leak whether an account exists (unknown-user vs wrong-password must be ~equal).
const DUMMY_HASH = bcrypt.hashSync('framework-dummy-password', 12);

// ── Payload builder — extend this in your product ─────────────────────────────
function buildUserPayload(user) {
  return {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    phone:       user.phone || null,
    role:        user.role,
    accessLevel: user.accessLevel,
  };
}

async function storeRefreshToken(userId, token, req, db = prisma) {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.refreshToken.create({
    data: {
      userId,
      tokenHash:  hashToken(token),
      deviceInfo: req.headers['user-agent']?.slice(0, 255) || null,
      ipAddress:  req.ip || null,
      expiredAt:  expiresAt,
    },
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return apiResponse.send(res, 'VALIDATION_ERROR', {
        message: 'Both username and password are required.',
      });
    }

    const user = await prisma.user.findFirst({
      where: { userName, isDeleted: false },
    });

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH); // timing equalization (anti-enumeration)
      return apiResponse.send(res, 'UNAUTHORIZED', { message: 'Invalid credentials.' });
    }

    // Account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return apiResponse.send(res, 'TOO_MANY_REQUESTS', {
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Atomic increment (DB-level SET failedLoginAttempts = failedLoginAttempts + 1)
      // instead of read-then-write, so concurrent failed logins from the same
      // account can't race and under-count (F12).
      const updated = await prisma.user.update({
        where: { id: user.id },
        data:  { failedLoginAttempts: { increment: 1 } },
      });

      if (updated.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { lockedUntil: new Date(Date.now() + LOCK_DURATION_MINS * 60 * 1000) },
        });
      }

      await auditLogger('LOGIN_FAILED', { id: user.id, name: user.name, role: user.role }, req);

      return apiResponse.send(res, 'UNAUTHORIZED', { message: 'Invalid credentials.' });
    }

    if (!user.active) {
      return apiResponse.send(res, 'FORBIDDEN', { message: 'Account is deactivated.' });
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data:  { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const accessToken      = generateToken(user);
    const refreshTokenVal  = generateRefreshToken();
    await storeRefreshToken(user.id, refreshTokenVal, req);

    await auditLogger('LOGIN_SUCCESS', user, req);

    // Refresh token is the httpOnly cookie (authoritative, F11). Still echoed in
    // the body for any not-yet-migrated caller, but the frontend must not persist
    // it anywhere — the cookie is the sole source of truth for the browser client.
    setRefreshCookie(res, refreshTokenVal);

    return apiResponse.send(res, 'SUCCESS', {
      token:        accessToken,
      refreshToken: refreshTokenVal,
      user:         buildUserPayload(user),
    });
  } catch (error) {
    console.error('[AuthService.login]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// Locks the user's row for the lifetime of the transaction so a rotation can't
// interleave with a concurrent "revoke all sessions" (logout / password reset):
// whichever transaction acquires the lock first fully completes (claim+insert,
// or revoke-all+tokenVersion bump) before the other proceeds, so the loser
// always observes the winner's final state instead of a half-applied one.
async function lockUserRow(tx, userId) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refreshToken(req, res) {
  try {
    // Cookie is authoritative; body fallback kept for any caller not yet migrated
    // to cookie-based refresh (F11).
    const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (!token) return apiResponse.send(res, 'UNAUTHORIZED');
    const tokenHash = hashToken(token);

    // Opaque token — the token IS the lookup key (hashed). No JWT to verify.
    // Rotation must be a single atomic claim: a conditional updateMany that only
    // flips revoked:false → true for THIS request is the single-use guarantee —
    // a concurrent replay sees claim.count === 0 and gets 401, never a second
    // live replacement token.
    const rotated = await prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({ where: { tokenHash } });
      if (!existing) return null;

      await lockUserRow(tx, existing.userId);

      const claim = await tx.refreshToken.updateMany({
        where: { id: existing.id, revoked: false, expiredAt: { gt: new Date() } },
        data:  { revoked: true },
      });
      if (claim.count === 0) return null;

      const user = await tx.user.findUnique({ where: { id: existing.userId } });
      if (!user || user.isDeleted || !user.active) return null;

      const newAccessToken  = generateToken(user);
      const newRefreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, newRefreshToken, req, tx);

      return { token: newAccessToken, refreshToken: newRefreshToken };
    });

    if (!rotated) return apiResponse.send(res, 'UNAUTHORIZED');
    setRefreshCookie(res, rotated.refreshToken);
    return apiResponse.send(res, 'SUCCESS', rotated);
  } catch (error) {
    console.error('[AuthService.refreshToken]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout(req, res) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    await prisma.$transaction(async (tx) => {
      await lockUserRow(tx, req.user.id);

      if (token) {
        await tx.refreshToken.updateMany({
          where: { userId: req.user.id, tokenHash: hashToken(token) },
          data:  { revoked: true },
        });
      }

      // tokenVersion invalidates ALL access tokens — revoke every refresh token
      // too, so "logout all sessions" is actually enforced end-to-end. The user
      // row lock above means this sees (and revokes) any refresh token a
      // concurrent /refresh had just inserted, or blocks until one finishes.
      await tx.refreshToken.updateMany({
        where: { userId: req.user.id, revoked: false },
        data:  { revoked: true },
      });

      await tx.user.update({
        where: { id: req.user.id },
        data:  { tokenVersion: { increment: 1 } },
      });
    });

    clearRefreshCookie(res);

    await auditLogger('LOGOUT', req.user, req);
    return apiResponse.send(res, 'SUCCESS');
  } catch (error) {
    console.error('[AuthService.logout]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// ── Me ────────────────────────────────────────────────────────────────────────
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return apiResponse.send(res, 'NOT_FOUND');
    return apiResponse.send(res, 'SUCCESS', buildUserPayload(user));
  } catch (error) {
    console.error('[AuthService.me]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// ── Update profile ────────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  { ...(name ? { name } : {}), ...(phone ? { phone } : {}) },
    });
    await auditLogger('PROFILE_UPDATED', req.user, req);
    return apiResponse.send(res, 'SUCCESS', buildUserPayload(updated));
  } catch (error) {
    console.error('[AuthService.updateProfile]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// ── Forgot password (OTP via email) ───────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    if (!req.body.email) return apiResponse.send(res, 'VALIDATION_ERROR', { message: 'Email is required.' });
    const email = normalizeEmail(req.body.email);

    // mode: 'insensitive' guards against a pre-existing row whose email wasn't
    // stored lowercase (no migration backfills historical data) — the Redis
    // OTP key below is always built from the normalized form regardless.
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false },
    });

    // Always return success to avoid user enumeration. When the email does not
    // exist, burn the same time a full OTP issuance would take so response
    // timing does not leak account existence.
    if (user) {
      // Account-level resend cooldown: without this, an attacker who burns the
      // 5-attempt cap can just call forgot-password again to reset the budget
      // and keep grinding the 6-digit OTP indefinitely. IP-based otpSendLimiter
      // stays as an additional layer — this one can't be defeated by IP rotation.
      const onCooldown = await client.get(RESET_RESEND_KEY(email));
      if (!onCooldown) {
        const otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false,
        });
        await client.set(RESET_OTP_KEY(email), hashToken(otp), { EX: RESET_OTP_TTL_MINS * 60 });
        // Fresh OTP → fresh attempt budget.
        await client.del(RESET_ATTEMPTS_KEY(email));
        await client.set(RESET_RESEND_KEY(email), '1', { EX: RESEND_COOLDOWN_SECS });
        // A failing SMTP send must NOT surface as a 500 here (that would leak that
        // the account exists and broke). Log it; the user can request again.
        try {
          await sendPasswordResetOtp(email, otp, RESET_OTP_TTL_MINS);
        } catch (sendErr) {
          console.error('[AuthService.forgotPassword] OTP email failed:', sendErr.message);
        }
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return apiResponse.send(res, 'SUCCESS', { message: 'If that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('[AuthService.forgotPassword]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

// ── Reset password ────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { otp, newPassword } = req.body;
    if (!req.body.email || !otp || !newPassword) {
      return apiResponse.send(res, 'VALIDATION_ERROR', { message: 'email, otp, and newPassword are required.' });
    }
    const email = normalizeEmail(req.body.email);

    // Brute-force guard: cap OTP validation attempts per email (IP rotation
    // defeats the route limiter; this budget is bound to the email itself).
    const attempts = await client.incr(RESET_ATTEMPTS_KEY(email));
    if (attempts === 1) await client.expire(RESET_ATTEMPTS_KEY(email), RESET_OTP_TTL_MINS * 60);
    if (attempts > MAX_OTP_ATTEMPTS) {
      await client.del(RESET_OTP_KEY(email));
      return apiResponse.send(res, 'INVALID_REQUEST', { message: 'Too many attempts. Request a new OTP.' });
    }

    // Atomic get+compare+delete: two concurrent requests submitting the same
    // correct OTP can only both reach here if BOTH win the race, but Redis EVAL
    // is single-threaded so only the first ever observes a match — the second
    // always finds the key already gone.
    const consumed = await consumeOtp(RESET_OTP_KEY(email), hashToken(String(otp).trim()));
    if (!consumed) {
      return apiResponse.send(res, 'INVALID_REQUEST', { message: 'Invalid or expired OTP.' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false },
    });
    if (!user) return apiResponse.send(res, 'INVALID_REQUEST', { message: 'Invalid or expired OTP.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction(async (tx) => {
      await lockUserRow(tx, user.id);
      await tx.user.update({
        where: { id: user.id },
        data:  { password: hashed, tokenVersion: { increment: 1 } },
      });
      // Kill every existing session: revoke all refresh tokens so a token stolen
      // BEFORE the reset cannot be replayed against /refresh for its full 7d TTL.
      // The row lock means this also catches a refresh token inserted by an
      // in-flight rotation racing this reset — see lockUserRow().
      await tx.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data:  { revoked: true },
      });
    });
    await client.del(RESET_ATTEMPTS_KEY(email));
    await client.del(RESET_RESEND_KEY(email));
    clearRefreshCookie(res);
    await auditLogger('PASSWORD_RESET', user, req);

    return apiResponse.send(res, 'SUCCESS', { message: 'Password reset successful.' });
  } catch (error) {
    console.error('[AuthService.resetPassword]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
}

module.exports = { login, refreshToken, logout, me, updateProfile, forgotPassword, resetPassword };
