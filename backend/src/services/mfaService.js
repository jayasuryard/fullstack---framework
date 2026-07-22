import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOTP } from '../utils/helpers.js';
import { sendEmail } from './emailService.js';

export async function generateMfaSecret(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const secret = generateOTP(16);

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  return { secret, qrCode: `otpauth://totp/RyoFramework:${user.email}?secret=${secret}&issuer=RyoFramework` };
}

export async function verifyAndEnableMfa(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest('MFA not initialized');

  if (code !== user.twoFactorSecret.slice(0, 6)) {
    throw ApiError.badRequest('Invalid verification code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });
}

export async function disableMfa(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorEnabled) throw ApiError.badRequest('MFA not enabled');

  if (code !== user.twoFactorSecret?.slice(0, 6)) {
    throw ApiError.badRequest('Invalid code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  });
}

export async function sendOtp(userId, purpose) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const code = generateOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.create({
    data: { userId, code, purpose, expiresAt },
  });

  if (purpose === 'LOGIN' || purpose === 'MFA') {
    await sendEmail({ to: user.email, subject: 'Your verification code', html: `<p>Your code is: <strong>${code}</strong></p><p>Expires in 10 minutes.</p>` });
  }

  return { message: 'OTP sent' };
}

export async function verifyOtp(userId, code, purpose) {
  const otp = await prisma.otpCode.findFirst({
    where: { userId, code, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw ApiError.badRequest('Invalid or expired OTP');

  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return true;
}
