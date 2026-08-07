# Database

PostgreSQL accessed through **Prisma 7** with the **driver-adapter** pattern: `@prisma/adapter-pg` wrapping a `pg.Pool`. The datasource URL lives in `backend/prisma.config.ts` (not in `schema.prisma`) and is read from the `DATABASE_URL` env var.

## Connection Setup

`backend/config/dbConnect.js`:

```js
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
```

`schema.prisma` enables `driverAdapters` preview feature and has **no `url = env(...)`** on the datasource block — Prisma 7 resolves it from the config file.

## Models

The base schema ships 3 models. Domain models are added **above the marker** in `schema.prisma`.

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | cuid, not uuid |
| `userName` | String @unique | login identifier |
| `email` | String? @unique | optional |
| `phone` | String? | |
| `password` | String | bcrypt hash |
| `name` | String? | |
| `photo` | String? | S3/Cloudinary URL |
| `role` | String @default("admin") | plain string role |
| `accessLevel` | String @default("read_write") | `read_write` / `read_only` |
| `active` | Boolean @default(true) | |
| `isDeleted` | Boolean @default(false) | soft delete |
| `tokenVersion` | Int @default(0) | bump = kill all sessions |
| `failedLoginAttempts` | Int @default(0) | lockout counter |
| `lockedUntil` | DateTime? | lockout window |
| `lastLoginAt` | DateTime? | |
| `createdAt` / `updatedAt` | DateTime | |

Relations: `refreshTokens RefreshToken[]`, `auditLogs AuditLog[]` (cascade delete on user delete).

### RefreshToken

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `tokenHash` | String @unique | sha256 of opaque token |
| `userId` | String | FK → User, cascade |
| `revoked` | Boolean @default(false) | rotation marks old rows |
| `expiredAt` | DateTime | 7 d |
| `deviceInfo` | String? | UA string |
| `ipAddress` | String? | |
| `createdAt` | DateTime | |

### AuditLog

| Field | Type | Notes |
|-------|------|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String? | nullable (system actions) |
| `action` | String | e.g. `auth.login`, `auth.logout` |
| `entityType` / `entityId` | String? | target resource |
| `ipAddress` | String? | |
| `userAgent` | String? | |
| `metadata` | Json? | extra context |
| `createdAt` | DateTime | |

Indexes: `@@index([userId])`, `@@index([createdAt])`. Purge job removes rows older than 90 days (cron 03:00).

## Migrations Workflow

```bash
# dev — create a migration from schema changes
npm run gen:migration add_invoice

# deploy — apply committed migrations (prod-safe)
npm run migrate:deploy
```

- Committed migration folders live in `backend/prisma/migrations/`.
- Container entrypoint runs `migrate deploy` before the API starts.
- `gen:model` validates with `prisma validate` and rolls back the schema edit if validation fails.

## Conventions

- IDs: `cuid()` everywhere.
- No enums in the base schema (roles/access levels are plain strings — see [Authorization](./authorization)).
- Soft delete via `isDeleted`; `verifyToken` rejects soft-deleted users.
- Sensitive lookups (refresh tokens) by unique `tokenHash`.
- JSON fields: `Json?` with Prisma `JsonNull`/`DbNull` semantics on update.
