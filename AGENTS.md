# AGENTS.md — Framework Project Guide for AI Agents

This file is the primary context document for AI agents working inside `Framework/`.
Read it completely before making any changes.

---

## What This Repo Is

`Framework/` is a **reusable SaaS scaffold** extracted from a production school-management platform
(`Product/`). Its purpose is to let a developer bootstrap a new SaaS product (CRM, ERP, LMS, HRMS,
Marketplace, etc.) without starting from zero.

The repo contains **two top-level directories**:

| Directory | Role |
|-----------|------|
| `Product/` | Source-of-truth reference codebase. **READ-ONLY — never modify, delete, or reformat anything here.** |
| `Framework/` | The extractable scaffold. All your work lives here. |

---

## Repository Layout

```
Framework/
├── ARCHITECTURE.md          # Developer-facing stack reference
├── AGENTS.md                # This file
├── SOURCE-MAPPING.md        # Traceability: every Framework file → Product/ source
├── .claude/
│   └── CLAUDE.md            # Claude Code session context
│
├── backend/
│   ├── server.js            # Express entry point + HTTP server for WebSocket
│   ├── worker.js            # PM2 worker process (background job consumer)
│   ├── ecosystem.config.js  # PM2 cluster (api) + fork (worker) config
│   ├── start.sh             # Container entrypoint: migrate → worker → server
│   ├── prisma.config.ts     # Prisma 7 config (schema path, migrations, DB URL)
│   ├── dockerfile           # node:22-slim, prisma generate, start.sh CMD
│   ├── docker-compose.yml   # Single-service compose (external DB/Redis)
│   ├── .dockerignore
│   ├── DOCKER.md            # Deployment setup guide
│   ├── .github/workflows/
│   │   ├── deploy.yml       # DEV: push to deployment-dev → ECR → EC2 blue-green
│   │   └── deploy-prod.yml  # PROD: push v* tag → ECR → EC2 blue-green
│   │
│   ├── config/
│   │   ├── dbConnect.js     # PrismaClient with PrismaPg adapter (pg.Pool)
│   │   ├── redisConfig.js   # Redis client + getCache/setCache/deleteCache
│   │   ├── s3.js            # AWS S3Client
│   │   └── cloudinary.js    # Cloudinary v2 config
│   │
│   ├── prisma/
│   │   └── schema.prisma    # User, RefreshToken, AuditLog base models
│   │
│   ├── globals/
│   │   └── response.json    # 15 response codes (1000–1014)
│   │
│   ├── helpers/
│   │   ├── apiResponse.js   # response(res, code, data?) — standard envelope
│   │   ├── paginate.js      # page/limit/skip/meta helper
│   │   ├── auditLogger.js   # prisma.auditLog.create wrapper
│   │   ├── generateToken.js # JWT access + refresh token helpers
│   │   └── queue/
│   │       ├── jobQueue.js     # Redis BLPOP job queue (enqueue, status, progress)
│   │       └── jobWsServer.js  # WebSocket bridge: Redis pub/sub → browser
│   │
│   ├── middleware/
│   │   ├── verifyToken.js   # Bearer JWT auth + user lookup + tokenVersion check
│   │   ├── role.js          # role(...roles) middleware factory
│   │   ├── accessLevel.js   # readOnlyRoles access control
│   │   ├── rateLimit.js     # createLimiter() factory + preset limiters
│   │   └── upload.js        # multer memoryStorage, 5 MB limit
│   │
│   ├── modules/
│   │   └── auth/
│   │       ├── routes/authRoutes.js   # login, refresh, me, logout, profile, forgot/reset-password
│   │       └── services/AuthService.js # full auth logic (lockout, token rotation, etc.)
│   │
│   ├── routes/
│   │   └── index.js         # Central router — mount all module routers here
│   │
│   ├── scripts/
│   │   ├── generateModule.js   # Scaffolds modules/<name>/routes + services, updates routes/index.js
│   │   ├── generateModel.js    # Appends Prisma model to schema.prisma
│   │   ├── generateMigration.js # npx prisma migrate dev --name
│   │   ├── deployMigration.js  # npx prisma migrate deploy (CI/production)
│   │   ├── generatePostman.js  # Scans modules/, generates Postman collection in docs/
│   │   └── createSuperAdmin.js # Interactive CLI to seed first super admin
│   │
│   ├── jobs/
│   │   └── _stub.js         # Cron job template (node-cron)
│   └── workers/
│       └── _stub.js         # Background job handler template
│
└── frontend/
    ├── server.js            # Express SPA server with OG meta injection
    ├── nginx.conf           # Alternative: plain nginx static hosting
    ├── dockerfile           # Multi-stage: builder (Vite) → prod (Express)
    ├── docker-compose.yml
    ├── .github/workflows/
    │   ├── deploy.yml
    │   └── deploy-prod.yml
    ├── vite.config.js       # plugins: [react(), tailwindcss()]
    ├── eslint.config.js     # ESLint 9 flat config
    ├── index.html           # __OG_TITLE__, __OG_DESCRIPTION__, __OG_IMAGE__ placeholders
    └── src/
        ├── main.jsx
        ├── App.jsx          # Route definitions + DefaultRedirect
        ├── contexts/
        │   └── AuthContext.jsx  # Auth state, login/logout/me
        ├── components/
        │   ├── PrivateRoute.jsx
        │   ├── MainLayout.jsx
        │   ├── MobileLayout.jsx
        │   └── common/          # 17 reusable UI primitives (Button, Card, Table, Modal, …)
        ├── hooks/
        │   └── useDataFetch.js  # Generic data fetch hook
        ├── server/
        │   └── api.js           # Fetch client (all backend calls go through here)
        ├── utils/
        │   └── subdomain.js     # Subdomain detection from hostname
        └── pages/
            └── _stub.jsx        # Page template
```

