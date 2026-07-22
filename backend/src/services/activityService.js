import prisma from '../config/database.js';
import { buildPagination } from '../utils/helpers.js';

export async function listActivities(userId, query) {
  const { page, limit, skip } = buildPagination(query);
  const where = { userId };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createActivity(userId, type, description, metadata = null) {
  return prisma.activity.create({
    data: { userId, type, description, metadata },
  });
}
