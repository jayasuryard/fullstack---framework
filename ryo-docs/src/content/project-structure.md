# Project Structure

Canonical layout of the repository. New code follows this shape; scripts in `backend/scripts/` generate it for you.

## Root

```
.
├── ARCHITECTURE.md          # stack reference, naming conventions, module loop, security checklist
├── AGENTS.md                # agent guide
├── SOURCE-MAPPING.md        # every file: purpose, status, what to customize
├── backend/                 # Express API + worker + Prisma + jobs
├── frontend/                # React SPA + Express static host
└── ryo-docs/                # this docs site
```

## Backend

```
backend/
├── server.js                # Express entry + HTTP server (WS, crons wire here)
├── worker.js                # PM2 worker process — background job consumer
├── ecosystem.config.js      # PM2: cluster (api) + fork (worker)
├── start.sh                 # container entrypoint: migrate → worker → server
├── prisma.config.ts         # Prisma 7 config (datasource URL from env)
├── dockerfile               # node:22-slim, prisma generate, start.sh CMD
├── docker-compose.yml       # single-service compose (external DB/Redis)
├── .github/workflows/
│   ├── deploy.yml           # dev: push deployment-dev → ECR → EC2 blue-green
│   └── deploy-prod.yml      # prod: push v* tag → ECR → EC2 blue-green
├── config/
│   ├── dbConnect.js         # PrismaClient + @prisma/adapter-pg (pg.Pool)
│   ├── redisConfig.js       # Redis client + getCache/setCache/deleteCache
│   ├── s3.js                # AWS S3Client
│   └── cloudinary.js        # Cloudinary v2
├── prisma/
│   └── schema.prisma        # User, RefreshToken, AuditLog base models
│                            # add domain models below the marker
├── globals/
│   └── response.json        # response codes 1000–1014
├── helpers/
│   ├── apiResponse.js       # response('KEY', data) — standard envelope
│   ├── paginate.js          # page/limit/skip + meta helper
│   ├── auditLogger.js       # auditLog.create wrapper
│   ├── generateToken.js     # JWT access + opaque refresh token helpers
│   ├── emailService.js      # SMTP transport (logs in dev when SMTP_HOST unset)
│   ├── ws/
│   │   └── hub.js           # attachWsHub + emitToChannel (Redis pub/sub)
│   └── queue/
│       ├── jobQueue.js      # Redis BLPOP queue (enqueue, status, progress)
│       └── jobWsServer.js   # /ws/jobs/:jobId shim over ws/hub.js
├── middleware/
│   ├── verifyToken.js       # Bearer JWT auth → req.user
│   ├── role.js              # role(...roles) guard
│   ├── accessLevel.js       # read-only enforcement
│   ├── rateLimit.js         # createLimiter() factory + preset limiters
│   └── upload.js            # multer memoryStorage 5 MB
├── modules/
│   └── auth/
│       ├── routes/authRoutes.js    # login, refresh, me, logout, profile, pwd reset
│       └── services/AuthService.js # full auth logic
├── routes/
│   └── index.js             # central router — add module mounts here
├── scripts/
│   ├── generateModule.js    # npm run gen:module <name>
│   ├── generateModel.js     # npm run gen:model <Name>
│   ├── generateMigration.js # npm run gen:migration <name>
│   ├── deployMigration.js   # npm run migrate:deploy
│   ├── generatePostman.js   # npm run gen:postman [name]
│   └── createSuperAdmin.js  # npm run create:superadmin
├── jobs/
│   └── _stub.js             # cron job template
└── workers/
    └── _stub.js             # background job handler template
```

## Frontend

```
frontend/
├── server.js                # Express SPA server with OG meta injection
├── nginx.conf               # alternative: plain nginx static host
├── dockerfile               # multi-stage: builder (Vite) → prod (Express)
├── docker-compose.yml
├── .github/workflows/
│   ├── deploy.yml
│   └── deploy-prod.yml
├── vite.config.js           # plugins: [react(), tailwindcss()] + manualChunks
├── eslint.config.js         # ESLint 9 flat config
├── index.html               # SPA shell with OG placeholders
└── src/
    ├── main.jsx
    ├── App.jsx              # route definitions + DefaultRedirect
    ├── contexts/
    │   └── AuthContext.jsx  # global auth state, useAuth()
    ├── components/
    │   ├── PrivateRoute.jsx
    │   ├── MainLayout.jsx   # desktop sidebar — define NAV_ITEMS
    │   ├── MobileLayout.jsx # mobile bottom nav — define MOBILE_NAV_ITEMS
    │   └── common/          # reusable UI primitives (barrel index.js)
    ├── hooks/
    │   ├── useDataFetch.js  # generic data fetch hook
    │   └── useWebSocket.js  # realtime subscription hook
    ├── server/
    │   ├── api.js           # single API gateway — ALL fetch() calls live here
    │   └── ws.js            # shared WS client (wsClient)
    ├── utils/
    │   └── subdomain.js     # subdomain detection (multi-tenant)
    └── pages/
        ├── auth/            # Login, Forgot, Reset
        ├── DashboardPage.jsx
        ├── designs/         # 10 landing templates (TSX)
        └── _stub.jsx        # page template
```

## Adding a Module (What the Scripts Touch)

1. `gen:module invoice` — creates `backend/modules/invoice/{routes,services}/`, stubs, mounts in `routes/index.js`.
2. `gen:model Invoice ...` — appends a model above the marker in `prisma/schema.prisma` (runs `prisma validate`).
3. `gen:migration add_invoice` — generates the SQL migration.
4. `gen:postman "name"` — scans `routes/index.js` and emits a Postman collection.
