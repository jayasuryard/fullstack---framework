// Prisma client backed by a native pg.Pool via @prisma/adapter-pg driver adapter.
const { PrismaClient } = require('../generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Pool sizing matters in PM2 cluster mode: each worker process gets its own
// pool, so total connections = max * instances. Keep the per-process default
// modest and let deploys override it via DB_POOL_MAX for their instance count.
const pool = new Pool({
  connectionString:         process.env.DATABASE_URL,
  max:                      Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis:  Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
  idleTimeoutMillis:        Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
