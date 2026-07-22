# Installation

This guide walks you through setting up RyoFramework for local development. By the end, you'll have a running application with backend API, frontend dev server, database, and AI integration all configured.

---

## Prerequisites

Before starting, ensure your system meets these requirements:

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | ^24.0.0 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) for version management |
| **npm** | ^11.0.0 | Ships with Node.js — ensure it's up to date |
| **PostgreSQL** | ^16.0 | Local install or Docker container |
| **Docker Desktop** | ^4.30 | Required for Docker Compose workflow |
| **Git** | ^2.40 | For version control |
| **Pscale CLI** | ^1.0 | Optional — only needed for PlanetScale serverless driver |

Verify your setup:

```bash
node --version   # v24.x.x
npm --version    # v11.x.x
psql --version   # psql (PostgreSQL) 16.x
docker --version # Docker version 24.x.x
```

---

## Quick Start with Docker Compose (Recommended)

The fastest way to get running is with Docker Compose, which starts the app, database, Redis, and all services:

```bash
# Clone the repository
git clone https://github.com/ryoforge/ryo-framework.git
cd ryo-framework

# Create environment file
cp .env.example .env

# Start all services
docker compose up --build
```

This starts:
- **App** (port 3000) — Node.js backend with hot-reload
- **Frontend** (port 5173) — Vite dev server with HMR
- **PostgreSQL** (port 5432) — Primary database
- **Redis** (port 6379) — Caching and session store
- **Mailpit** (port 8025) — Email testing UI

Open `http://localhost:5173` in your browser. The app should load and redirect to `/docs/introduction`.

---

## Manual Setup

### 1. Clone and Install

```bash
git clone https://github.com/ryoforge/ryo-framework.git
cd ryo-framework
```

### 2. Environment Variables

Copy the example environment file and configure it for your local setup:

```bash
cp .env.example .env
```

Here is the full `.env` configuration:

```env
# ── App ──────────────────────────────────────────
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# ── Database ─────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ryo_framework_dev

# ── Redis ────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Auth ─────────────────────────────────────────
JWT_SECRET=your-jwt-secret-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── OAuth (optional — skip if not using social login) ──
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=

# ── AI (GROQ) ────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192

# ── Billing ──────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=

# ── Notifications ────────────────────────────────
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ryoframework.dev

# ── Storage ──────────────────────────────────────
STORAGE_DRIVER=local     # Options: local, s3, r2
STORAGE_PATH=./uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET=

# ── Search ───────────────────────────────────────
SEARCH_DRIVER=postgres   # Options: postgres, meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=

# ── Logging ──────────────────────────────────────
LOG_LEVEL=debug
LOG_FORMAT=pretty       # Options: pretty, json
```

> **Security Note:** Never commit the `.env` file. The `.env.example` file is committed with placeholder values. In production, use a secrets manager or encrypted CI/CD variables.

### 3. Start PostgreSQL and Redis

If you have PostgreSQL and Redis running locally:

```bash
# macOS — using Homebrew services
brew services start postgresql@16
brew services start redis

# Verify they are running
pg_isready
redis-cli ping   # Should return PONG
```

Or use Docker for just the data services:

```bash
docker run -d --name ryo-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ryo_framework_dev -p 5432:5432 postgres:16
docker run -d --name ryo-redis -p 6379:6379 redis:7-alpine
```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client from schema
npx prisma generate

# Push schema to the database (creates tables)
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

What each command does:

| Command | Purpose |
|---|---|
| `npm install` | Installs all Node.js dependencies |
| `prisma generate` | Generates the Prisma client based on `schema.prisma` |
| `prisma db push` | Syncs the schema to the database without creating migration files |
| `prisma db seed` | Runs `prisma/seed.ts` to create an admin user, roles, and sample data |

> **Migration workflow in production:** Use `prisma migrate dev` instead of `prisma db push`. Migrations create versioned SQL files that can be reviewed and committed.

### 5. Frontend Setup

Open a new terminal and:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend dev server starts at `http://localhost:5173` with HMR enabled.

### 6. Verify the Installation

Run the health check to confirm everything is connected:

