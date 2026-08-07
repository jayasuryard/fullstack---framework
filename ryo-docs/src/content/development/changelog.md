# Changelog

Notable changes to the framework.

## 2026-08 — Auth hardening

- Refresh tokens switched from JWTs to **opaque `randomBytes(48)`** values stored as sha256 `tokenHash` (unique). Fixes a collision bug where a deterministic JWT collided on the unique index every second login and broke rotation.
- Single-use refresh rotation: each refresh consumes the presented token and issues a new pair; reuse revokes the chain.
- Lockout: 5 consecutive failures → `lockedUntil` 15 min; `1008 ACCOUNT_LOCKED`.
- Timing-safe login: bcrypt `DUMMY_HASH` compare when the user is missing (no user enumeration).
- `tokenVersion` session kill switch; `verifyToken` checks version + active + soft-delete.
- Redis OTP password reset: 6-digit, 10 min TTL, 5 attempts, per-user rate limit.

## 2026-07 — Reliability and rate limiting

- Rate limiter rebuilt as `createLimiter()` factory with Redis-backed `HybridStore` and per-limiter prefixes (`rl:login:`, `rl:otp:`, `rl:refresh:`, `rl:general:`); in-memory sliding-window fallback in dev.
- Production boot guard: `server.js` refuses to start when Redis is unreachable (15 s race).
- `api.js` singleton refresh: HTTP 401 or envelope 1010 triggers one refresh, retry once, no refresh loops.
- Upload validation: MIME + extension allowlist, magic-byte sniff, SVG rejected, 5 MB cap.

## 2026-06 — Realtime and jobs

- Redis BLPOP job queue (`helpers/queue/jobQueue.js`): enqueue/status/progress, 3 retries, stuck-job recovery on worker start.
- Shared WS hub (`helpers/ws/hub.js`): `attachWsHub` + `emitToChannel` over Redis pub/sub; job progress channel `/ws/jobs/:jobId`.
- Frontend `wsClient` + `useWebSocket` with reconnect backoff.
- Audit logging helper + 90-day purge cron.

## 2026-06 — Foundation

- Express 5 API, Prisma 7 with `@prisma/adapter-pg` + `prisma.config.ts`.
- Base schema: User, RefreshToken, AuditLog.
- Envelope responses (`responseCode` 1000–1014) + `globals/response.json`.
- Module generators (`gen:module`, `gen:model`, `gen:migration`), super admin script.
- React 19 SPA: lazy routes, manualChunks, common component barrel, 10 landing templates.
- Blue-green deploy pipeline (dev + prod) via GitHub Actions → ECR → EC2.
