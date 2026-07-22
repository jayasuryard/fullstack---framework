import prisma from '../config/database.js';
import { hashPassword, comparePassword, sanitizeUser, buildPagination, buildWhereClause } from '../utils/helpers.js';
import { ApiError } from '../utils/ApiError.js';

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return sanitizeUser(user);
}

export async function updatePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (!comparePassword(currentPassword, user.password)) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashPassword(newPassword) },
  });
}

export async function listUsers(query) {
  const { page, limit, skip } = buildPagination(query);
  const allowedFields = ['email', 'firstName', 'lastName', 'role', 'status'];
  const where = buildWhereClause(query, allowedFields);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, avatar: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
}

export async function updateUser(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return sanitizeUser(user);
}

export async function deleteUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: 'SUSPENDED' },
  });
}