```bash
# From the backend directory
curl http://localhost:3000/api/v1/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-07-22T12:00:00.000Z",
#   "services": {
#     "database": "connected",
#     "redis": "connected",
#     "ai": "configured"
#   }
# }
```

### 7. Create Your First User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!",
    "name": "Admin User"
  }'

# Response includes JWT tokens and user object
```

Or log in with the seeded super admin:
- **Email:** `admin@ryoframework.dev`
- **Password:** `admin123` (change immediately in production)

---

## Docker Compose Setup (Detailed)

For a complete local environment with all services, use `docker-compose.yml`:

```yaml
# docker-compose.yml (in project root)
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ryo_framework_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI

  app:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.dev
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - db
      - redis
      - mailpit
    volumes:
      - .:/app
      - /app/node_modules

  frontend:
    build:
      context: frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000/api/v1
    depends_on:
      - app
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  pgdata:
  redisdata:
```

Start it:

```bash
docker compose up --build
```

Run migrations and seed inside the container:

```bash
# Run Prisma commands inside the app container
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

---

## Production Setup Notes

### Environment

```bash
NODE_ENV=production
# Use a real PostgreSQL instance (RDS, Cloud SQL, Supabase)
DATABASE_URL=postgresql://user:password@host:5432/ryo_framework_prod?sslmode=require
# Use a production Redis (Upstash, ElastiCache, Redis Cloud)
REDIS_URL=rediss://user:password@host:6379
```

### Build

```bash
# Backend
cd backend
npm ci --only=production

# Frontend
cd frontend
npm ci
npm run build
# Output in frontend/dist/ — serve via nginx or CDN
```

### Deployment Checklist

- [ ] Generate strong JWT secrets (`openssl rand -base64 48`)
- [ ] Set `NODE_ENV=production`
- [ ] Run `prisma migrate deploy` (not `db push`)
- [ ] Configure a proper PostgreSQL connection with SSL
- [ ] Set up Redis for sessions and caching
- [ ] Configure Stripe webhooks with proper signing secrets
- [ ] Set up SMTP for email delivery (SendGrid, Resend, Postmark)
- [ ] Configure file storage (S3 or R2 instead of local)
- [ ] Enable rate limiting in production
- [ ] Set up logging aggregation (Datadog, New Relic, Axiom)
- [ ] Configure CORS to restrict to your domain only
- [ ] Run database backups

---

## Troubleshooting

### Common Issues

#### `prisma db push` fails with connection error

```
Error: P1001: Can't reach database server
```

**Solutions:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` — ensure username, password, host, and port are correct
- If using Docker, ensure the container is running and port 5432 is not in use
- Try `telnet localhost 5432` to test connectivity

#### `npm install` fails with Python/node-gyp errors

**Solution:** Some native modules need build tools.

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential python3
```

#### Vite dev server shows blank page or API connection refused

**Solutions:**
- Confirm the backend is running on port 3000: `curl http://localhost:3000/api/v1/health`
- Check `VITE_API_URL` in `frontend/.env` — it should point to `http://localhost:3000/api/v1`
- Ensure CORS is configured in `backend/src/config/cors.ts` to allow `http://localhost:5173`

#### GROQ API returns 401 Unauthorized

**Solutions:**
- Verify `GROQ_API_KEY` is set in `.env`
- Ensure the key is valid at [console.groq.com](https://console.groq.com)
- Check you have credits available on your GROQ account

#### Port already in use

```bash
# Find what is using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port by changing PORT in .env
```

#### Prisma client type errors after schema changes

```bash
# Regenerate the Prisma client
npx prisma generate

# If types still don't update, restart your editor/IDE
# For VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Docker: "no space left on device"

```bash
docker system prune -a --volumes
```

#### Docker: permission denied connecting to Docker socket

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER
# Log out and back in, then retry
```

---

## Next Steps

- **[Project Structure](/docs/project-structure)** — Learn how the codebase is organized
- **[Development Phases](/docs/phases)** — Follow the phased build guide
- **Backend API Reference** — Explore all available endpoints
- **Frontend Components** — Browse the component library
- **AI Integration Guide** — Build your first AI agent
