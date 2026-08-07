# Backend Overview

Express 5 API in plain JavaScript (ESM). Entry: `backend/server.js`. A separate worker process (`backend/worker.js`) consumes background jobs. Both are managed by PM2 (`ecosystem.config.js`).

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | >= 22 | runtime |
| Express | 5 | HTTP framework |
| Prisma | 7 (`@prisma/adapter-pg` + `pg.Pool`) | ORM / driver adapter |
| PostgreSQL | — | database |
| Redis | 5 | cache, queue, rate-limit state, pub/sub |
| jsonwebtoken | — | access + context JWTs |
| bcrypt | — | password hashing |
| zod | 4 | request validation (`validateBody`) |
| express-rate-limit + rate-limit-redis | — | rate limiting (HybridStore) |
| helmet | — | security headers |
| multer | 2 | uploads (memory, 5 MB) |
| ws | — | WebSocket hub |
| node-cron | — | scheduled jobs |
| pino + pino-http | — | JSON logging with request IDs |
| nodemailer | — | SMTP email |
| otp-generator | — | reset OTPs |
| aws-sdk (S3) / cloudinary | — | file storage |

## Processes

| Process | Mode | Responsibility |
|---------|------|----------------|
| `server.js` | PM2 cluster | HTTP API, WS hub, cron registration |
| `worker.js` | PM2 fork | BLPOP queue consumer, job handlers |

Entrypoint `start.sh` (container): `prisma migrate deploy` → `node worker.js &` → `node server.js`.

## Layered Architecture

```
routes/index.js           mount module routers at /api/v1/<actor>/<resource>
  └─ modules/<name>/routes/       HTTP concerns, middleware chain
      └─ middleware/              verifyToken, role, accessLevel, rateLimit, validateBody, upload
          └─ modules/<name>/services/   business logic (Prisma, Redis, queue, S3, SMTP)
              └─ helpers/               apiResponse, paginate, auditLogger, generateToken, emailService
                  └─ config/            dbConnect, redisConfig, s3, cloudinary
```

## Directory Map

| Path | Contents |
|------|----------|
| `config/` | Prisma client (`dbConnect.js`), Redis client + cache helpers, S3, Cloudinary |
| `globals/response.json` | response codes 1000–1014 |
| `helpers/` | envelope, pagination, tokens, audit, email, WS hub, queue |
| `middleware/` | auth, roles, access levels, rate limits, upload validation |
| `modules/auth/` | the only domain module — authentication |
| `routes/index.js` | central router (gen:module appends here) |
| `scripts/` | generators + admin tooling |
| `jobs/` | node-cron jobs (template `_stub.js`) |
| `workers/` | job handlers (template `_stub.js`) |
| `prisma/` | schema + migrations |
| `tests/` | node:test unit + integration suites |

## Key Behaviors

- **Envelope**: every reply via `helpers/apiResponse.send(res, key, data)`; HTTP status derived from code.
- **Validation**: zod schemas + `validateBody` middleware on every mutating route.
- **Rate limiting**: Redis-backed hybrid store with per-limiter prefixes; degrades to in-memory windows if Redis drops.
- **Boot guard**: in production, `server.js` refuses to start when Redis is unreachable (15 s race); dev boots anyway.
- **Logging**: pino-http assigns `req.id`; logs are JSON lines.
- **Prisma 7**: datasource URL from `prisma.config.ts`; driver adapter wired in `config/dbConnect.js`.

## Scripts

```bash
npm run dev                 # nodemon
npm start                   # node server.js
npm test                    # unit (node:test)
npm run test:integration    # RUN_INTEGRATION=1
npm run gen:module <name>   # scaffold module
npm run gen:model <Name>    # append Prisma model (validated)
npm run gen:migration <n>   # create migration
npm run migrate:deploy      # apply migrations
npm run create:superadmin   # bootstrap admin
npm run gen:postman [name]  # Postman collection
npm run lint                # scripts/lintCheck.js
```
