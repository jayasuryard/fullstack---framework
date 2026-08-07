# Security

Security posture of the framework: layered auth, Redis-backed rate limiting, validated uploads, helmet, boot-time guards, audit logging. No MFA, no OAuth, no SSO — add them as product modules if needed.

## Defense in Depth

1. **Boot guard** — in production `server.js` refuses to start when Redis is unreachable (15 s race). No silent degradation to a vulnerable in-memory-only state in prod.
2. **Rate limiting** — `middleware/rateLimit.js` HybridStore: Redis-backed with per-limiter prefixes (`rl:login:`, `rl:otp:`, `rl:refresh:`, `rl:general:`); falls back to in-memory sliding windows in dev.
3. **AuthN** — `verifyToken` (JWT) → `req.user`; role + access-level guards; opaque rotating refresh tokens.
4. **Validation** — zod `validateBody` on every mutating route; no hand-rolled checks.
5. **Headers** — helmet middleware sets security headers.
6. **Uploads** — allowlist + magic bytes + SVG rejection + 5 MB cap.
7. **Logging** — pino JSON logs with request IDs; audit trail for sensitive actions.
8. **Container** — frontend runs as non-root `USER node`; entrypoint applies migrations before serving.

## Auth Hardening

- **Timing-safe login**: bcrypt compare runs against `DUMMY_HASH` when the user is missing — identical response time, prevents user enumeration.
- **Lockout**: 5 consecutive failures → `lockedUntil` 15 min → `1008 ACCOUNT_LOCKED`. Counter resets on success.
- **Opaque refresh tokens**: `randomBytes(48)` → sha256 `tokenHash` in DB (unique), 7 d `expiredAt`, single-use rotation, reuse revokes the chain.
- **Session kill switch**: bump `tokenVersion` → every access JWT instantly invalid, all sessions die.
- **OTP reset**: 6-digit, Redis TTL 10 min, 5 attempts, per-user rate limit.

## Rate Limiting Details

```js
// middleware/rateLimit.js
export const loginLimiter   = createLimiter('rl:login:',   { windowMs: 15*60*1000, limit: 5 })
export const otpLimiter     = createLimiter('rl:otp:',     { windowMs: 60*60*1000,  limit: 3 })
export const refreshLimiter = createLimiter('rl:refresh:', { windowMs: 15*60*1000, limit: 20 })
export const generalLimiter = createLimiter('rl:general:', { windowMs: 60*1000,    limit: 200 })
```

- Login is keyed by **IP + userName** (limits per-account brute force, not just per-IP).
- Responses: `1007 RATE_LIMITED` + `Retry-After` header.
- `TRUST_PROXY=1` required behind a reverse proxy so IPs resolve correctly.

## Upload Validation (`middleware/upload.js`)

| Check | Rule |
|-------|------|
| Size | 5 MB max (multer memory storage) |
| MIME | allowlist (`image/jpeg`, `image/png`, `image/webp`, ...) |
| Extension | allowlist matching the MIME |
| Magic bytes | file signature sniffed — rejects renamed executables |
| SVG | explicitly rejected (XSS vector) |
| Overflow | file-count/field errors handled → `1001` |

## Realtime Security

- WS endpoint `/ws` authenticates via `?token=` (browsers cannot set WS headers); on reconnect the latest (rotated) token is used.
- `jobWsServer` refuses job channels without a matching owner (`meta.userId` required at enqueue).
- Emits are scoped per channel (`user:<id>`, `job:<id>`); the hub is the only way to push to sockets.

## Secrets Hygiene

- `.env` never committed; `ENVFILES` secret holds runtime env on deploy hosts.
- `JWT_SECRET` / `REFRESH_SECRET` strong random; distinct from each other.
- `SUPER_ADMIN_SECRET` gates admin bootstrap.
- GitHub secrets per environment (dev vs prod keys, hosts, SSH keys).

## Audit Logging

`helpers/auditLogger.js` wraps `AuditLog` creation:

```js
await auditLogger.log({
  userId: req.user.id,
  action: 'invoice.paid',
  entityType: 'Invoice',
  entityId: id,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  metadata: { amount },
})
```

Purge: cron job deletes rows older than 90 days (03:00 daily).

## Security Checklist (per module)

- [ ] `verifyToken` on every protected route
- [ ] `role(...)` + `requireReadWrite()` on mutations
- [ ] zod schema on every body/query
- [ ] rate limiter on auth-y endpoints
- [ ] no raw SQL, no `$queryRaw` with interpolation
- [ ] no secrets in logs; pino redacts where needed
- [ ] uploads through `validatedUpload` only
- [ ] audit log on sensitive mutations
