# Project Memory

Where the framework keeps its working memory, and the gotchas that cost time when forgotten. Read `SOURCE-MAPPING.md` and `ARCHITECTURE.md` before touching new areas.

## Canonical Sources

| Question | File |
|----------|------|
| Every file: purpose, status, what to customize | `SOURCE-MAPPING.md` (repo root) |
| Stack, naming, module loop, security checklist | `ARCHITECTURE.md` (repo root) |
| Agent/contributor guide | `AGENTS.md` (repo root) |
| Response codes | `backend/globals/response.json` |
| Env vars | `backend/.env.example` |
| Routes | `backend/routes/index.js` + module routers |
| Schema | `backend/prisma/schema.prisma` (+ migrations) |

## Gotchas That Keep Coming Back

### Refresh tokens are opaque, not JWTs

`randomBytes(48)` → sha256 `tokenHash` in DB. Never sign refresh tokens as JWTs — deterministic values collide on the unique `tokenHash` index and break rotation (ADR-002).

### Prisma 7 has no `url` in schema.prisma

The datasource URL lives in `backend/prisma.config.ts` (env `DATABASE_URL`), and the client needs the `@prisma/adapter-pg` adapter from `config/dbConnect.js`. `prisma generate` must run after schema edits (the dockerfile does it).

### Production refuses to boot without Redis

`server.js` waits up to 15 s for Redis in prod, then exits. If the API won't start in prod, check Redis first.

### Envelope, always

`response('SUCCESS', data)` — not raw `res.json(...)`. BigInt (Prisma `count`) is serialized to string by `apiResponse.js`; do not stringify manually elsewhere.

### Rate limiters are per-prefix

Login: 5/15 min per IP + userName. OTP: 3/1 h. Refresh: 20/15 min. General: 200/min. `TRUST_PROXY=1` behind a proxy or every client shares one IP.

### No axios / Redux / React Query / BullMQ

The stack is deliberately small. New code follows `api.js` + Context + `useState`, and the BLPOP queue.

### Frontend: only designs/ is TSX

`tsc --noEmit` covers `src/components/designs/` only. App code is JSX. Do not "convert" pages to TS.

## Test Infrastructure Memory

- Integration tests need Docker: `fw-test-pg` on **:55432**, `fw-test-redis` on **:56379**. Ports are non-default to avoid clobbering dev services.
- Run with `RUN_INTEGRATION=1 npm run test:integration` (single concurrency).
- The suite wires its own Prisma client + Redis; never point it at dev data.

## Recurring Build Steps

```bash
# after schema change
cd backend && npm run gen:migration <name>

# after module change, re-verify
cd backend && npm run lint && npm test
cd frontend && npm run lint && npm run typecheck && npm run build
cd ryo-docs && npm run build
```