---

## Critical Rules

1. **`Product/` is READ-ONLY.** Never create, edit, delete, rename, or reformat any file inside it.
   It is the reference — not your workspace.

2. **All new code goes in `Framework/` only.**

3. **Every pattern you add must trace back to `Product/`.** If you invent something `Product/` doesn't
   do, say so clearly and mark it as a gap.

4. **Never hardcode product-domain names** (school, tenant, hospital, student, etc.) in framework
   code. Use generic names (`user`, `tenant`, `resource`) and leave extension points.

5. **No TypeScript.** Plain `.js` / `.jsx` only — `Product/` uses no TypeScript.

6. **No test framework.** `Product/` has zero tests. Don't add them unless the user asks.

7. **No Prettier.** ESLint 9 flat config only.

---

## Stack Quick-Reference

| Layer | Technology |
|-------|------------|
| Backend runtime | Node.js 22, Express 5 |
| Database ORM | Prisma 7 with `@prisma/adapter-pg` (pg.Pool driver adapter) |
| Database | PostgreSQL |
| Cache / Queue | Redis 5 |
| Auth | JWT (access 24h + refresh 7d single-use rotation), bcrypt |
| File upload | multer memoryStorage → AWS S3 or Cloudinary |
| SMS / WhatsApp | Twilio |
| Payments | Razorpay |
| Background jobs | Custom Redis BLPOP queue (not BullMQ) + node-cron |
| Process manager | PM2 (cluster API + fork worker) |
| Real-time | WebSocket (`ws`) bridging Redis pub/sub |
| Frontend | React 19, React Router 7, Vite 7 (SWC), Tailwind CSS 4 |
| State | React Context + useState (no Redux / Zustand / React Query) |
| HTTP client | Native `fetch` |
| Icons | Phosphor Icons + react-icons |

---

## API Response Envelope

Every response uses:
```json
{
  "responseCode": 1000,
  "responseMessage": "Success",
  "responseData": { "result": <payload> }
}
```

Response codes live in `backend/globals/response.json` (1000–1014).
Use `helpers/apiResponse.js` → `response(res, 1000, data)` to send.

---

## Module Creation Loop

To add a new domain feature (e.g. `invoice`):

```bash
# 1. Scaffold files
npm run gen:module invoice

# 2. Add Prisma model
npm run gen:model Invoice id:cuid name:String createdAt:DateTime

# 3. Generate migration
npm run gen:migration add_invoice

# 4. Implement logic in modules/invoice/services/InvoiceService.js

# 5. Wire routes in modules/invoice/routes/invoiceRoutes.js

# 6. routes/index.js is auto-updated by gen:module

# 7. Generate Postman collection
npm run gen:postman "My App API"
```

---

## Auth Pattern

- **Login**: `POST /api/v1/auth/login` → `{ accessToken, refreshToken }`
- **Refresh**: `POST /api/v1/auth/refresh` — rotates refresh token (single-use)
- **Protected routes**: `verifyToken` middleware → `role("admin", "user")` middleware
- **Lockout**: 5 failed attempts → `lockedUntil` set to 15 min from now
- **Forced logout**: increment `tokenVersion` in DB → all existing tokens invalidated

---

## Background Jobs

Enqueue from any service:
```js
const { enqueueJob } = require("../../helpers/queue/jobQueue");
const jobId = await enqueueJob("myJobType", { param1: "value" }, { userId: req.user.id });
```

Worker picks up via BLPOP in `worker.js`. Register handler:
```js
registerHandler("myJobType", require("./jobs/myJobHandler"));
```

Stream progress to the browser via WebSocket at `ws://.../ws/jobs/:jobId?token=<jwt>`.
Handler calls `reportProgress(jobId, pct, message)` during processing.

---

## Frontend Patterns

- All API calls go through `src/server/api.js` — it handles base URL, auth headers, 401 auto-logout
- Auth state lives in `AuthContext` — wrap the app in `<AuthProvider>`
- Protected pages use `<PrivateRoute allowedRoles={["admin"]}>`
- Common UI primitives are in `src/components/common/` — import from the barrel `index.js`
- Data fetching uses `useDataFetch(url, deps)` hook

---

## Deployment

- **Dev**: push to `deployment-dev` branch → GitHub Actions builds Docker image → ECR → EC2 blue-green
- **Prod**: push `v*` tag → same pipeline to production ECR + EC2
- Blue-green: staged container starts on port 4000, requires 3 consecutive `/health` successes before traffic switches
- `start.sh` runs inside the container: `prisma migrate deploy` → `node worker.js &` → `node server.js`

---

## Where to Find Things

| Question | Where to look |
|----------|--------------|
| API response codes | `backend/globals/response.json` |
| Token generation / verification | `backend/helpers/generateToken.js` |
| Rate limiters | `backend/middleware/rateLimit.js` |
| Auth flow (login, refresh, logout) | `backend/modules/auth/services/AuthService.js` |
| Route registration | `backend/routes/index.js` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Job queue | `backend/helpers/queue/jobQueue.js` |
| WS bridge | `backend/helpers/queue/jobWsServer.js` |
| Frontend API client | `frontend/src/server/api.js` |
| Auth context | `frontend/src/contexts/AuthContext.jsx` |
| Common UI | `frontend/src/components/common/index.js` |
| Source traceability | `SOURCE-MAPPING.md` |
| Stack deep-dive | `ARCHITECTURE.md` |
