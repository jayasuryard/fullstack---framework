import prisma from '../config/database.js';
import { buildPagination } from '../utils/helpers.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import path from 'path';

async function uploadToS3(buffer, key, mimeType) {
  if (!config.s3.endpoint || !config.s3.bucket) {
    logger.warn('S3 not configured, storing metadata only for:', key);
    return { url: `/uploads/${key}`, bucket: 'local', region: null };
  }

  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3 = new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region || 'us-east-1',
    credentials: { accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.secretKey },
    forcePathStyle: true,
  });

  await s3.send(new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  const url = `${config.s3.endpoint}/${config.s3.bucket}/${key}`;
  return { url, bucket: config.s3.bucket, region: config.s3.region };
}

async function generateThumbnail(buffer, mimeType) {
  if (!mimeType.startsWith('image/')) return null;

  try {
    const sharp = (await import('sharp')).default;
    const thumbnail = await sharp(buffer)
      .resize(200, 200, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();

    return thumbnail;
  } catch {
    return null;
  }
}

export async function uploadFile(userId, file) {
  if (!file) throw ApiError.badRequest('No file provided');

  const ext = path.extname(file.originalname);
  const key = `${userId}/${crypto.randomUUID()}${ext}`;

  const { url, bucket, region } = await uploadToS3(file.buffer, key, file.mimetype);

  let thumbnailUrl = null;
  let variants = null;

  if (file.mimetype.startsWith('image/')) {
    const thumbBuffer = await generateThumbnail(file.buffer, file.mimetype);
    if (thumbBuffer) {
      const thumbKey = `${userId}/thumb_${crypto.randomUUID()}.jpg`;
      const thumbResult = await uploadToS3(thumbBuffer, thumbKey, 'image/jpeg');
      thumbnailUrl = thumbResult.url;
    }

    try {
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(file.buffer).metadata();
      variants = { width: metadata.width, height: metadata.height, format: metadata.format };
    } catch { /* ignore metadata errors */ }
  }

  const saved = await prisma.file.create({
    data: { userId, originalName: file.originalname, mimeType: file.mimetype, size: file.size, key, url, thumbnailUrl, variants, bucket, region },
  });

  return saved;
}

export async function getFile(fileId, userId) {
  const file = await prisma.file.findFirst({ where: { id: fileId, userId, deletedAt: null } });
  if (!file) throw ApiError.notFound('File not found');
  return file;
}

export async function listFiles(userId, query) {
  const { page, limit, skip } = buildPagination(query);
  const where = { userId, deletedAt: null };

  const [files, total] = await Promise.all([
    prisma.file.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.file.count({ where }),
  ]);

  return { files, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function deleteFile(userId, fileId) {
  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw ApiError.notFound('File not found');

  await prisma.file.update({ where: { id: fileId }, data: { deletedAt: new Date() } });
}
