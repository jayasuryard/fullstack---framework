import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken, sanitizeUser } from '../utils/helpers.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from './emailService.js';
import { sendVerificationEmail } from './emailVerificationService.js';

export async function login(email, password, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
    throw ApiError.forbidden('Account is suspended or banned');
  }

  if (!comparePassword(password, user.password)) {
    await prisma.loginAttempt.create({
      data: { userId: user.id, ipAddress, userAgent, success: false, reason: 'Invalid password' },
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.loginAttempt.create({
    data: { userId: user.id, ipAddress, userAgent, success: true },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      type: 'LOGIN',
      description: 'User logged in',
      metadata: { ipAddress, userAgent },
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function signup(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashPassword(data.password),
      status: 'ACTIVE',
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  sendVerificationEmail(user.id).catch(() => {});

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(token) {
  const decoded = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }
  if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
    throw ApiError.unauthorized('Account is suspended or banned');
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(userId, refreshToken) {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId },
      data: { revoked: true },
    });
  }

  await prisma.activity.create({
    data: {
      userId,
      type: 'LOGOUT',
      description: 'User logged out',
    },
  });
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.otpCode.create({
    data: { userId: user.id, code: token, purpose: 'PASSWORD_RESET', expiresAt },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  await sendEmail({
    to: email,
    subject: 'Password Reset',
    html: `<p>Click the link to reset your password: <a href="${frontendUrl}/app/reset-password?token=${token}">Reset Password</a></p><p>This link expires in 1 hour.</p>`,
  });

  return { message: 'If the email exists, a reset link has been sent' };
}

export async function resetPassword(token, password) {
  const otp = await prisma.otpCode.findFirst({
    where: { code: token, purpose: 'PASSWORD_RESET', usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!otp) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({
      where: { id: otp.userId },
      data: { password: hashPassword(password) },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: otp.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);

  await prisma.activity.create({
    data: {
      userId: otp.userId,
      type: 'PASSWORD_RESET',
      description: 'Password reset completed',
    },
  });
}
