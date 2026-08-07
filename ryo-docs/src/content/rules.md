# Development Rules & Conventions

## Language Conventions

| Layer | Language | Module System | Enforcement |
|-------|----------|---------------|-------------|
| Backend | JavaScript (`.js`) | ESM (`"type": "module"`) | ESLint (`scripts/lintCheck.js`) |
| Frontend | JavaScript (`.jsx`) | ESM | ESLint 9 flat config |
| Frontend templates | TypeScript (`.tsx`) — only `src/components/designs/` | ESM | `tsc --noEmit` |
| Database | Prisma Schema (`.prisma`) | — | `prisma validate` (via `gen:model`) |
| Docs | Markdown (`.md`) | — | docs site build |

**No TypeScript in backend or app code. No Prettier.** ESLint only.

## API Conventions

- Prefix: `/api/v1`.
- Every response uses `helpers/apiResponse` → `{ responseCode, responseMessage, responseData: { result } }`.
- Codes from `backend/globals/response.json` — do not invent new ones; add to the file and to this docs table.
- Validation with zod schemas + `validateBody` middleware — never hand-rolled in handlers.
- Pagination via `helpers/paginate.js` with the standard `meta` shape.

## Module Conventions

- One folder per domain in `backend/modules/<name>/` with `routes/` and `services/`.
- Routes register in `backend/routes/index.js` (auto-updated by `gen:module`).
- Services are plain classes/objects; HTTP concerns stay in routes/middleware.
- Domain Prisma models go **above the marker** in `backend/prisma/schema.prisma`.

## Frontend Conventions

- **All** `fetch` calls in `src/server/api.js`; pages never call `fetch` directly.
- **All** WebSocket usage through `src/server/ws.js` (`wsClient`); React components use `useWebSocket`.
- State: Context + useState. No Redux, no Zustand, no React Query, no axios.
- API namespaces mirror backend routes: `api.common.auth.*`, `api.<module>.*`.
- Pages are lazy-loaded; add routes in `App.jsx` with `Suspense`.
- UI primitives come from `src/components/common` barrel (`index.js`).

## Auth Conventions

- `verifyToken` → `req.user`; then `role('admin')`; then `requireReadWrite()` for mutating endpoints on read-only roles.
- Access token: 24h JWT. Refresh: opaque 48-byte token, sha256-hashed in DB, rotated on use, 7d expiry.
- Never store refresh tokens as JWTs (a deterministic JWT collided on unique `tokenHash` and broke rotation — see decisions).
- Password reset: Redis OTP (6 digits, 10 min, 5 attempts). Force logout all sessions: bump `tokenVersion`.

## Naming

- Files: `kebab-case.js`, `PascalCase.jsx` for components/pages, `NameService.js` for services.
- Routes: `kebab-case` paths, `camelCase` methods on services.
- Model names: `PascalCase` singular (Prisma). Fields: `camelCase`. Env vars: `UPPER_SNAKE`.

## Scripts

| Script | Workspace | Purpose |
|--------|-----------|---------|
| `npm run gen:module <name>` | backend | scaffold module + mount route |
| `npm run gen:model <Name> ...` | backend | append Prisma model (validated) |
| `npm run gen:migration <name>` | backend | create migration |
| `npm run migrate:deploy` | backend | apply migrations (prod) |
| `npm run create:superadmin` | backend | bootstrap admin |
| `npm run gen:postman [name]` | backend | Postman collection |
| `npm run lint` / `npm test` / `npm run build` | both | gates |

## Commit Discipline

- Small, focused commits; one concern each.
- Never commit `.env`, secrets, or local test artifacts.
- Run gates before push (lint + tests + build).
- Migrations: committed with their generator script output.
