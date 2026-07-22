import prisma from '../config/database.js';
import { generateToken } from '../utils/helpers.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from './emailService.js';

export async function sendVerificationEmail(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.emailVerifiedAt) throw ApiError.badRequest('Email already verified');

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Click the link to verify: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}">Verify Email</a></p><p>Expires in 24 hours.</p>`,
  });
}

export async function verifyEmail(token) {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
  ]);
}
