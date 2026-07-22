import prisma from '../config/database.js';
import { buildPagination } from '../utils/helpers.js';

export async function listNotifications(userId, query) {
  const { page, limit, skip } = buildPagination(query);
  const where = { userId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) return null;

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function createNotification(userId, type, title, message, data = null) {
  return prisma.notification.create({
    data: { userId, type, title, message, data },
  });
}

export async function deleteNotification(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) return false;

  await prisma.notification.delete({ where: { id: notificationId } });
  return true;
}
