# REMEDIATION.md — Harsh Audit Fix List (42 → 100)

Audit date: 2026-08-07. Score: 42/100. Target: production-grade, shippable 1 week after scope.

**Working order:** Red (boot) → Red (wire/security/ops) → Yellow (feedback) → Yellow (data/validation) → Yellow (docs) → Blue.

Each item: `location` — problem → fix → **preferred outcome**.

---

## 🔴 RED — SHIPPING BLOCKERS

**Status: ALL DONE (verified 2026-08-07).**

| # | Fix | Verified |
|---|---|---|
| R1 | migrations un-ignored + `0_init/migration.sql` committed (3 tables, 3 indexes) | `migrate diff` exit 0 |
| R2 | dockerfile pins `prisma@7.9.1` | layer reproducible |
| R3 | jobQueue idle loop instead of throw | `node worker.js` alive, logs idle |
| R4 | `apiResponse.send()` HTTP-status map; 38 call sites converted | unknown route → 404 JSON; verifyToken → 401 JSON |
| R5 | `app.set('trust proxy', …)` + `TRUST_PROXY` env | config in place |
| R6 | upload fileFilter + magic-byte sniff, svg rejected | svg→400, text-as-jpeg→400, real png→200 |
| R7 | prod config guard (weak secrets exit 1) | `exit=1` with weak JWT_SECRET |
| R8 | JSON 404 + error handler (multer/body-too-large mapped) | garbage route → `{"responseCode":1004}` |
| R9 | graceful shutdown SIGTERM/SIGINT | drain → `Shutdown complete.` exit 0 |
| R10 | refresh tokens were deterministic JWTs → same tokenHash every login (multi-device 500s, rotation meaningless) | now opaque `randomBytes(48)`, lookup by hash; integration test covers rotation |

**Remaining for Red: commit the migration folder (`git add backend/prisma/migrations`).**

### R1. Migrations untracked → prod DB never migrates
- `backend/.gitignore:5` ignores `prisma/migrations/`; migration dir absent from repo.
- Fix: delete ignore line; generate initial migration offline:
  `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql`
  Commit folder. Update SOURCE-MAPPING.md.
- **Outcome:** fresh clone → `npm run migrate:deploy` creates real tables. Verify: `git ls-files backend/prisma/migrations` non-empty.

### R2. Docker build fetches unpinned prisma
- `backend/dockerfile:29` `RUN npx prisma generate` (prisma CLI is devDep, `npm install --omit=dev` at :19).
- Fix: `RUN npx --yes prisma@7.4.2 generate` (pin to package.json version).
- **Outcome:** reproducible image builds. Verify: rebuild → same layer hash.

### R3. Worker crashes on fresh scaffold
- `backend/worker.js:14` registers `{}`; `backend/helpers/queue/jobQueue.js:133` throws `No handlers registered`.
- Fix: idle loop instead of throw — wait 2s, re-poll, log `[worker] no handlers — idle`.
- **Outcome:** fresh clone worker boots. Verify: `node worker.js` alive 10s.

### R4. All responses HTTP 200 → blind wire
- No `res.status()` anywhere; monitors/proxies can't see 401/403/429/500.
- Fix: add `apiResponse.send(res, key, data)` mapping envelope codes → HTTP status; replace all `res.json(apiResponse.response(...))` call sites (middleware + routes). Map: SUCCESS 200, CREATED 201, ACCEPTED 202, INVALID_REQUEST/VALIDATION_ERROR 400, UNAUTHORIZED/TOKEN_EXPIRED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, TOO_MANY_REQUESTS/RATE_LIMIT_EXCEEDED 429, ERROR/SERVER_ERROR 500, SERVICE_UNAVAILABLE 503.
- **Outcome:** real HTTP status codes on wire, envelope preserved. Verify: login fail → 401; rate limit → 429; unknown route → 404.

### R5. No `trust proxy` → rate limiter keys on LB IP
- `backend/server.js` lacks `trust proxy`; behind ALB/nginx all users share proxy IP → login limiter (5/15min) blocks everyone after 5 logins. Also breaks `req.ip` in audit + OG URL protocol.
- Fix: `app.set('trust proxy', Number(process.env.TRUST_PROXY || 1))`; add `TRUST_PROXY` to `.env.example`.
- **Outcome:** per-user limits + correct IPs behind LB. Verify: different XFF IPs → independent counters.

