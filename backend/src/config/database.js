import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

prisma.$on('beforeExit', async () => {
  console.log('Prisma client disconnecting...');
});

export default prisma;
