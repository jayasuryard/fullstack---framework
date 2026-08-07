# Deployment

Two deployment targets, both GitHub Actions → ECR → EC2 blue-green:

| Environment | Trigger | ECR repo |
|-------------|---------|----------|
| Dev | push to `deployment-dev` branch | dev ECR |
| Prod | push `v*` tag | prod ECR |

Workflows live in `backend/.github/workflows/` and `frontend/.github/workflows/`.

## Pipeline

1. Checkout → install → run gates (lint, typecheck, tests, build).
2. `docker build` (backend `dockerfile`, frontend multi-stage `dockerfile`).
3. `docker push` to ECR.
4. SSH to the EC2 host.
5. Pull image → start a **staging** container on port 4000.
6. Health check loop: 3 consecutive `/health/deep` successes required.
7. Blue-green switch: stop old container on port 3000, promote the new one.
8. Rollback: if health fails, the old container is restored automatically.

## GitHub Secrets

| Environment | Secrets |
|-------------|---------|
| Dev | `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `VPS_HOST`, `VPS_SSH_KEY`, `ENVFILES` |
| Production | `AWS_ACCESS_KEY_PROD`, `AWS_SECRET_ACCESS_KEY_PROD`, `PROD_VPS_HOST`, `PROD_VPS_SSH_KEY`, `ENVFILES` |

`ENVFILES` carries the runtime `.env` files (mounted into containers). Sensitive values must never be committed.

## Backend Container

- Base image: `node:22-slim`.
- Entrypoint `start.sh`, in order:
  1. `prisma migrate deploy` (apply committed migrations)
  2. `node worker.js &` (background job consumer)
  3. `node server.js` (API)
- PM2 (`ecosystem.config.js`): API in **cluster** mode (scale across cores), worker as a **fork**.
- `docker-compose.yml` is a single service — PostgreSQL and Redis are external (managed DB / managed Redis or another host).

## Frontend Container

- Multi-stage: `builder` (Vite build) → `prod` (Express SPA server).
- Runs as non-root (`USER node`), listens on port 8080.
- `server.js` serves the SPA, injects per-subdomain OG meta tags, and sets cache headers:
  - hashed assets: `Cache-Control: public, max-age=31536000, immutable`
  - HTML shell: `no-cache`
- Alternative: `nginx.conf` static host with the same cache strategy (assets immutable 1y, HTML no-cache).

## Health Checks

- `GET /health` — liveness (process up).
- `GET /health/deep` — checks DB + Redis reachability; used by the blue-green switch.

## Blue-Green Details

- Traffic ports: 3000 (live) / 4000 (staging).
- Switch happens only after 3 consecutive deep-health passes.
- On failure the deploy aborts and the previous container keeps serving.

## Manual Deploy

```bash
cd backend
docker build -t app .
docker compose up -d        # uses external DB/Redis per DOCKER.md
```

See `backend/DOCKER.md` for the full setup guide (ECR, IAM, host preparation).
