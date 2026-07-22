import prisma from '../config/database.js';
import { buildPagination, buildWhereClause } from '../utils/helpers.js';

export async function listAuditLogs(query) {
  const { page, limit, skip } = buildPagination(query);
  const allowedFields = ['action', 'entity', 'entityId'];
  const where = buildWhereClause(query, allowedFields);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
