# Contributing

## Setup

1. Clone the repo.
2. `cd backend && cp .env.example .env && npm install` — fill `DATABASE_URL`, `JWT_SECRET`, `REDIS_*`.
3. `npm run migrate:deploy` and `npm run create:superadmin`.
4. `cd frontend && cp .env.example .env && npm install`.
5. Run the gates once before touching code (see below).

## Development Loop

Backend:

```bash
npm run dev                 # nodemon on :3000
npm run gen:module invoice  # scaffold a module
npm test                    # unit tests
```

Frontend:

```bash
npm run dev                 # Vite, proxies /api + /ws to backend
npm test                    # vitest
```

## Code Standards

- Backend: plain JS, ESM, no TypeScript. Frontend: JSX, ESM (TSX only in `src/components/designs/`).
- Every API response uses the envelope via `helpers/apiResponse` — never raw shapes.
- Every protected route chains `verifyToken` → `role(...)` → `requireReadWrite()` (mutations) → `validateBody(schema)`.
- All frontend fetches go through `api.js`; all realtime through `wsClient`/`useWebSocket`.
- No new dependencies without justification — the stack is deliberately small (no axios, no Redux, no React Query, no BullMQ).

## Tests

- Backend: `node:test`; integration suite needs Docker (`fw-test-pg` :55432, `fw-test-redis` :56379) + `RUN_INTEGRATION=1`.
- Frontend: Vitest.
- New behavior ships with a test. Auth/queue/upload changes get integration coverage.

## Pull Request Checklist

- [ ] `npm run lint` clean in both workspaces
- [ ] Backend + frontend tests pass
- [ ] Frontend `npm run typecheck` and `npm run build` pass
- [ ] `ryo-docs` build passes if docs changed
- [ ] Migration committed if schema changed
- [ ] `SOURCE-MAPPING.md` updated for new files
- [ ] No secrets, no `.env` in the diff

## Review Etiquette

- Reviews focus on security (auth chains, SQL, uploads), envelope correctness, and conventions.
- Prefer small commits; one concern each.
- Address review comments with new commits — do not rewrite history on shared branches.
