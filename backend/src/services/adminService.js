import prisma from '../config/database.js';

export async function getDashboardStats() {
  const [totalUsers, activeUsers, totalFiles, recentLogs] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.file.count({ where: { deletedAt: null } }),
    prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  return { totalUsers, activeUsers, totalFiles, recentLogs };
}

export async function getUserAnalytics() {
  const total = await prisma.user.count({ where: { deletedAt: null } });
  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
    where: { deletedAt: null },
  });
  const byStatus = await prisma.user.groupBy({
    by: ['status'],
    _count: { id: true },
    where: { deletedAt: null },
  });

  return { total, byRole, byStatus };
}
