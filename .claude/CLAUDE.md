# Claude Code Context

## What this is

A production-grade SaaS scaffold. Use it to build new SaaS products by adding domain modules on top of the ready-made auth, infrastructure, and deployment system.

## Stack (at a glance)

- **Backend**: Node.js 22, Express 5, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL, Redis 5
- **Auth**: JWT (24h access + 7d refresh, single-use rotation), bcrypt
- **Queue**: Custom Redis BLPOP (not BullMQ) + node-cron
- **Frontend**: React 19, React Router 7, Vite 7 (SWC), Tailwind CSS 4 (Vite plugin — no config file)
- **State**: React Context + useState — no Redux, no Zustand, no React Query
- **HTTP**: Native `fetch` — no axios on the frontend

## Engineering rules

| Rule | Detail |
|------|--------|
| No TypeScript | Plain `.js` / `.jsx` only |
| Tests | `node:test` (backend) + Vitest (frontend) — run `npm test` in each before finishing |
| No Prettier | ESLint 9 flat config only (`eslint.config.js`) |
| No comments explaining what | Only add comments for non-obvious WHY (constraints, workarounds) |
| No unnecessary abstractions | Three similar lines > premature abstraction |
| No error handling for impossible cases | Trust framework guarantees; validate only at system boundaries |

## Key patterns

### API response envelope
```js
// Backend: every response goes through this
const apiResponse = require('./helpers/apiResponse');
res.json(apiResponse.response('SUCCESS', { items: [...] }));
// → { responseCode: 1000, responseMessage: '...', responseData: { result: { items } } }
```
Codes are in `backend/globals/response.json`.

### Auth middleware chain
```js
router.get('/items',   verifyToken, role('admin'),                    list);
router.post('/items',  verifyToken, role('admin'), requireReadWrite(), create);
```

### Add a new module
```bash
npm run gen:module <name>        # scaffolds routes + service, updates routes/index.js
npm run gen:model <Name> field:Type ...
npm run gen:migration add_<name>
```

### Realtime (shared WS hub)
```js
// Backend — emit from any service or worker:
const { emitToChannel } = require('./helpers/ws/hub');
await emitToChannel('user:' + userId, { event: 'plan-changed' });

// Frontend — subscribe (auto-connects, reconnects with backoff):
import { wsClient } from '../server/ws';
wsClient.onChannel('user:' + userId, (payload) => ...);
// or in React: useWebSocket('user:' + userId, (payload) => ...)
```
Hub is wired in `server.js` (`attachWsHub` + `attachJobWsServer`). Never `new WebSocket()` directly in pages.

### Background job
```js
// Enqueue:
const { jobId } = await enqueueJob('queue:action', payload, { userId: req.user.id });
// Handler: copy workers/_stub.js, register in worker.js
// Stream progress: attach attachJobWsServer(server) in server.js
```

## What to touch before first run

1. `backend/ecosystem.config.js` — change `APP_NAME`
2. `backend/docker-compose.yml` — replace `APP_NAME`
3. `backend/.github/workflows/deploy*.yml` — replace `APP_NAME`
4. `frontend/docker-compose.yml` — replace `APP_NAME`
5. `frontend/.github/workflows/deploy*.yml` — replace `APP_NAME`
6. `backend/.env.example` → copy to `.env`, fill in all values
7. `frontend/.env.example` → copy to `.env`, fill in values
8. `backend/package.json` — rename `saas-framework-backend`

## What needs wiring before production

- `AuthService.js` — password reset is wired: Redis OTP (10-min TTL, 5-attempt cap) + `emailService`. Configure `SMTP_*` env vars for delivery. Reset revokes all refresh tokens + bumps `tokenVersion`.
- `backend/server.js` — WS hub (`attachWsHub` + `attachJobWsServer`) is wired; job progress + generic channels work out of the box
- `MainLayout.jsx` and `MobileLayout.jsx` — define `NAV_ITEMS` with your product's navigation
- `frontend/src/App.jsx` — add all product page routes
- `frontend/src/server/api.js` — add product domain namespaces to the `api` object

## Common pitfalls

- **Prisma 7** uses `@prisma/adapter-pg` — the `new PrismaClient({ adapter })` pattern in `config/dbConnect.js`. Don't change this.
- **Tailwind CSS 4** uses the Vite plugin. Don't add `tailwind.config.js` — it breaks things.
- **React Router 7** — use v7 patterns. Legacy v5 patterns break.
- **Express 5** — async handlers auto-throw; no `try/catch` + `next(err)` needed for unhandled rejections.
- **Redis 5** — uses `redis` npm package v5 with `await client.connect()`. Not ioredis. `server.js` awaits `redisReady` before listening (rate limiter / OTP / WS relay depend on it).
- **PM2 cluster** — rate limits are Redis-backed (`rate-limit-redis`, prefix `rl:`), shared across workers. In-memory fallback if Redis down.
- **No sticky sessions needed** — Redis-backed auth and jobs work across all PM2 instances.

## Files to update when you add features

- `SOURCE-MAPPING.md` — add new files to the reference table with their status
- `AGENTS.md` — update directory layout if new directories are added
- `ARCHITECTURE.md` — update env vars section if new env vars are introduced
