# Database Design

RyoFramework uses PostgreSQL as its primary database with Prisma ORM as the data access layer. The database schema is designed for multi-tenant SaaS applications with a focus on performance, security, and maintainability.

## Design Philosophy

- **Schema-first development**: Database schema drives application models
- **Soft deletes**: Data is preserved via `deletedAt` timestamps where appropriate
- **UUID primary keys**: Distributed-friendly, no sequential ID enumeration
- **Indexed queries**: All frequent query paths are covered by database indexes
- **Audit trail**: Every data change is logged through audit logs
- **Multi-tenant ready**: Organization-based data isolation
- **Type safety**: Prisma-generated TypeScript types for all models

## Prisma ORM Setup

### Installation

```bash
npm install @prisma/client
npm install -D prisma
```

### Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Client Instantiation

```javascript
// src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

prisma.$on('beforeExit', async () => {
  console.log('Prisma client disconnecting...');
});

export default prisma;
```

In development, query logging is enabled to help with debugging and optimization. In production, only errors are logged.

## Schema Overview

### Core Models

| Model | Purpose | Key Fields |
|---|---|---|
| `User` | User accounts and profiles | email, password, role, status |
| `Session` | Active user sessions | token, ipAddress, userAgent, expiresAt |
| `RefreshToken` | JWT refresh token store | token, expiresAt, revoked |
| `Organization` | Multi-tenant organizations | name, slug, settings |
| `OrganizationMember` | User-organization membership | role (in org context) |
| `Team` | Sub-groups within organizations | name, slug |
| `TeamMember` | User-team membership | role (in team context) |
| `Invitation` | Pending invitations | email, token, role |

### Security Models

| Model | Purpose |
|---|---|
| `LoginAttempt` | Track login success/failure for brute force protection |
| `OtpCode` | One-time passwords for email verification, MFA, password reset |
| `EmailVerificationToken` | Email verification tokens |
| `ApiKey` | API key management |
| `Role` | RBAC role definitions |
| `Permission` | Granular action/resource permissions |
| `RolePermission` | Role-permission assignments |

### AI Models

| Model | Purpose |
|---|---|
| `Conversation` | AI conversation threads |
| `Message` | Individual messages within conversations |

### Billing Models

| Model | Purpose |
|---|---|
| `Plan` | Subscription plan definitions |
| `Subscription` | User subscriptions |
| `Invoice` | Billing invoices |
| `Payment` | Payment transactions |
| `PaymentMethod` | Saved payment methods |
| `Coupon` | Discount coupons |
| `UsageRecord` | Usage-based billing records |

### Communication Models

| Model | Purpose |
|---|---|
| `Notification` | In-app and email notifications |
| `NotificationPreference` | Per-type notification channel preferences |
| `NotificationTemplate` | Reusable notification templates |

### File Management

| Model | Purpose |
|---|---|
| `File` | Uploaded file metadata and S3 references |

## Migration Workflow

### Creating Migrations

```bash
# Development
npx prisma migrate dev --name add_billing_models

# Staging/Production
npx prisma migrate deploy
```

### Migration Commands

| Command | Purpose |
|---|---|
| `npx prisma migrate dev` | Create and apply migration in dev |
| `npx prisma migrate deploy` | Apply pending migrations (CI/prod) |
| `npx prisma migrate reset` | Reset database and apply all migrations |
| `npx prisma db push` | Push schema without migration (rapid prototyping) |
| `npx prisma db pull` | Introspect DB and generate schema |
| `npx prisma generate` | Generate Prisma client |

### Migration Checklist for Production

1. Backup database before applying migrations
2. Run `npx prisma migrate deploy` in a maintenance window
3. Verify schema changes with `npx prisma validate`
4. Monitor query performance after migration
5. Rollback plan: restore from backup if issues arise

## Seed Data Strategy

### Seeder Structure

