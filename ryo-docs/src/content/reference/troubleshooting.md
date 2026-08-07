# Troubleshooting

Common failures and fixes.

## Backend won't start

### Port 3000 in use

```
Error: listen EADDRINUSE :::3000
```

Kill the old process or change `PORT` in `.env`:

```bash
lsof -ti :3000 | xargs kill
```

### Production refuses to boot (Redis)

Prod `server.js` waits up to 15 s for Redis, then exits. Check `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DB` and that Redis is reachable from the container. Dev boots without Redis (in-memory fallback) — this is by design (ADR-004).

### Prisma client missing / outdated

```
PrismaClient is unable to run in this browser environment / P1012 ...
```

Run `npx prisma generate` in `backend/` after schema edits (the dockerfile does it; local dev must too).

## Migrations

### `migrate deploy` fails with drift

Committed migrations disagree with the DB. Inspect:

```bash
cd backend && npx prisma migrate status
```

Fix forward with a new migration (`npm run gen:migration <name>`); do not hand-edit applied migrations.

### `gen:model` rolls back my edit

Expected: the generator runs `prisma validate` and restores the file on failure. Check the field types (whitelist: `String`, `Int`, `Float`, `Boolean`, `DateTime`, `Json`, `?`, `[]`) — a typo like `Datetime` fails validation.

## Login issues

### Account locked

5 failed attempts → 15 min lock (`1008 ACCOUNT_LOCKED`). Wait, or unlock in the DB:

```sql
UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE "userName" = 'admin';
```

### "Invalid credentials" for an existing user

Check the user row: `active = true`, `isDeleted = false`. Both are enforced in `verifyToken`/login. `create:superadmin` needs `SUPER_ADMIN_SECRET` set.

### Every refresh ends in 401

You are passing a JWT as the refresh token. Refresh tokens are opaque 48-byte values from the login response — never decode them, never mint them yourself.

## Rate limiting

### 429 from everything

`TRUST_PROXY=1` unset behind a proxy → all clients share one IP → general limiter (200/min) trips. Set `TRUST_PROXY=1` in prod env.

### Tests or load scripts get limited

Dev limits are real. Either wait out the window or use distinct `userName` values (login is keyed per IP + userName).

## Integration tests

### Docker port conflict on 55432 / 56379

Those ports are reserved for the test stack. Free them or the suite will fail to connect:

```bash
docker rm -f fw-test-pg fw-test-redis
docker run -d --name fw-test-pg -p 55432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saas_framework_test postgres:16
docker run -d --name fw-test-redis -p 56379:6379 redis:7
```

### Suite fails without `RUN_INTEGRATION=1`

Unit tests skip integration by default. Set the env var.

## Frontend

### Login succeeds but `/me` fails on reload

Stored token expired; `AuthContext` validates on mount and clears the session on failure. Expected. Re-login, or check the refresh flow works (refresh token missing from storage breaks silent recovery).

### Vite proxies 404

Dev proxy targets `http://localhost:3000` for `/api` and `/ws`. If the backend runs elsewhere, set `VITE_API_BASE_URL`/`VITE_WS_URL` to the API origin.

### "Missing path param" errors

`api.js` requires every `:param` in the path to be passed in `pathParams`:

```js
api.admin.users.get({ id })   // path '/admin/users/:id'
```

### Build error in designs/ only

Designs are TSX; `npm run typecheck` (`tsc --noEmit`) catches type errors there. App JSX is lint-only — keep designs typed.

## Deployment

### Blue-green switch never happens

Check `/health/deep` on the staging container (port 4000). It must return 200 three consecutive times; it fails fast when DB or Redis is unreachable.

### Container boots but API is down

Entrypoint order is migrate → worker → server. Look at pino JSON logs (request IDs included) and confirm `prisma migrate deploy` exited 0.
