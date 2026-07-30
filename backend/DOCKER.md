# Docker Setup Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- **External PostgreSQL database** (running locally or remotely)
- **External Redis instance** (running locally or remotely)

## Important Note

This Docker setup **only containerizes the Node.js application**. Database and Redis run externally and are
referenced via environment variables.

Before deploying, replace every occurrence of `APP_NAME` in `docker-compose.yml` and the GitHub Actions
workflows with your actual product name (e.g. `crm`, `hrms`, `marketplace`).

## Quick Start

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Update at minimum:
   - `DATABASE_URL` — PostgreSQL connection string
   - `REDIS_HOST` / `REDIS_PORT` — Redis connection
   - `JWT_SECRET` — generate with `openssl rand -hex 64`
   - `SUPER_ADMIN_SECRET` — used by `npm run create:superadmin`

2. **Install dependencies and generate Prisma client**
   ```bash
   npm install
   npx prisma generate
   ```

3. **Run migrations** (first time or after schema changes)
   ```bash
   npm run gen:migration initial_schema
   ```

4. **Create the first super admin**
   ```bash
   npm run create:superadmin
   ```

5. **Build and start with Docker**
   ```bash
   docker-compose up -d
   ```

6. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

## Scripts Reference

### Development (run locally, not in Docker)
| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm run gen:module <name>` | Scaffold a new module (routes + service) |
| `npm run gen:model <name>` | Append a Prisma model to schema.prisma |
| `npm run gen:migration <name>` | Create and apply a dev migration |
| `npm run gen:postman [name]` | Generate a Postman collection from modules |

### Production
| Script | Purpose |
|--------|---------|
| `npm start` | Start API server (used by Docker CMD) |
| `npm run migrate:deploy` | Deploy pending migrations (CI/CD) |
| `npm run create:superadmin` | Interactive CLI to create the first admin |

## Common Commands

```bash
# View running containers
docker-compose ps

# Stream logs
docker-compose logs -f app

# Shell into running container
docker-compose exec app sh

# Rebuild after code changes
docker-compose up -d --build

# Deploy migrations inside the running container
docker-compose exec app npm run migrate:deploy
```

## Deployment Workflow

### Development (local)
1. Run PostgreSQL and Redis locally
2. Copy `.env.example` → `.env` and fill in values
3. `npm run dev`
4. Edit `prisma/schema.prisma`, then `npm run gen:migration <name>`

### CI/CD (GitHub Actions)
Push to `deployment-dev` branch → triggers `.github/workflows/deploy.yml`:
- Builds Docker image and pushes to AWS ECR
- SSH into EC2, pulls image
- Starts staged container on a temp port, runs 3-consecutive health checks
- On success: swaps traffic (old container → new); on failure: rolls back

Push a `v*` tag → triggers `.github/workflows/deploy-prod.yml` (same pattern, Production environment).

## Required GitHub Secrets

### Dev workflow
| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY` | IAM key with ECR push + EC2 SSH access |
| `AWS_SECRET_KEY` | Corresponding secret |
| `VPS_HOST` | Dev EC2 public IP or hostname |
| `VPS_SSH_KEY` | Private key for `ubuntu` user |

### Prod workflow
| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_PROD` | Production IAM key |
| `AWS_SECRET_ACCESS_KEY_PROD` | Corresponding secret |
| `PROD_VPS_HOST` | Prod EC2 hostname |
| `PROD_VPS_SSH_KEY` | Prod EC2 SSH key |

## Troubleshooting

### App fails to start
1. Check `docker-compose logs app`
2. Verify `DATABASE_URL` and `REDIS_HOST` in your `.env`
3. Confirm Prisma client was generated: `docker-compose exec app ls generated/`

### Database connection refused
If PostgreSQL runs on the host machine, use `host.docker.internal`:
```
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
```

### Redis connection issues
Same pattern — use `host.docker.internal` if Redis is local:
```
REDIS_HOST=host.docker.internal
```

> **Security**: Never commit `.env` files. On production servers the env file lives at
> `/home/ubuntu/apps/env/APP_NAME.env` outside the repo.