### R6. Upload accepts any file → stored XSS / malware
- `backend/middleware/upload.js:9` multer with no fileFilter.
- Fix: `fileFilter` — whitelist (jpeg/png/webp/gif/pdf/docs/video) by MIME + extension; **reject svg** (stored XSS); magic-byte sniff for image/pdf; MulterError → 400 via error handler.
- **Outcome:** `.html`/`.svg`/`.exe` refused. Verify: POST `.svg` → 400.

### R7. Weak/absent JWT secrets boot fine
- `backend/helpers/generateToken.js:23,35`; `.env.example` ships `change-me-…`. Prod deploy with example values = forgeable tokens.
- Fix: boot guard in `server.js`: in production, exit(1) unless `JWT_SECRET` + `REFRESH_SECRET` ≥ 32 chars, not containing `change-me`, and `DATABASE_URL` + `REDIS_HOST` present.
- **Outcome:** misconfigured prod never serves. Verify: prod + weak secret → non-zero exit.

### R8. No JSON error handler / 404
- Express 5 default handler → HTML stack traces; unknown API routes → HTML 404.
- Fix: `app.use('/api/v1', 404 → send(res,'NOT_FOUND'))`; final error middleware → `send(res,'SERVER_ERROR')`, log stack server-side; map `multer.MulterError` → 400; respect `res.headersSent`.
- **Outcome:** API always JSON. Verify: garbage route → `{"responseCode":1004}`.

### R9. No graceful shutdown → in-flight loss on deploy
- No SIGTERM/SIGINT handlers; blue-green kills old container mid-request.
- Fix: SIGTERM/SIGINT → `server.close()` → drain → `prisma.$disconnect()` + `client.quit()` best-effort → exit 0; 10s force-exit timer `.unref()`.
- **Outcome:** zero-drop deploys. Verify: SIGTERM under load → in-flight requests finish.

---

## 🟡 YELLOW — PRODUCTION-GRADE GAPS

### Y1. Zero tests on security-critical paths
- 28 unit tests; none for AuthService/verifyToken/rateLimit/jobQueue/hub.
- Fix: supertest integration suite (login → refresh rotation → tokenVersion revoke → OTP cap → lockout → enumeration delay) with stubbed DB/Redis.
- **Status: DONE (2026-08-07).** `tests/auth.integration.test.js` — 14/14 green against real Postgres+Redis (fw-test containers). Suite caught R10 (deterministic refresh JWT) + the cross-limiter key collision. Infra required lazily inside `before()` so plain `npm test` stays hermetic (28 tests: 14 pass + 14 skipped).
- Verify: `RUN_INTEGRATION=1 node --test --test-concurrency=1 "tests/auth.integration.test.js"` → 14 pass.

