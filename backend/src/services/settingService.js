import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export async function getSettings(group) {
  const where = group ? { group } : {};
  const settings = await prisma.setting.findMany({ where });
  const result = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

export async function getSetting(key) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return null;
  return setting.value;
}

export async function updateSetting(key, value, group = 'general') {
  return prisma.setting.upsert({
    where: { key },
    update: { value, group },
    create: { key, value, group },
  });
}

export async function updateSettings(settings) {
  const results = [];
  for (const { key, value, group } of settings) {
    const result = await updateSetting(key, value, group);
    results.push(result);
  }
  return results;
}
