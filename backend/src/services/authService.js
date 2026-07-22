import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken, sanitizeUser } from '../utils/helpers.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/index.js';
import { sendEmail } from './emailService.js';

export async function login(email, password, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({ where: { email } });
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
    data: { lastLoginAt: new Date(), status: 'ACTIVE' },
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
  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('User not found or inactive');
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    }),
  ]);

  await sendEmail({
    to: email,
    subject: 'Password Reset',
    html: `<p>Use this token to reset your password: <strong>${token}</strong></p>
           <p>This token expires in 1 hour.</p>`,
  });

  return { message: 'If the email exists, a reset link has been sent' };
}

export async function resetPassword(token, password) {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    throw ApiError.unauthorized('Invalid or expired reset token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashPassword(password) },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      type: 'PASSWORD_RESET',
      description: 'Password reset completed',
    },
  });
}
