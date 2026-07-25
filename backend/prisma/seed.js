import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = bcrypt.hashSync('admin123', 12);
  const userPassword = bcrypt.hashSync('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ryoforge.com' },
    update: {},
    create: {
      email: 'admin@ryoforge.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@ryoforge.com' },
    update: {},
    create: {
      email: 'user@ryoforge.com',
      password: userPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const plans = [
    { name: 'Free', slug: 'free', description: 'For getting started', price: 0, interval: 'month', features: ['Up to 5 users', '1GB storage', 'Basic analytics'], limits: { users: 5, storage: 1073741824 }, sortOrder: 0 },
    { name: 'Pro', slug: 'pro', description: 'For growing teams', price: 29, interval: 'month', features: ['Up to 50 users', '50GB storage', 'Advanced analytics', 'Priority support'], limits: { users: 50, storage: 53687091200 }, sortOrder: 1 },
    { name: 'Enterprise', slug: 'enterprise', description: 'For large organizations', price: 99, interval: 'month', features: ['Unlimited users', '500GB storage', 'All analytics', 'AI features', 'Dedicated support'], limits: { users: 999999, storage: 536870912000 }, sortOrder: 2 },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  await prisma.setting.upsert({
    where: { key: 'app_name' },
    update: {},
    create: { key: 'app_name', value: 'RyoFramework', group: 'general' },
  });

  await prisma.setting.upsert({
    where: { key: 'app_description' },
    update: {},
    create: { key: 'app_description', value: 'Production-ready SaaS Framework', group: 'general' },
  });

  const permissions = [
    { action: 'read', resource: 'user', description: 'View user profiles' },
    { action: 'create', resource: 'user', description: 'Create users' },
    { action: 'update', resource: 'user', description: 'Update users' },
    { action: 'delete', resource: 'user', description: 'Delete users' },
    { action: 'read', resource: 'organization', description: 'View organizations' },
    { action: 'create', resource: 'organization', description: 'Create organizations' },
    { action: 'manage', resource: 'organization', description: 'Manage organizations' },
    { action: 'read', resource: 'billing', description: 'View billing info' },
    { action: 'manage', resource: 'billing', description: 'Manage billing' },
    { action: 'read', resource: 'settings', description: 'View settings' },
    { action: 'manage', resource: 'settings', description: 'Manage settings' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: {},
      create: perm,
    });
  }

  console.log('Seed completed');
  console.log('Admin: admin@ryoforge.com / admin123');
  console.log('User:  user@ryoforge.com / user123');
  console.log('Plans: Free, Pro, Enterprise');
  console.log('Permissions seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
