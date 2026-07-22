import prisma from '../config/database.js';

export async function globalSearch(query, userId) {
  if (!query || query.length < 2) return { results: [] };

  const results = [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, firstName: true, lastName: true },
    take: 5,
  });

  if (users.length) results.push({ type: 'users', data: users });

  const files = await prisma.file.findMany({
    where: {
      userId,
      originalName: { contains: query, mode: 'insensitive' },
      deletedAt: null,
    },
    take: 5,
  });

  if (files.length) results.push({ type: 'files', data: files });

  return { results };
}