```javascript
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create admin and demo users
  const admin = await prisma.user.upsert({ ... });

  // 2. Seed subscription plans
  const plans = [
    { name: 'Free', slug: 'free', price: 0, ... },
    { name: 'Pro', slug: 'pro', price: 29, ... },
    { name: 'Enterprise', slug: 'enterprise', price: 99, ... },
  ];

  // 3. Seed system settings
  await prisma.setting.upsert({ ... });

  // 4. Seed default permissions
  const permissions = [
    { action: 'read', resource: 'user' },
    { action: 'manage', resource: 'billing' },
    // ...
  ];
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Seed Data

| Data | Purpose |
|---|---|
| Admin user (`admin@ryoforge.com` / `admin123`) | Super admin for testing |
| Demo user (`user@ryoforge.com` / `user123`) | Regular member account |
| Subscription plans (Free, Pro, Enterprise) | Billing system testing |
| System settings | App configuration defaults |
| Permissions | RBAC permission definitions |

### Running Seeds

```bash
npm run db:seed
# or
node prisma/seed.js
```

## Query Optimization Tips

### 1. Use Selective Projections

```javascript
// Bad: fetches all fields
const user = await prisma.user.findUnique({ where: { id } });

// Good: only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, firstName: true, role: true },
});
```

### 2. Leverage Database Indexes

The schema includes indexes on:
- Foreign keys (`userId`, `organizationId`, etc.)
- Frequently filtered fields (`status`, `role`, `deletedAt`)
- Sort fields (`createdAt`, `updatedAt`)
- Unique constraints (`email`, `slug`, `token`)

```prisma
@@index([email])
@@index([status])
@@index([createdAt])
@@index([userId, read])       // Composite index for notifications query
@@index([userId, feature])    // Composite for usage records
```

### 3. Batch Operations

```javascript
// Bad: N+1 individual creates
for (const member of members) {
  await prisma.teamMember.create({ data: member });
}

// Good: batch create
await prisma.teamMember.createMany({ data: members });
```

### 4. Use Pagination for Large Datasets

```javascript
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### 5. Raw Queries for Complex Operations

When Prisma's query API is insufficient, use raw queries:

```javascript
const results = await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', created_at) as month,
         COUNT(*) as count
  FROM "User"
  WHERE created_at > NOW() - INTERVAL '12 months'
  GROUP BY month
  ORDER BY month DESC
`;
```

## N+1 Query Problem Prevention

### The Problem

```javascript
// N+1: 1 query for posts + N queries for each post's author
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}
```

### The Solution: Eager Loading

```javascript
// Solution: Use `include` to join in a single query
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true, email: true },
    },
    comments: {
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

### Guidelines

- Use `include` for required relations
- Use `select` to limit fields on included relations
- Use batch loading (DataLoader pattern) for repeated queries
- Avoid nested `include` beyond 3 levels
- Monitor query logs in development to detect N+1

## Connection Pooling

### Default Pool Configuration

Prisma uses a default connection pool with these characteristics:

| Setting | Default | Recommendation |
|---|---|---|
| Pool size | 10 | Adjust based on server concurrency |
| Connection timeout | 10s | Keep as default |
| Idle timeout | 30s | Keep as default |

### Configuring Pool Size

```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration via DATABASE_URL query params
});
```

Set pool size via `DATABASE_URL`:

```
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

### Connection Management

```javascript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## Backup and Restore

### PostgreSQL Backup

```bash
# Backup
pg_dump -h localhost -U postgres -d ryo_framework > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h localhost -U postgres -d ryo_framework | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
psql -h localhost -U postgres -d ryo_framework < backup.sql

# From compressed
gunzip -c backup.sql.gz | psql -h localhost -U postgres -d ryo_framework
```

### Docker-Based

```bash
# Backup from running container
docker exec -t ryo-framework-postgres-1 pg_dump -U postgres ryo_framework > backup.sql

# Restore to container
cat backup.sql | docker exec -i ryo-framework-postgres-1 psql -U postgres ryo_framework
```

### Automated Backup Strategy

| Schedule | Type | Retention |
|---|---|---|
| Every 6 hours | Full database dump | 7 days |
| Daily | Full database dump | 30 days |
| Weekly | Full database dump | 3 months |
| Monthly | Full database dump | 1 year |

## Performance Monitoring

### Query Logging

Enable query logging in development:

```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Identifying Slow Queries

```javascript
// Log slow queries
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query:', e.query, e.duration, 'ms');
  }
});
```

### Index Maintenance

- Regularly analyze query patterns using Prisma's query log
- Add composite indexes for multi-column filters
- Remove unused indexes to improve write performance
- Use `EXPLAIN ANALYZE` via raw queries for deep analysis
