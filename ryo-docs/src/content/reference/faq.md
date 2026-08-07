# FAQ

## What is this framework?

A production-grade SaaS scaffold: Express 5 + Prisma 7 + PostgreSQL backend, React 19 + Vite + Tailwind 4 frontend, Redis-backed queue/rate limiting/realtime, and blue-green deployment. Auth, jobs, and infra are ready; your product is the domain modules.

## What does it ship with?

Auth (login, rotating refresh, lockout, OTP reset), rate limiting, background jobs with progress streaming, WebSocket hub, audit logging, uploads (S3/Cloudinary), email (SMTP), frontend UI kit + 10 landing templates, CI gates, and dev/prod deploy pipelines.

## What does it NOT ship with?

No AI features, no OAuth/SSO, no MFA, no multi-tenancy enforcement, no billing/payments logic, no admin panel generator. Those are product or future work; the seams exist (jobs, WS hub, subdomain detection).

## Does it use TypeScript?

Backend: no (plain JS ESM). Frontend app code: no (JSX). Only `src/components/designs/` templates are TSX. Validation lives in zod schemas on the backend.

## Why are refresh tokens not JWTs?

A deterministic JWT collided on the unique `tokenHash` column every second login and broke rotation. Opaque `randomBytes(48)` tokens hashed with sha256 are unique by construction and make rotation + reuse detection safe. See ADR-002.

## How do I create a new module?

Follow the module loop: `gen:module` → `gen:model` → `gen:migration` → service → routes → `api.js` namespace → page → route in `App.jsx`. See [Backend > Modules](./backend/modules).

## How do I add a user?

There is no public signup. Run `npm run create:superadmin` (uses `SUPER_ADMIN_SECRET`), then create users from your admin UI/script. This keeps open registration off by default.

## How do I run the integration tests?

Start the two Docker services (`fw-test-pg` :55432, `fw-test-redis` :56379), then `RUN_INTEGRATION=1 npm run test:integration`. See [Testing](./testing).

## How do I deploy?

Push `deployment-dev` for dev, tag `v*` for prod. GitHub Actions builds, pushes to ECR, and blue-green switches on EC2 after 3 healthy `/health/deep` checks. See [Deployment](./deployment).

## Where does the frontend call the API?

Only through `frontend/src/server/api.js`. Never `fetch` directly in pages — you lose auth headers, refresh recovery, and envelope unwrapping.

## What is the response envelope?

`{ responseCode, responseMessage, responseData: { result } }`. Codes 1000–1014 in `backend/globals/response.json`. Success codes: 1000, 1012. See [API Reference](./api).

## Can I use MySQL/PlanetScale or swap Redis?

Database is PostgreSQL + Prisma; adapter swap is possible but not supported (tests target Postgres). Redis is load-bearing (queue, rate limits, pub/sub, OTPs) — prod refuses to boot without it.

## Is the queue durable?

Retries: 3 attempts per job. Crash recovery: stuck `processing` jobs are re-queued on worker start. Delayed schedules and DLQs are not built in.
