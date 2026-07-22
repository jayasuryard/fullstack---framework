# Deployment Documentation

## Docker Deployment

### Prerequisites
- Docker Engine 24+
- Docker Compose v2+

### Quick Start
```bash
# Clone and setup
git clone <repo>
cd ryo-framework

# Start all services
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate dev

# Seed database
docker compose exec backend node prisma/seed.js
```

### Services
- Frontend: http://localhost:80
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

## Production Deployment

### Environment Variables
Required variables for production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `REFRESH_TOKEN_SECRET` - Strong random secret
- `CORS_ORIGIN` - Frontend domain
- `GROQ_API_KEY` - AI API key (optional)

### Kubernetes
Kubernetes manifests are available in `infrastructure/k8s/`.

### CI/CD
GitHub Actions workflow in `.github/workflows/deploy.yml`
- Lint → Test → Build → Deploy

### Health Checks
- Backend: `GET /api/health`
- Database: Prisma connection test on startup

### Monitoring
- Application logs via stdout (JSON format)
- Request logging via Morgan
- Database query logging in development

### Backup
- PostgreSQL: `pg_dump` recommended
- Files: S3 bucket replication
