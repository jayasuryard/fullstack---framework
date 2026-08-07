# Architecture Decision Records

## ADR-001: Plain JavaScript Backend

**Status:** Accepted

**Context:** Backend language choice; frontend uses TSX only for design templates.

**Decision:** Backend stays plain JS (ESM, `"type": "module"`). No TS, no transpile step, no build for the API. Frontend app code is JSX; TypeScript is limited to `src/components/designs/`.

**Consequences:** Faster iteration, no build step for the API. Type safety is recovered at the API boundary with zod schemas (`validateBody`).

## ADR-002: Opaque Refresh Tokens (Not JWTs)

**Status:** Accepted

**Context:** Refresh tokens were JWTs; a deterministic JWT collided on the unique `tokenHash` column on every second login and broke rotation.

**Decision:** Refresh tokens are `randomBytes(48)` → base64url, stored as sha256 `tokenHash` (unique index) with DB-side `expiredAt` (7 d). Validation is a DB lookup by hash + `revoked`/`expiredAt` checks. Rotation issues a new pair and revokes the old row.

**Consequences:** Statelessness is lost for refresh (a DB hit per refresh) but rotation is safe, reuse is detectable, and every token is unique by construction.

## ADR-003: Redis BLPOP Queue (No BullMQ)

**Status:** Accepted

**Context:** Background jobs needed retries, progress reporting, and crash recovery without heavy dependencies.

**Decision:** Custom queue on Redis `BLPOP`: `enqueueJob` pushes, the worker pops, `handlers[type]` dispatch with 3 attempts; stuck `processing` jobs are re-queued on worker start. Progress streams over the shared WS hub.

**Consequences:** Simple, dependency-free, works across API cluster + worker fork via shared Redis. Missing features (delayed jobs, DLQ UI) are added in product code when needed.

## ADR-004: Redis-First Rate Limiting with In-Memory Fallback

**Status:** Accepted

**Context:** Rate limit state must survive API cluster instances; Redis outages must not silently weaken limits in production.

**Decision:** `createLimiter()` factory over a `HybridStore`: Redis-backed with per-limiter prefixes; falls back to in-memory sliding windows. In production, boot refuses if Redis is unreachable (15 s race) — no degraded mode in prod.

**Consequences:** Correct cluster-wide limits; prod cannot boot into a vulnerable state; dev keeps working without Redis.

## ADR-005: Prisma 7 Driver Adapters

**Status:** Accepted

**Context:** Prisma 7 requires a driver adapter; `url` moves out of `schema.prisma`.

**Decision:** `@prisma/adapter-pg` over `pg.Pool`, client built in `config/dbConnect.js`; datasource URL in `prisma.config.ts` from `DATABASE_URL`.

**Consequences:** Connection pooling controlled by `pg`; schema file stays portable; `prisma validate` enforced by `gen:model`.

## ADR-006: Single API Gateway on the Frontend

**Status:** Accepted

**Context:** Pages previously could `fetch` directly; auth refresh, envelope unwrapping, and error shapes drifted.

**Decision:** All fetches go through `api.js` — auth headers, `FormData` detection, path params, query strings, singleton refresh (HTTP 401 or envelope 1010), `ApiError`. Pages consume unwrapped results only.

**Consequences:** One place to fix auth/refresh/error behavior; new modules add a namespace, never a new client.

## ADR-007: Lazy Routes + Manual Chunks

**Status:** Accepted

**Context:** Bundle size grows with pages, animation, and icon libraries.

**Decision:** `React.lazy` + `Suspense` per route; Vite `manualChunks` split `vendor-react`, `vendor-anim` (framer-motion), `vendor-icons`.

**Consequences:** Main chunk stays small; heavy libraries load on demand.

## ADR-008: Envelope Responses with HTTP Mapping

**Status:** Accepted

**Context:** Handlers used mixed response shapes; status codes and business codes diverged.

**Decision:** `globals/response.json` owns codes 1000–1014 + HTTP mapping; `apiResponse.send(res, key, data)` sets both. BigInt values serialize to strings.

**Consequences:** Uniform client handling; adding a code means updating the JSON and the docs tables.
