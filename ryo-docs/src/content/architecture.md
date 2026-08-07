# Architecture

## Overview

Two processes run the backend: the **API** (Express 5, PM2 cluster mode) and the **worker** (PM2 fork) that consumes background jobs. Both share the same PostgreSQL (via Prisma 7 + `@prisma/adapter-pg`) and Redis (cache, queue, rate-limit state, pub/sub). The frontend is a React SPA that talks to the API over `/api/v1` and streams realtime events over a single WebSocket.

![Architecture diagram](/Architecture.png)

*System overview: SPA talks to the API over HTTP + WebSocket; API and worker share PostgreSQL, Redis, and object storage; realtime events fan out through Redis pub/sub.*

## Request Flow

1. Express request hits `backend/routes/index.js` → module router.
2. Middleware chain runs: `rateLimit` → `verifyToken` → `role` → `accessLevel` → `validateBody(zod)`.
3. Handler calls a service (`modules/<name>/services/<Name>Service.js`).
4. Service reads/writes via Prisma, Redis cache, queue, S3, or SMTP.
5. Response goes through `helpers/apiResponse.send(res, 'KEY', data)` — every reply uses the envelope.

## Response Envelope

```json
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": { "result": <payload> }
}
```

Codes are defined in `backend/globals/response.json` (1000–1014). The HTTP status is set from the code by `apiResponse.js`. The frontend `api.js` unwraps `responseData.result` automatically; any code other than 1000/1012 throws an `ApiError`.

## Realtime

Backend `helpers/ws/hub.js` provides `attachWsHub(server)` (authenticated WS endpoint at `/ws`) and `emitToChannel(channel, payload)` which publishes to Redis pub/sub; every API instance relays to its connected sockets. The worker and any service can emit. The frontend keeps one `wsClient` connection and subscribes to channels like `job:<jobId>` and `user:<userId>`.

## Background Jobs

Custom queue, not BullMQ: Redis **BLPOP** on a fixed list. `enqueueJob('type', payload, meta)` pushes; the worker pops, looks up `handlers[type]`, runs with 3 attempts, and reports progress through `jobWsServer` → `job:<jobId>` channel. Stuck `processing` jobs are re-queued on worker start. Cron jobs (node-cron) live in `backend/jobs/`, registered in `server.js`.

## Deployment Topology

- Container entrypoint `backend/start.sh`: `prisma migrate deploy` → `node worker.js &` → `node server.js`.
- PM2 `ecosystem.config.js`: API in cluster mode, worker as a fork.
- GitHub Actions (dev/prod) build Docker → push ECR → SSH to EC2 → blue-green switch after 3 consecutive `/health/deep` successes.
- Frontend serves its own build via Express on port 8080 (or nginx); assets are immutable-cached, HTML is no-cache.

## Auth Model

JWT access token (24h, in `Authorization: Bearer`), opaque refresh token (48 random bytes, sha256-hashed in DB, 7d rotation), lockout after 5 failed logins (15 min), `tokenVersion` to kill all sessions, Redis OTP for password reset (6 digits, 10 min TTL, 5 attempts). Details in [Backend > Authentication](./backend/authentication).
