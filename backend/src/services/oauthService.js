import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import { logger } from '../utils/logger.js';

function normalizeProfile(provider, profile) {
  const base = {
    provider,
    providerId: profile.id,
    email: null,
    firstName: null,
    lastName: null,
    avatar: null,
  };

  switch (provider) {
    case 'google':
    case 'microsoft':
      base.email = profile.emails?.[0]?.value || null;
      base.firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      base.lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
      base.avatar = profile.photos?.[0]?.value || null;
      break;
    case 'facebook':
      base.email = profile.emails?.[0]?.value || null;
      base.firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      base.lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
      base.avatar = profile.photos?.[0]?.value || null;
      break;
    case 'apple':
      base.email = profile.email || null;
      base.firstName = profile.name?.firstName || profile.displayName || 'Apple';
      base.lastName = profile.name?.lastName || 'User';
      break;
    case 'twitter':
      base.email = profile.emails?.[0]?.value || profile._json?.email || null;
      base.firstName = profile.displayName?.split(' ')[0] || profile.username || 'X';
      base.lastName = profile.displayName?.split(' ').slice(1).join(' ') || 'User';
      base.avatar = profile.photos?.[0]?.value || profile._json?.profile_image_url_https || null;
      break;
  }

  return base;
}

export async function findOrCreateUser(provider, profile) {
  const normalized = normalizeProfile(provider, profile);
  const providerIdKey = `${provider}Id`;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalized.email },
        { [providerIdKey]: normalized.providerId },
      ],
    },
  });

  if (existing) {
    const updateData = {};
    if (!existing[providerIdKey]) {
      updateData[providerIdKey] = normalized.providerId;
    }
    if (!existing.emailVerifiedAt && normalized.email) {
      updateData.emailVerifiedAt = new Date();
    }
    if (normalized.avatar && !existing.avatar) {
      updateData.avatar = normalized.avatar;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { ...updateData, lastLoginAt: new Date(), status: 'ACTIVE' },
      });
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { lastLoginAt: new Date() },
      });
    }

    await prisma.activity.create({
      data: { userId: existing.id, type: 'OAUTH_LOGIN', description: `Logged in with ${provider}`, metadata: { provider } },
    });

    const accessToken = generateAccessToken(existing);
    const refreshToken = generateRefreshToken(existing);

    await prisma.refreshToken.create({
      data: { userId: existing.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { user: sanitizeUser(existing), accessToken, refreshToken };
  }

  if (!normalized.email) {
    throw new Error(`Email is required from ${provider}. Please ensure email permissions are granted.`);
  }

  const user = await prisma.user.create({
    data: {
      email: normalized.email,
      firstName: normalized.firstName || 'User',
      lastName: normalized.lastName || '',
      password: '', // OAuth users have no password
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      avatar: normalized.avatar,
      [providerIdKey]: normalized.providerId,
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  await prisma.activity.create({
    data: { userId: user.id, type: 'OAUTH_SIGNUP', description: `Signed up with ${provider}`, metadata: { provider } },
  });

  logger.info(`New user created via ${provider}: ${user.email}`);

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

function sanitizeUser(user) {
  const { password, twoFactorSecret, ...safeUser } = user;
  return safeUser;
}
