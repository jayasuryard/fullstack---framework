import prisma from '../config/database.js';

export async function getDashboardStats() {
  const [totalUsers, activeUsers, totalFiles, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.file.count({ where: { deletedAt: null } }),
    prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  return { totalUsers, activeUsers, totalFiles, recentLogs };
}

export async function getUserAnalytics() {
  const total = await prisma.user.count();
  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });
  const byStatus = await prisma.user.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return { total, byRole, byStatus };
}
