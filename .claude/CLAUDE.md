# Claude Code Context — Framework/

## What this is

`Framework/` is a reusable SaaS scaffold extracted from a production codebase (`Product/`).
When you work in this directory you are either:

1. **Bootstrapping a new product** — rename files, fill in domain models, implement business logic
2. **Improving the framework itself** — generalizing patterns, filling gaps, improving DX

## Hard Rules (never break these)

| Rule | Detail |
|------|--------|
| `Product/` is **READ-ONLY** | Never create, edit, delete, or reformat anything inside `Product/`. It is the reference source. |
| All work goes in `Framework/` | No exceptions. |
| No invented patterns | Every framework pattern must trace to `Product/`. Gaps are flagged, not filled with guesses. |
| No TypeScript | Plain `.js` / `.jsx` only. |
| No test framework | `Product/` has zero tests. Don't add them unless explicitly asked. |
| No Prettier | ESLint 9 flat config only (`eslint.config.js`). |

## Project structure

```
Framework/
├── backend/   Node.js + Express 5 + Prisma 7 + Redis 5
└── frontend/  React 19 + Vite 7 + Tailwind CSS 4
```

See `AGENTS.md` for the full directory layout and `ARCHITECTURE.md` for the complete stack reference.

## Tech stack (at a glance)

- **Backend**: Node.js 22, Express 5, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL, Redis 5
- **Auth**: JWT (24h access + 7d refresh with single-use rotation), bcrypt
- **Queue**: Custom Redis BLPOP (not BullMQ) + node-cron for scheduled tasks
- **Frontend**: React 19, React Router 7, Vite 7 (SWC), Tailwind CSS 4 (Vite plugin)
- **State**: React Context + useState — no Redux, no Zustand, no React Query
- **HTTP**: Native `fetch` — no axios on the frontend

## Key patterns

### API response envelope
```js
// Every response: { responseCode, responseMessage, responseData: { result } }
const { response } = require("./helpers/apiResponse");
response(res, 1000, { users: [...] });
```
Codes are in `backend/globals/response.json` (1000–1014).

### Auth middleware chain
```js
router.get("/resource", verifyToken, role("admin", "manager"), handler);
```

### Module creation
```bash
npm run gen:module <name>   # scaffolds routes + service + updates routes/index.js
npm run gen:model <Name> field:Type ...
npm run gen:migration add_<name>
```

### Background jobs
```js
const jobId = await enqueueJob("jobType", payload, { userId: req.user.id });
// Worker picks it up. Client streams progress via ws://.../ws/jobs/:jobId?token=<jwt>
```

## What to check before touching auth

The auth system is production-grade. Before changing anything in:
- `helpers/generateToken.js` — understand tokenVersion invalidation
- `modules/auth/services/AuthService.js` — lockout + refresh rotation
- `middleware/verifyToken.js` — tokenVersion check is intentional

## Bootstrapping a new product from this framework

1. Copy `Framework/` to a new directory
2. Replace `APP_NAME` in `docker-compose.yml`, GitHub Actions workflows
3. Rename `saas-framework-backend` in `package.json`
4. Set env vars per `.env.example`
5. Create your Prisma models (`npm run gen:model`)
6. Run migrations (`npm run gen:migration initial_schema`)
7. Create first super admin (`npm run create:superadmin`)
8. Scaffold your first module (`npm run gen:module <name>`)
9. Implement business logic in `modules/<name>/services/`
10. Add routes to `modules/<name>/routes/<name>Routes.js`

## Common pitfalls

- **Prisma 7** uses `@prisma/adapter-pg` driver adapter — do NOT use the old `datasource` URL pattern without it. See `config/dbConnect.js`.
- **Tailwind CSS 4** uses the Vite plugin, not a config file. Adding `tailwind.config.js` will break it.
- **React Router 7** — use `createBrowserRouter` or `<BrowserRouter>` patterns from v7. Legacy v5 patterns don't work.
- **Express 5** — async route handlers throw errors automatically (no `try/catch` + `next(err)` needed for unhandled promises).
- **Redis 5** — uses the `redis` npm package v5 with `await client.connect()`. Not `ioredis`.
- **No sticky sessions** — PM2 cluster mode + Redis-backed auth/jobs means any instance can handle any request.

## Files to update after adding features

- `SOURCE-MAPPING.md` — add traceability for any new Framework file
- `AGENTS.md` — update the directory layout table if you add new directories
- `ARCHITECTURE.md` — update env vars section if you add new config
