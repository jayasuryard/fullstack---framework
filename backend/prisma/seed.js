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

  await prisma.setting.upsert({
    where: { key: 'app_name' },
    update: {},
    create: { key: 'app_name', value: '"RyoFramework"', group: 'general' },
  });

  await prisma.setting.upsert({
    where: { key: 'app_description' },
    update: {},
    create: { key: 'app_description', value: '"Production-ready SaaS Framework"', group: 'general' },
  });

  console.log('Seed completed');
  console.log(`Admin: admin@ryoforge.com / admin123`);
  console.log(`User:  user@ryoforge.com / user123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
