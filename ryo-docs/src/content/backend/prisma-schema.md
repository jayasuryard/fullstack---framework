# Prisma Schema

Location: `backend/prisma/schema.prisma`. Three base models — everything else you add above the `// ── Add product domain models above this line ──` marker.

## Datasource and Generator

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}
```

- No `url` here — Prisma 7 reads it from `backend/prisma.config.ts` (env `DATABASE_URL`).
- Driver adapter: `@prisma/adapter-pg` wired in `config/dbConnect.js`.

## Full Base Schema

```prisma
model User {
  id                  String   @id @default(cuid())
  userName            String   @unique
  email               String?  @unique
  phone               String?
  password            String
  name                String?
  photo               String?
  role                String   @default("admin")
  accessLevel         String   @default("read_write")
  active              Boolean  @default(true)
  isDeleted           Boolean  @default(false)
  tokenVersion        Int      @default(0)
  failedLoginAttempts Int      @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]

  @@map("users")
}

model RefreshToken {
  id         String   @id @default(cuid())
  tokenHash  String   @unique
  userId     String
  revoked    Boolean  @default(false)
  expiredAt  DateTime
  deviceInfo String?
  ipAddress  String?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String?
  entityId   String?
  ipAddress  String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

Note: `@@map` gives snake_case table names; `userName`/`accessLevel` camelCase fields map automatically.

## Model Generator

```bash
npm run gen:model Invoice id:cuid name:String amount:Float quantity:Int? isPaid:Boolean createdAt:DateTime
```

- Types: `String`, `Int`, `Float`, `Boolean`, `DateTime`, `Json` — `?` for optional, `[]` for lists.
- Runs `prisma validate`; on failure, rolls back the schema edit so the file never sits half-written.
- `id:cuid` adds `@id @default(cuid())`; `createdAt:DateTime` adds `@default(now())`.

## Field Conventions

| Thing | Rule |
|-------|------|
| IDs | `cuid()` string |
| Timestamps | `createdAt`/`updatedAt` with defaults |
| Booleans | `active`, `isDeleted` — never `is_active` |
| Roles/levels | plain `String`, not enums |
| Relations | explicit `@relation` with `onDelete` (cascade for owned rows, set-null for audit) |
| Indexes | `@@index` on FK columns and hot query columns |

## Adding a Migration

```bash
npm run gen:migration add_invoice
```

Commits the generated SQL under `backend/prisma/migrations/`. Deploy with `npm run migrate:deploy` (runs automatically in the container entrypoint).
