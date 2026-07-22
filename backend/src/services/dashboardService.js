import prisma from '../config/database.js';

export async function getUserDashboard(userId) {
  const [recentActivities, unreadNotifications, recentFiles] = await Promise.all([
    prisma.activity.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.file.findMany({
      where: { userId, deletedAt: null },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { recentActivities, unreadNotifications, recentFiles };
}