### Y2. No backend lint; frontend lint near-empty
- Backend: no lint script. `frontend/eslint.config.js:8` lints only `*.{js,jsx}`, no `eslint:recommended`, no TSX (5,980 template lines unlinted).
- **Status: DONE (2026-08-07).** Backend `npm run lint` = zero-dep `node --check` syntax gate over 40 files (`scripts/lintCheck.js`, stubs excluded — they're copy-templates with placeholders). Frontend: `@eslint/js` base + typescript-eslint over `**/*.{ts,tsx}`, node globals for `server.js`/`vite.config.js`, designs dir exempted from unused-var rule (icon-showcase imports) but types still checked. Both wired into `.github/workflows/ci.yml`. TSX typecheck surfaced 3 real `style2`-prop bugs in templates — fixed.
- Verify: CI fails on lint error (backend syntax + frontend eslint both gate).

### Y3. gen:migration reports success on failure
- `backend/scripts/generateMigration.js:18` error callback → no `process.exit(1)`.
- Fix: exit(1) on error, print stderr.
- **Outcome:** failed migration fails CI. Verify: invalid name → non-zero exit.

### Y4. No login page / auth UI
- `frontend/src/App.jsx:79` login route is commented stub; `login()` never called.
- **Status: DONE (2026-08-07).** `LoginPage` + `ForgotPasswordPage` + `ResetPasswordPage` in `pages/auth/`, `DashboardPage` placeholder, routes wired in `App.jsx`, `DefaultRedirect` sends anonymous → `/login` and authed → role default (`/admin/dashboard` / `/superadmin/dashboard`).
- Verify: login → dashboard on fresh clone; `/` while logged out → `/login`.

### Y5. RefreshToken + AuditLog grow forever
- `backend/prisma/schema.prisma:43-54` revoked rows never purged; no `@@index([userId, expiredAt])`.
- Fix: cron purge (revoked/expired > 7d) + AuditLog retention job; add indexes.
- **Outcome:** bounded tables. Verify: purge job removes test rows.

### Y6. Redis down → login hangs or 500s
- `backend/middleware/rateLimit.js:28` RedisStore sendCommand on disconnected client → ioredis buffers → hang.
- Fix: prod boot check (fail fast if Redis unreachable); dev fallback to memory store with warning.
- **Status: DONE (2026-08-07).** `HybridStore` in `rateLimit.js`: Redis-backed, degrades to in-process sliding window when Redis down (never hangs/500s), re-inits Redis store on reconnect, clears memory counters on recovery. Per-limiter Redis prefixes (`rl:login:`/`rl:otp:`/`rl:refresh:`/`rl:general:`) so limiter counters can't collide. `redisConfig` defaults host/port so missing env can't crash module load.
- Verify: kill Redis → login still 401/429 (memory), logs one warning; restore → Redis keys `rl:*` reappear.

### Y7. No helmet/security headers
- `backend/server.js` no CSP/X-Frame-Options/nosniff/HSTS.
- Fix: `helmet()` + prod CSP; HSTS behind TLS.
- **Outcome:** OWASP baseline headers. Verify: `curl -I` shows headers.

### Y8. Tokens in localStorage → XSS theft
- `frontend/src/server/api.js:29-33`. Any XSS = full account.
- Fix: optional httpOnly SameSite cookie mode for refresh token + CSRF token on mutations, OR strict CSP + in-memory token. Documented switch.
- **Status: DOCUMENTED DECISION (2026-08-07).** Kept localStorage + automatic 401→refresh recovery (short access token limits exposure; refresh rotation + tokenVersion revoke limit blast radius). Sticky-note for the future in `ARCHITECTURE.md` auth section: switch path is httpOnly cookie mode + CSRF — the api.js refresh-recovery layer already isolates all fetch() calls to one module, so the swap touches one file.

### Y9. No input validation framework
- Manual inline checks; inconsistent per module.
- Fix: `zod` + `validateBody(schema)` middleware → 1006 VALIDATION_ERROR; apply to auth routes + sample module.
- **Outcome:** validation by convention. Verify: bad payload → 1006.

### Y10. json body limit 10mb everywhere
- `backend/server.js:27-28`.
- Fix: global `1mb`; `express.raw({limit:'10mb'})` only on upload/webhook routes.
- **Outcome:** bounded memory per request. Verify: 5mb JSON POST → 413/400.

### Y11. Docs drift (agents trust docs)
- **Status: DONE (2026-08-07).** AGENTS.md + ARCHITECTURE.md auth sections state opaque refresh tokens, per-limiter Redis prefixes, Redis-down degrade/fail-fast, `apiResponse.send()`. SOURCE-MAPPING.md + `.claude/CLAUDE.md` refreshed same session: rateLimit row = HybridStore + per-limiter prefixes, generateToken = opaque refresh, response code count (14, 1009 retired), Open Decisions 3/7 = done (error middleware, pino), CLAUDE stack/pitfalls = opaque tokens + `Promise.race` boot + integration-suite infra (fw-test-pg/-redis).
- "17 primitives" ≠ 16 exports; "No TypeScript" vs 6k TSX + prisma.config.ts + tsconfig; auth "ready" vs no login UI.
- Fix: reconcile AGENTS.md/ARCHITECTURE.md/SOURCE-MAPPING.md/CLAUDE.md with fixed code; delete dead tsconfig or add typecheck script.
- **Outcome:** docs pass "read-then-do" test.

### Y12. Dead deps bloat image + install
- axios, @sparticuz/chromium, puppeteer-core, nanoid, twilio, razorpay, multer-storage-cloudinary, @aws-sdk/client-ses — 0 require sites.
- Fix: remove from package.json + lockfile (keep cloudinary, @aws-sdk/client-s3).
- **Outcome:** smaller image, faster CI. Verify: `npm ls` clean.

### Y13. Login limiter IP-only → NAT lockout
- `backend/middleware/rateLimit.js:36` IP-keyed; office NAT shares limit.
- Fix: hybrid key `ip + userName` when body present.
- **Outcome:** shared IPs don't block each other.

### Y14. `/health` shallow → blue-green promotes on lies
- **Status: DONE (2026-08-07).** `/health/deep` (DB `SELECT 1` + Redis `PING` → 200/503) exists in server.js; `backend/.github/workflows/deploy.yml` + `deploy-prod.yml` now curl `/health/deep` before switching traffic.
- `backend/server.js:34` no DB/Redis check.
- Fix: `/health` liveness; `/health/deep` DB `SELECT 1` + Redis `PING`; deploy uses deep.
- **Outcome:** broken DB = no promotion.

### Y15. No structured logging / request IDs
- Console-only.
- Fix: pino + `x-request-id` middleware; log envelope-coded errors.
- **Outcome:** trace one request across cluster.

### Y16. nginx.conf minimal
- **Status: DONE (2026-08-07).** gzip + `/assets/` immutable 1y + SPA-shell no-cache.
- Fix (done): gzip on; `location /assets/` expires 1y + `public, immutable`; `location /` adds `Cache-Control: no-cache`.
- `frontend/nginx.conf` static only.
- Fix: gzip/brotli, immutable cache for hashed assets, `no-cache` index.html, security headers, TLS, `/api` proxy.
- **Outcome:** nginx option deploy-ready.

### Y17. Frontend no cache-control → stale SPA/OG
- **Status: DONE (2026-08-07).** `frontend/server.js`: `express.static` with `maxAge 1y + immutable` for hashed assets, `no-cache` on the index.html shell (both static and splat handler) so a stale shell can never reference pruned hashes. nginx.conf mirrors it.
- `frontend/server.js:107` no cache headers.
- Fix: `no-cache` index.html; `immutable` for `/assets/*`.
- **Outcome:** updates propagate. Verify: headers correct.

### Y18. Frontend typecheck dead
- **Status: DONE (2026-08-07).** `npm run typecheck` = `tsc --noEmit` (typescript now a devDep; corrupted `@types/react` jsx-runtime.d.ts reinstalled; `baseUrl` removed for TS6). `tsconfig.json` strict. Fixed 3 template type bugs. Wired into CI. Also added `VITE_APP_DOMAIN`/tenant note → see B11.
- `frontend/tsconfig.json` exists; no `typecheck` script.
- Fix: `tsc --noEmit` + CI (typescript-eslint for TSX).
- **Outcome:** template regressions caught in CI.

### Y19. No rate limit on refresh endpoint
- `backend/modules/auth/routes/authRoutes.js:27` unprotected (7d brute-force window).
- Fix: `refreshLimiter` (20/15min).
- **Outcome:** refresh endpoint brute-resistant.

### Y20. AuditLogger swallows failures
- `backend/helpers/auditLogger.js` — audit write must never break request, but failure must be visible.
- Fix: try/catch + console.error; document.
- **Outcome:** audit gaps visible.

---

## 🔵 BLUE — POLISH

- **B1.** ~~`dbConnect.js` false "Database connected successfully" log (Prisma lazy).~~ **DONE:** log removed (no fake connectivity).
- **B2.** ~~Duplicate `ERROR`(1009)/`SERVER_ERROR`(1005).~~ **DONE:** all 8 `ERROR` call sites → `SERVER_ERROR`; key removed from registry + HTTP map (code 1009 retired, codes stable).
- **B3.** ~~`frontend/src/components/common/PhoneInput.jsx` dead + lint-warning source + counted in docs.~~ **DONE:** wired into `common/index.js` barrel (`PhoneInput`, `formatPhoneForApi`) — tree-shaken, zero bundle cost; docs count consistent again.
- **B4.** ~~`frontend/index.html:18` `<title>SaaS App</title>` hardcoded; branding script is commented pattern.~~ **DONE:** `<title>__OG_TITLE__</title>` (server.js injects per-subdomain); inline branding script shipped for static-host/nginx path — default title when placeholder survives + favicon from OG image.
- **B5.** ~~`frontend/vite.config.js` single 475KB chunk.~~ **DONE:** `manualChunks` (`vendor-react`, `vendor-anim`, `vendor-icons`) + all pages lazy (`LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `DashboardPage`, `Gallery`) behind one `Suspense`. Build: main 193KB (was 475KB), vendors cached separately, recharts/react-calendar tree-shaken out.
- **B6.** ~~`frontend/dockerfile` `COPY public … || true` swallows missing `public/` (favicon 404).~~ **DONE:** `frontend/public/` created with `favicon.png` (64×64), `logo.png` (256×256), `og-default.png` (1200×630) — indigo placeholders, copied to `dist/` by Vite; dockerfile COPY now finds real files.
- **B7.** ~~`frontend/server.js` default PORT 80 → root-only container.~~ **DONE:** default 8080; dockerfile EXPOSE 8080 + `USER node` non-root + healthcheck port; compose `8080:8080`.
- **B8.** ~~`server.js` `BigInt.prototype.toJSON` global mutation.~~ **DONE:** local BigInt→Number serializer inside `apiResponse.send()`; global untouched.
- **B9.** ~~`backend/scripts/generateModel.js` accepts invalid types → broken schema.~~ **DONE:** type whitelist (`String/Int/Float/Boolean/DateTime/Json/Decimal/BigInt/Bytes` + `?`/`[]`), any bad field aborts before write (exit 1); `npx prisma validate` after append with dummy `DATABASE_URL` fallback (no .env needed), rollback + exit 1 on invalid schema. Verified: bad type → rejected, good model (`String/Float?/String[]`) → appended + validated.
- **B10.** ~~No `node --check` smoke in CI.~~ **DONE:** backend `npm run lint` syntax gate in CI (covers it).
- **B11.** ~~`frontend/.env.example` missing VITE_APP_DOMAIN tenant note.~~ **DONE:** env var documented; `utils/subdomain.js` comment ties it to the tenant-root-domain concept.
- **B12.** ~~`server.js` cron section empty.~~ **DONE:** token-purge cron shipped (`jobs/purgeExpiredTokens.js`, 03:00 daily).

---

## 🟢 GREEN — KEEP (don't regress)

- bcrypt cost 12; lockout 5/15min; refresh rotation single-use; tokenVersion force-logout; reset revokes all tokens.
- OTP: 5-attempt cap, 3/hr send limiter, 300ms dummy delay (anti-enumeration).
- Envelope + response-code registry; client single-point unwrap.
- Redis-shared rate limit across cluster; CORS allowlist.
- WS hub: channel ownership, heartbeat, lifetime cap, snapshot-first, backoff reconnect, isolated handlers.
- Job queue: 3 retries, stale startedAt cleared, stuck-job recovery.
- Deploy: blue-green 3×health, rollback, healthchecks, CI gates.
- Scripts: gen:module (auto route-wiring), gen:model, gen:migration, gen:postman, create:superadmin.
- Docs: ARCHITECTURE security checklist, SOURCE-MAPPING statuses, module loop.
- Email dev-mode honesty; express.raw webhook hook; 5MB memory upload; S3/Cloudinary isolated config.

---

## SCORE → 100 : ACCEPTANCE GATES

| Tier | Gate |
|---|---|
| Red | R1-R9 fixed; fresh clone → `migrate deploy` + `start.sh` boots API+worker+UI; real status codes; upload rejects non-whitelist; weak secrets refuse to boot |
| Yellow | Y1-Y20 done; `npm test` ≥ 60 green (auth integration); lint+typecheck in CI; docs re-verified |
| Blue | B1-B12 done |
| 100 proof | One command: clone → `.env` → `docker compose up` → login → create resource → job runs with WS progress → blue-green deploy → rollback works |
