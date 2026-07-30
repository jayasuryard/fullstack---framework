# AGENTS.md — Project Guide for AI Agents

Read this file completely before writing any code in this repo.

---

## What This Repo Is

A **production-grade SaaS scaffold** built on a proven stack. Use it to bootstrap new SaaS products (CRM, ERP, LMS, HRMS, Marketplace, etc.) without starting from zero. The auth system, background jobs, deployment pipeline, and common infrastructure are production-ready.

---

## Repository Layout

```
.
├── ARCHITECTURE.md          # Stack reference, naming conventions, module loop, security checklist
├── AGENTS.md                # This file
├── SOURCE-MAPPING.md        # Every file: what it does, status, what to customize
├── .claude/
│   └── CLAUDE.md            # Claude Code session context
│
├── backend/
│   ├── server.js            # Express entry point + HTTP server (WS, crons wire here)
│   ├── worker.js            # PM2 worker process — background job consumer
│   ├── ecosystem.config.js  # PM2: cluster (api) + fork (worker)
│   ├── start.sh             # Container entrypoint: migrate → worker → server
│   ├── prisma.config.ts     # Prisma 7 config
│   ├── dockerfile           # node:22-slim, prisma generate, start.sh CMD
│   ├── docker-compose.yml   # Single-service compose (external DB/Redis)
│   ├── .dockerignore
│   ├── DOCKER.md            # Deployment setup guide
│   ├── .github/workflows/
│   │   ├── deploy.yml       # DEV: push deployment-dev → ECR → EC2 blue-green
│   │   └── deploy-prod.yml  # PROD: push v* tag → ECR → EC2 blue-green
│   │
│   ├── config/
│   │   ├── dbConnect.js     # PrismaClient with @prisma/adapter-pg (pg.Pool)
│   │   ├── redisConfig.js   # Redis client + getCache/setCache/deleteCache
│   │   ├── s3.js            # AWS S3Client
│   │   └── cloudinary.js    # Cloudinary v2
│   │
│   ├── prisma/
│   │   └── schema.prisma    # User, RefreshToken, AuditLog base models
│   │                        # Add product domain models below the marker
│   │
│   ├── globals/
│   │   └── response.json    # Response codes 1000–1014
│   │
│   ├── helpers/
│   │   ├── apiResponse.js   # response('KEY', data) — standard envelope
│   │   ├── paginate.js      # page/limit/skip/meta helper
│   │   ├── auditLogger.js   # auditLog.create wrapper
│   │   ├── generateToken.js # JWT access + refresh token helpers
│   │   └── queue/
│   │       ├── jobQueue.js     # Redis BLPOP queue (enqueue, status, progress)
│   │       └── jobWsServer.js  # WebSocket bridge: Redis pub/sub → browser
│   │
│   ├── middleware/
│   │   ├── verifyToken.js   # Bearer JWT auth → req.user
│   │   ├── role.js          # role(...roles) guard
│   │   ├── accessLevel.js   # read-only enforcement
│   │   ├── rateLimit.js     # createLimiter() factory + preset limiters
│   │   └── upload.js        # multer memoryStorage 5 MB
│   │
│   ├── modules/
│   │   └── auth/
│   │       ├── routes/authRoutes.js    # login, refresh, me, logout, profile, pwd reset
│   │       └── services/AuthService.js # full auth logic
│   │
│   ├── routes/
│   │   └── index.js         # Central router — add module mounts here
│   │
│   ├── scripts/
│   │   ├── generateModule.js    # npm run gen:module <name>
│   │   ├── generateModel.js     # npm run gen:model <Name>
│   │   ├── generateMigration.js # npm run gen:migration <name>
│   │   ├── deployMigration.js   # npm run migrate:deploy
│   │   ├── generatePostman.js   # npm run gen:postman [name]
│   │   └── createSuperAdmin.js  # npm run create:superadmin
│   │
│   ├── jobs/
│   │   └── _stub.js         # Cron job template
│   └── workers/
│       └── _stub.js         # Background job handler template
│
└── frontend/
    ├── server.js            # Express SPA server with OG meta injection
    ├── nginx.conf           # Alternative: plain nginx static host
    ├── dockerfile           # Multi-stage: builder (Vite) → prod (Express)
    ├── docker-compose.yml
    ├── .github/workflows/
    │   ├── deploy.yml
    │   └── deploy-prod.yml
    ├── vite.config.js       # plugins: [react(), tailwindcss()]
    ├── eslint.config.js     # ESLint 9 flat config
    ├── index.html           # SPA shell with OG placeholders
    └── src/
        ├── main.jsx
        ├── App.jsx          # Route definitions + DefaultRedirect
        ├── contexts/
        │   └── AuthContext.jsx  # Global auth state, useAuth()
        ├── components/
        │   ├── PrivateRoute.jsx
        │   ├── MainLayout.jsx   # Desktop sidebar — define NAV_ITEMS
        │   ├── MobileLayout.jsx # Mobile bottom nav — define MOBILE_NAV_ITEMS
        │   └── common/          # 17 reusable UI primitives
        ├── hooks/
        │   └── useDataFetch.js  # Generic data fetch hook
        ├── server/
        │   └── api.js           # Single API gateway — all fetch() calls live here
        ├── utils/
        │   └── subdomain.js     # Subdomain detection (multi-tenant)
        └── pages/
            └── _stub.jsx        # Page template
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js 22, Express 5 |
| Database ORM | Prisma 7 + `@prisma/adapter-pg` (pg.Pool driver) |
| Database | PostgreSQL |
| Cache / Queue | Redis 5 |
| Auth | JWT (24h access + 7d refresh rotation), bcrypt |
| File upload | multer → AWS S3 or Cloudinary |
| Email | AWS SES |
| SMS / WhatsApp | Twilio |
| Payments | Razorpay (unwire if not needed) |
| Background jobs | Custom Redis BLPOP queue + node-cron |
| Process manager | PM2 (cluster API + fork worker) |
| Real-time | WebSocket (`ws`) bridging Redis pub/sub |
| Frontend | React 19, React Router 7, Vite 7 (SWC) |
| Styling | Tailwind CSS 4 (Vite plugin — no config file) |
| State | React Context + useState (no Redux/Zustand/React Query) |
| HTTP client | Native `fetch` (no axios on frontend) |
| Icons | Phosphor Icons + react-icons |

**No TypeScript. No test framework. No Prettier.** ESLint 9 flat config only.

---

## API Response Envelope

Every backend response uses:
```json
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": { "result": <payload> }
}
```

Codes live in `backend/globals/response.json` (1000–1014).
Use `helpers/apiResponse.js` → `response('SUCCESS', data)` to send.
The frontend `api.js` unwraps automatically — pages receive `result` directly.

---

## Module Creation Loop

```bash
# 1. Scaffold backend module
npm run gen:module invoice

