import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export async function listPlans() {
  return prisma.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
}

export async function createPlan(data) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
  return prisma.plan.create({ data: { ...data, slug } });
}

export async function createSubscription(userId, planId) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) throw ApiError.notFound('Plan not found');

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] } },
  });
  if (existing) throw ApiError.conflict('User already has an active subscription');

  const endsAt = plan.interval === 'year'
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return prisma.subscription.create({
    data: { userId, planId, endsAt, status: 'active' },
  });
}

export async function cancelSubscription(subscriptionId, userId) {
  const sub = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
  if (!sub) throw ApiError.notFound('Subscription not found');

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled', canceledAt: new Date() },
  });
}

export async function getUserSubscription(userId) {
  return prisma.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] } },
    include: { plan: true },
  });
}

export async function listInvoices(userId, query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where: { userId } }),
  ]);

  return { invoices, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function createInvoice(data) {
  const count = await prisma.invoice.count();
  const number = `INV-${String(count + 1).padStart(6, '0')}`;

  return prisma.invoice.create({
    data: { ...data, number },
  });
}

export async function recordUsage(userId, feature, quantity = 1) {
  return prisma.usageRecord.create({
    data: { userId, feature, quantity },
  });
}

export async function getUsage(userId, feature) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const records = await prisma.usageRecord.findMany({
    where: { userId, feature, recordedAt: { gte: startOfMonth } },
  });

  return records.reduce((sum, r) => sum + r.quantity, 0);
}
