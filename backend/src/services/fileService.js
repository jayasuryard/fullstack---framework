import prisma from '../config/database.js';
import { buildPagination } from '../utils/helpers.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/index.js';

export async function uploadFile(userId, file) {
  if (!file) throw ApiError.badRequest('No file provided');

  const key = `${userId}/${Date.now()}-${file.originalname}`;
  const url = `/uploads/${key}`;

  const saved = await prisma.file.create({
    data: {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      key,
      url,
      bucket: config.s3.bucket || 'local',
      region: config.s3.region,
    },
  });

  return saved;
}

export async function listFiles(userId, query) {
  const { page, limit, skip } = buildPagination(query);
  const where = { userId, deletedAt: null };

  const [files, total] = await Promise.all([
    prisma.file.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.file.count({ where }),
  ]);

  return {
    files,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteFile(userId, fileId) {
  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw ApiError.notFound('File not found');

  await prisma.file.update({
    where: { id: fileId },
    data: { deletedAt: new Date() },
  });
}
