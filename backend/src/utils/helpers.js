import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateUUID() {
  return uuidv4();
}

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function sanitizeUser(user) {
  const { password, twoFactorSecret, ...safeUser } = user;
  return safeUser;
}

export function buildPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildWhereClause(filters, allowedFields) {
  const where = {};
  for (const key of allowedFields) {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      if (typeof filters[key] === 'string') {
        where[key] = { contains: filters[key], mode: 'insensitive' };
      } else {
        where[key] = filters[key];
      }
    }
  }
  return where;
}
