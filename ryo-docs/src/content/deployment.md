# Deployment

RyoFramework is designed for flexible deployment using Docker containers, supporting various cloud platforms and deployment strategies.

## Docker Setup

### Dockerfile.backend

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "src/server.js"]
```

### Dockerfile.frontend

```dockerfile
FROM node:24-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY infrastructure/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ryo_framework
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: infrastructure/Dockerfile.backend
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ryo_framework
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      CORS_ORIGIN: http://localhost
      GROQ_API_KEY: ${GROQ_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: infrastructure/Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    name: Run Tests
    uses: ./.github/workflows/test.yml

  build-and-push:
    name: Build and Push Docker Images
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/Dockerfile.backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/ryo-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/ryo-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/Dockerfile.frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/ryo-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/ryo-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Production
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Railway
        run: |
          curl -fsSL https://railway.app/install.sh | sh
          railway up --service ryo-backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Environment Configuration

### Production Environment Variables

```env
# Core
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@production-host:5432/ryo_framework?sslmode=require

# JWT (use strong random secrets)
JWT_SECRET=generated-64-char-hex-string
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=generated-64-char-hex-string
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sg.your-sendgrid-api-key
SMTP_FROM=noreply@your-domain.com

# S3
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=your-production-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key

# AI
GROQ_API_KEY=gsk_your-groq-api-key
GROQ_MODEL=llama3-70b-8192

# OAuth
OAUTH_CALLBACK_URL=https://your-api-domain.com/api/auth/oauth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Environment Management

| Method | Tool | Use Case |
|---|---|---|
| `.env` file | dotenv | Local development |
| GitHub Secrets | GitHub Actions | CI/CD pipeline |
| Railway/Platform UI | Platform dashboard | Cloud deployment |
| Vercel Environment Variables | Vercel dashboard | Frontend deployment |
| Docker Compose env_file | Docker | Container deployment |

## Database Migrations in Production

### Migration Strategy

```bash
# 1. Backup database
pg_dump -h production-host -U user -d ryo_framework > pre-migration-backup.sql

# 2. Apply migrations
npx prisma migrate deploy

# 3. Verify schema
npx prisma validate

# 4. Run seed data (if needed)
NODE_ENV=production node prisma/seed.js
```

### CI/CD Migration Step

```yaml
- name: Run Database Migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  working-directory: backend
```

### Migration Best Practices

- **Always backup** before migrations in production
- **Test migrations** on staging first
- **Use maintenance mode** for schema changes that lock tables
- **Monitor performance** after each migration
- **Have a rollback plan** (restore from backup)
- **Run during low traffic** periods

## Nginx Configuration

```nginx
# infrastructure/nginx.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for streaming
        proxy_read_timeout 86400s;
    }
}
```

## SSL/HTTPS

### Docker with Let's Encrypt

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx.prod.conf:/etc/nginx/conf.d/default.conf
      - ./infrastructure/ssl:/etc/nginx/ssl
      - certbot_data:/var/www/certbot
    depends_on:
      - backend
      - frontend

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_data:/var/www/certbot
      - ./infrastructure/ssl:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/var/www/certbot --email admin@your-domain.com --agree-tos --no-eff-email -d your-domain.com -d api.your-domain.com
```

### Nginx with SSL

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api/ {
        proxy_pass http://backend:4000;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Structured Logging

```javascript
// src/utils/logger.js
const logger = {
  info(message, meta) {
    console.info(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      meta,
    }));
  },
  error(message, meta) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      meta,
    }));
  },
};
```

### Log Aggregation

| Tool | Purpose |
|---|---|
| Logtail / BetterStack | Log management and alerting |
| Grafana Loki | Log aggregation with Prometheus |
| Datadog | APM, logs, and infrastructure monitoring |
| Sentry | Error tracking and performance monitoring |

### Health Check Endpoint

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RyoFramework API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

## Vercel Deployment (Frontend)

### vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or link and deploy
vercel link
vercel --prod
```

## Railway/Render/Cloud Deployment (Backend)

### Railway

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login and deploy
railway login
railway init
railway up
```

### Render

1. **Web Service** → Select repo
2. **Build Command**: `cd backend && npm ci && npx prisma generate`
3. **Start Command**: `cd backend && node src/server.js`
4. **Add PostgreSQL** from Render Dashboard
5. **Set environment variables** in Render Dashboard

### Platform Considerations

| Feature | Railway | Render | Fly.io |
|---|---|---|---|
| Managed PostgreSQL | ✓ | ✓ | ✓ |
| Auto-deploy from Git | ✓ | ✓ | ✓ |
| Custom domains | ✓ | ✓ | ✓ |
| Container support | ✓ | ✓ | ✓ |
| Free tier | Limited | Limited | Limited |

## Scaling Considerations

### Horizontal Scaling

- **Stateless API**: Backend containers can be scaled horizontally
- **Session management**: JWT tokens eliminate server-side session storage
- **Database connections**: Use PgBouncer for connection pooling
- **File storage**: S3-compatible storage for user uploads
- **Caching**: Add Redis for session cache and API response caching

### Database Scaling

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M

  pgbouncer:
    image: edoburu/pgbouncer:latest
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ryo_framework
      MAX_CLIENT_CONN: 100
      DEFAULT_POOL_SIZE: 25
```

### CDN (Future)

- Serve static assets via CDN (Vercel Edge Network, Cloudflare)
- Cache API responses at edge locations
- Image optimization via CDN transforms

### Performance Monitoring

| Metric | Tool |
|---|---|
| API response times | New Relic, Datadog APM |
| Database query performance | Prisma logging, pg_stat_statements |
| Error rates | Sentry, custom dashboard |
| Resource usage | Docker stats, cloud provider metrics |
| User experience | Lighthouse, Web Vitals |
