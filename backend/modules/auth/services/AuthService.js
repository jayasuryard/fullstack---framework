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
const apiResponse = require('../../../helpers/apiResponse');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../../helpers/generateToken');
const { auditLogger } = require('../../../helpers/auditLogger');
const bcrypt      = require('bcrypt');
const crypto      = require('crypto');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINS  = 15;
const REFRESH_TTL_DAYS    = 7;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

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

async function storeRefreshToken(userId, token, req) {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
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
      return res.json(apiResponse.response('VALIDATION_ERROR', {
        message: 'Both username and password are required.',
      }));
    }

    const user = await prisma.user.findFirst({
      where: { userName, isDeleted: false },
    });

    if (!user) {
      return res.json(apiResponse.response('UNAUTHORIZED', { message: 'Invalid credentials.' }));
    }

    // Account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.json(apiResponse.response('TOO_MANY_REQUESTS', {
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      }));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData     = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINS * 60 * 1000);
      }

      await prisma.user.update({ where: { id: user.id }, data: updateData });
      await auditLogger('LOGIN_FAILED', { id: user.id, name: user.name, role: user.role }, req);

      return res.json(apiResponse.response('UNAUTHORIZED', { message: 'Invalid credentials.' }));
    }

    if (!user.active) {
      return res.json(apiResponse.response('FORBIDDEN', { message: 'Account is deactivated.' }));
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data:  { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const accessToken   = generateToken(user);
    const refreshTokenVal = generateRefreshToken(user);
    await storeRefreshToken(user.id, refreshTokenVal, req);

    await auditLogger('LOGIN_SUCCESS', user, req);

    return res.json(apiResponse.response('SUCCESS', {
      token:        accessToken,
      refreshToken: refreshTokenVal,
      user:         buildUserPayload(user),
    }));
  } catch (error) {
    console.error('[AuthService.login]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.json(apiResponse.response('UNAUTHORIZED'));

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.json(apiResponse.response('UNAUTHORIZED'));
    }

    const stored = await prisma.refreshToken.findFirst({
      where: { userId: decoded.userId, tokenHash: hashToken(token), revoked: false },
    });

    if (!stored || stored.expiredAt < new Date()) {
      return res.json(apiResponse.response('UNAUTHORIZED'));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.isDeleted || !user.active) {
      return res.json(apiResponse.response('UNAUTHORIZED'));
    }

    // Rotate: revoke old, issue new pair
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const newAccessToken  = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await storeRefreshToken(user.id, newRefreshToken, req);

    return res.json(apiResponse.response('SUCCESS', {
      token:        newAccessToken,
      refreshToken: newRefreshToken,
    }));
  } catch (error) {
    console.error('[AuthService.refreshToken]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout(req, res) {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.id, tokenHash: hashToken(token) },
        data:  { revoked: true },
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data:  { tokenVersion: { increment: 1 } },
    });

    await auditLogger('LOGOUT', req.user, req);
    return res.json(apiResponse.response('SUCCESS'));
  } catch (error) {
    console.error('[AuthService.logout]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

// ── Me ────────────────────────────────────────────────────────────────────────
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.json(apiResponse.response('NOT_FOUND'));
    return res.json(apiResponse.response('SUCCESS', buildUserPayload(user)));
  } catch (error) {
    console.error('[AuthService.me]', error);
    return res.json(apiResponse.response('ERROR'));
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
    return res.json(apiResponse.response('SUCCESS', buildUserPayload(updated)));
  } catch (error) {
    console.error('[AuthService.updateProfile]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

// ── Forgot password (OTP via email — wire up your email service here) ─────────
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.json(apiResponse.response('VALIDATION_ERROR', { message: 'Email is required.' }));

    const user = await prisma.user.findFirst({ where: { email, isDeleted: false } });

    // Always return success to avoid user enumeration
    if (!user) return res.json(apiResponse.response('SUCCESS', { message: 'If that email exists, an OTP has been sent.' }));

    // TODO: generate OTP, store hashed OTP in DB, send via emailService
    // const otp = generateOtp(); // plug in your OTP generator
    // await prisma.user.update({ where: { id: user.id }, data: { resetOtp: hash(otp), resetOtpExpiry: ... } });
    // await emailService.sendPasswordReset(user.email, otp);

    return res.json(apiResponse.response('SUCCESS', { message: 'If that email exists, an OTP has been sent.' }));
  } catch (error) {
    console.error('[AuthService.forgotPassword]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

// ── Reset password ────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.json(apiResponse.response('VALIDATION_ERROR', { message: 'email, otp, and newPassword are required.' }));
    }

    // TODO: validate OTP against DB, check expiry, hash newPassword, update user, increment tokenVersion
    // const user = await prisma.user.findFirst({ where: { email, resetOtp: hash(otp), resetOtpExpiry: { gt: new Date() } } });
    // if (!user) return res.json(apiResponse.response('INVALID_REQUEST', { message: 'Invalid or expired OTP.' }));
    // const hashed = await bcrypt.hash(newPassword, 12);
    // await prisma.user.update({ where: { id: user.id }, data: { password: hashed, tokenVersion: { increment: 1 }, resetOtp: null } });
    // await auditLogger('PASSWORD_RESET', user, req);

    return res.json(apiResponse.response('SUCCESS', { message: 'Password reset successful.' }));
  } catch (error) {
    console.error('[AuthService.resetPassword]', error);
    return res.json(apiResponse.response('ERROR'));
  }
}

module.exports = { login, refreshToken, logout, me, updateProfile, forgotPassword, resetPassword };
