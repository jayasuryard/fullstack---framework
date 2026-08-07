# Installation

## Prerequisites

- Node.js **>= 22** (backend uses Node 22 features; `package.json` enforces it)
- npm (or pnpm/yarn — the repo ships lockfiles for npm)
- PostgreSQL (14+)
- Redis 5+
- Docker (only required for the integration test suite)

## 1. Backend

```bash
cd backend
cp .env.example .env
npm install
```

### Environment Variables (`backend/.env.example`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 3000) |
| `NODE_ENV` | `development` / `production` |
| `DATABASE_URL` | Postgres connection string |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` | Redis connection |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | access token signing (default 24h) |
| `REFRESH_SECRET`, `REFRESH_EXPIRY` | refresh token signing + lifetime (default 7d) |
| `JWT_CONTEXT_EXPIRES_IN` | context/short-lived token (default 30m) |
| `FRONTEND_URL` | CORS / links origin |
| `TRUST_PROXY` | set `1` behind reverse proxy (rate limiting) |
| `SUPER_ADMIN_SECRET` | bootstraps the super admin via `create:superadmin` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | email transport (dev logs instead of sending) |
| `S3_*` / `CLOUDINARY_*` | file storage (only if used) |
| `RUN_INTEGRATION` | set `1` to run integration tests |

### Database

```bash
npm run migrate:deploy      # apply committed migrations (prod-safe)
# during development, to create a new migration:
npm run gen:migration <name>
```

Prisma 7 uses the `@prisma/adapter-pg` driver adapter; the datasource URL is read from `prisma.config.ts`, not from `schema.prisma`.

### Super Admin

```bash
npm run create:superadmin
```

Reads `SUPER_ADMIN_SECRET` and creates/updates the bootstrap admin. Run it after a fresh database.

### Run

```bash
npm run dev        # nodemon, port 3000
```

## 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # Vite dev server
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API origin, default `/api` (dev proxy) |
| `VITE_WS_URL` | WS origin, defaults to same host |

Vite proxies `/api` and `/ws` to `http://localhost:3000` in development. No proxy config needed in production — the SPA and API are served from the same domain (or set `VITE_API_BASE_URL`/`VITE_WS_URL` to the API origin).

## 3. Verify

```bash
# backend
npm test                    # unit tests (node:test)

# integration (needs Docker)
docker run -d --name fw-test-pg -p 55432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saas_framework_test postgres:16
docker run -d --name fw-test-redis -p 56379:6379 redis:7
RUN_INTEGRATION=1 npm run test:integration

# frontend
npm test                    # vitest
npm run lint
npm run build
```

## 4. Production (Docker)

```bash
cd backend
docker compose up -d        # external DB/Redis expected; see DOCKER.md
```

Full deployment (ECR + EC2 blue-green) in [Deployment](./deployment).