# 2. Add Prisma model
npm run gen:model Invoice id:cuid name:String amount:Float createdAt:DateTime

# 3. Run migration
npm run gen:migration add_invoice

# 4. Implement logic in modules/invoice/services/InvoiceService.js
# 5. Wire routes in modules/invoice/routes/invoiceRoutes.js
# 6. routes/index.js is auto-updated by gen:module
# 7. Add API namespace to frontend/src/server/api.js
# 8. Build page in frontend/src/pages/invoice/InvoicePage.jsx
# 9. Add route in frontend/src/App.jsx
# 10. Generate Postman collection
npm run gen:postman "My App API"
```

---

## Auth Pattern

| Endpoint | Route |
|----------|-------|
| Login | `POST /api/v1/common/auth/login` → `{ token, refreshToken, user }` |
| Refresh | `POST /api/v1/common/auth/refresh` — single-use rotation |
| Me | `GET  /api/v1/common/auth/me` |
| Logout | `POST /api/v1/common/auth/logout` |

**Middleware chain for protected routes:**
```js
router.get('/resource',  verifyToken, role('admin'),                     handler);
router.post('/resource', verifyToken, role('admin'), requireReadWrite(), handler);
```

**Force-logout all sessions:** increment `tokenVersion` on the User row.
**Lockout:** 5 consecutive failures → `lockedUntil` set 15 min ahead.

---

## Background Jobs

```js
// Enqueue from any service:
const { enqueueJob } = require('../../helpers/queue/jobQueue');
const { jobId } = await enqueueJob('invoice:send-pdf', { invoiceId }, { userId: req.user.id });

// Handler (workers/invoiceSendPdfJobHandler.js):
async function handleInvoiceSendPdf(payload, { jobId, reportProgress }) {
  await reportProgress(0, 'Starting…');
  // ... work ...
  await reportProgress(100, 'Done.');
  return { sent: true };
}

// Register in worker.js:
handlers['invoice:send-pdf'] = handleInvoiceSendPdf;
```

Stream progress to browser: attach `attachJobWsServer(server)` in `server.js`.
Client connects to `ws://.../ws/jobs/:jobId?token=<jwt>`.

---

## Frontend Patterns

| Pattern | Where |
|---------|-------|
| All API calls | `src/server/api.js` — never call `fetch()` directly in pages |
| Auth state | `useAuth()` from `AuthContext` |
| Protected pages | `<PrivateRoute allowedRoles={['admin']}>` |
| Data fetching | `useDataFetch(() => api.feature.list(query), [deps])` |
| UI primitives | `import { Button, Table, Modal } from '../components/common'` |
| Navigation | Define `NAV_ITEMS` in `MainLayout.jsx` |

---

## Deployment

- **Dev**: push to `deployment-dev` → GitHub Actions builds Docker → ECR → EC2 blue-green
- **Prod**: push `v*` tag → same pipeline to prod ECR + EC2
- **Blue-green**: staged container on port 4000, requires 3 consecutive `/health` successes before traffic switches to port 3000
- **Container entrypoint**: `start.sh` runs `prisma migrate deploy` → `node worker.js &` → `node server.js`

**GitHub Secrets needed:**

| Environment | Secrets |
|-------------|---------|
| Dev | `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `VPS_HOST`, `VPS_SSH_KEY`, `ENVFILES` |
| Production | `AWS_ACCESS_KEY_PROD`, `AWS_SECRET_ACCESS_KEY_PROD`, `PROD_VPS_HOST`, `PROD_VPS_SSH_KEY`, `ENVFILES` |

---

## Where to Find Things

| Question | File |
|----------|------|
| Response codes | `backend/globals/response.json` |
| Token generation | `backend/helpers/generateToken.js` |
| Rate limiters | `backend/middleware/rateLimit.js` |
| Auth flow | `backend/modules/auth/services/AuthService.js` |
| Route registration | `backend/routes/index.js` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Job queue | `backend/helpers/queue/jobQueue.js` |
| WS progress bridge | `backend/helpers/queue/jobWsServer.js` |
| Frontend API client | `frontend/src/server/api.js` |
| Auth context | `frontend/src/contexts/AuthContext.jsx` |
| Common UI | `frontend/src/components/common/index.js` |
| File statuses + open decisions | `SOURCE-MAPPING.md` |
| Stack deep-dive | `ARCHITECTURE.md` |
