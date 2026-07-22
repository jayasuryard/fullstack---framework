# Troubleshooting

Common issues encountered while working with RyoFramework and their solutions.

## Backend Startup Issues

### API fails to start — port in use

```
Error: listen EADDRINUSE :::4000
```

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=4001
```

### Prisma client not found

```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd backend
npm install
npx prisma generate
```

### Module import errors

```
SyntaxError: Cannot use import statement outside a module
```

**Solution:** Ensure `"type": "module"` is in `backend/package.json`. This is already configured in RyoFramework.

### Invalid environment variable

```
Error: Missing required environment variable: DATABASE_URL
```

**Solution:** Copy the example environment file and configure variables:
```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

## Database Connection Issues

### Cannot connect to PostgreSQL

```
Error: Can't reach database server
Error: connect ECONNREFUSED ::1:5432
```

**Solutions:**
1. Ensure PostgreSQL is running:
```bash
docker compose up -d postgres
docker compose ps  # Verify postgres is healthy
```

2. Check `DATABASE_URL` format:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ryo_framework
```

3. Test connection directly:
```bash
psql -h localhost -U postgres -d ryo_framework
```

4. On macOS, if using local PostgreSQL instead of Docker:
```bash
brew services start postgresql@16
createdb ryo_framework
```

### Migration fails

```
Error: P1001: Can't reach database server
Error: P1003: Database does not exist
```

**Solutions:**
```bash
# Create the database
createdb ryo_framework

# Push schema directly (bypass migrations for initial setup)
npx prisma db push

# Or reset and re-migrate
npx prisma migrate reset
```

### Connection pool exhausted

```
Error: P2024: Too many connections
```

**Solutions:**
1. Reduce connection pool size in `DATABASE_URL`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db?connection_limit=5
```

2. Check for dangling connections:
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'ryo_framework';
```

3. Restart the database to clear stale connections:
```bash
docker compose restart postgres
```

## Frontend Build Issues

### TypeScript compilation errors

```
Error: src/types/global.d.ts:10:3 - error TS2304: Cannot find name 'SomeType'
```

**Solutions:**
1. Check `tsconfig.json` includes the file:
```json
{
  "include": ["src"]
}
```

2. Install missing type definitions:
```bash
npm install -D @types/react @types/react-dom
```

3. Run TypeScript check to see all errors:
```bash
cd frontend && npx tsc --noEmit
```

### Vite build fails

```
Error: Build failed with 2 errors
[vite:css] [postcss] Cannot find module 'tailwindcss'
```

**Solutions:**
```bash
# Install dependencies
cd frontend && npm ci

# Clear Vite cache
rm -rf node_modules/.vite

# Verify PostCSS config
# Ensure postcss.config.js exists and is correct
```

### Module not found after adding new dependencies

```
Error: Module 'some-package' does not exist
```

**Solution:**
```bash
cd frontend && npm install
# Or for the specific package
npm install some-package
```

## Authentication Issues

### Login always returns 401

```
POST /api/auth/login → 401 Unauthorized
```

**Solutions:**
1. Verify the user exists in the database:
```bash
npx prisma studio
# Check User table for the email address
```

2. Reset the password through the seeder:
```bash
cd backend && node prisma/seed.js
```

3. Check that the account status is `ACTIVE` (not `PENDING` or `SUSPENDED`)

### JWT token expired

```
Error: TokenExpiredError: jwt expired
```

**Solutions:**
- Call the refresh endpoint to obtain a new access token:
```bash
POST /api/auth/refresh
Body: { "refreshToken": "your-refresh-token" }
```

- Increase token lifetime in `.env`:
```
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d
```

### Invalid token after password change

This is by design — all existing tokens are invalidated when the password changes. The user must log in again.

### Refresh token rejected

```
Error: Invalid refresh token
```

**Solutions:**
- The refresh token may have been revoked (rotation detected a reused token). Log in again to get new tokens.
- Ensure the refresh token hasn't expired (default: 7 days).

## OAuth Configuration Issues

### OAuth provider returns "redirect_uri_mismatch"

**Solutions:**
1. Check the callback URL configured in the OAuth provider dashboard matches exactly:
```
OAUTH_CALLBACK_URL=http://localhost:4000/api/auth/oauth
```

2. For Google OAuth, the callback URL in Google Cloud Console should be:
```
http://localhost:4000/api/auth/oauth/google/callback
```

3. In production, update `OAUTH_CALLBACK_URL` to your production domain.

### OAuth provider not appearing in login options

**Solutions:**
1. Check that the provider credentials are set in `.env`:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

2. The provider will only appear if all required credentials are present and non-empty.

3. Verify in `config/passport.js` that the provider's `enabled` condition matches.

### Apple OAuth private key issues

**Solutions:**
1. Ensure `APPLE_PRIVATE_KEY_PATH` points to the correct `.p8` file path
2. The key must be downloaded from Apple Developer Portal
3. Ensure the key ID and team ID are correct

## File Upload Issues

### Upload returns 400 — file type not allowed

```
Error: File type application/octet-stream is not allowed
```

**Solutions:**
- Only the following types are allowed: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `text/csv`
- Ensure the file's MIME type matches its extension
- To add more types, modify `ALLOWED_TYPES` in `src/middleware/upload.js`

### Upload exceeds size limit

```
Error: File too large
```

**Solutions:**
- Maximum file size is 10MB by default
- Increase `MAX_SIZE` in `src/middleware/upload.js`
- Also increase `express.json({ limit: '10mb' })` in `src/app.js`

### S3 upload fails

```
Error: AccessDenied
```

**Solutions:**
1. Verify S3 credentials in `.env`
2. Ensure the S3 bucket exists
3. Check S3 bucket CORS configuration
4. Verify IAM permissions include `s3:PutObject`
5. For MinIO, ensure the endpoint URL is correct

## AI Service Issues

### AI returns mock responses

```
[AI Mock] Received: "Your prompt text..."
Configure GROQ_API_KEY in your .env file to enable real AI responses.
```

**Solution:** Set a valid GROQ API key:
```
GROQ_API_KEY=gsk_your-actual-api-key
```
Get a key at [console.groq.com](https://console.groq.com).

### AI streaming not working

**Solutions:**
1. Check that the client handles SSE correctly:
```javascript
const eventSource = new EventSource('/api/ai/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.content) appendToOutput(data.content);
};
```

2. Ensure the proxy/timeout settings allow long-lived connections:
```nginx
proxy_read_timeout 86400s;
proxy_buffering off;
```

3. Some hosting platforms may terminate idle connections — increase timeout settings.

### Rate limit exceeded on GROQ API

**Solutions:**
- Upgrade to a paid GROQ plan for higher rate limits
- Implement request queuing or batching
- Cache frequent AI responses

## Performance Issues

### API responses are slow

**Solutions:**
1. Check for N+1 queries in Prisma — use `include` and `select`:
```javascript
// Instead of separate queries per relation
const users = await prisma.user.findMany({
  include: { organization: true },
});
```

2. Add missing database indexes:
```prisma
@@index([frequentlyQueriedField])
```

3. Use pagination for list endpoints:
```javascript
const items = await prisma.item.findMany({
  take: 20,
  skip: (page - 1) * 20,
});
```

4. Enable compression:
```javascript
app.use(compression());  // Already configured
```

### Database queries are slow

**Solutions:**
1. Enable query logging to identify slow queries:
```javascript
const prisma = new PrismaClient({ log: ['query'] });
```

2. Use `EXPLAIN ANALYZE` to understand query plans:
```javascript
const result = await prisma.$queryRaw`EXPLAIN ANALYZE ${query}`;
```

3. Add composite indexes for multi-column filters
4. Consider materialized views for complex aggregations

### Frontend bundle size too large

**Solutions:**
1. Check bundle analysis:
```bash
cd frontend && npx vite-bundle-analyzer
```

2. Lazy load routes:
```javascript
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

3. Tree-shake unused imports from libraries (especially Radix UI)
4. Use dynamic imports for heavy components (Recharts, GSAP)

## Docker Issues

### Container fails to start

```
Error: backend container exited with code 1
```

**Solutions:**
1. View container logs:
```bash
docker compose logs backend
```

2. Common causes:
   - Database not ready: `depends_on` with `condition: service_healthy` should handle this
   - Missing `.env` file: Ensure environment variables are set
   - Prisma client not generated: The Dockerfile runs `npx prisma generate`

### PostgreSQL data lost after docker compose down

**Solution:** Ensure you use `docker compose down` (without `-v`) to preserve volumes:
```bash
# Preserves data
docker compose down

# WARNING: Deletes all data
docker compose down -v
```

### Port conflicts

```
Error: Port 5432 is already in use
```

**Solutions:**
1. Check if another PostgreSQL is running locally:
```bash
lsof -i :5432
```

2. Change the host port mapping:
```yaml
ports:
  - "5433:5432"  # Map host 5433 to container 5432
```

## Environment Variable Issues

### Changes to .env not taking effect

**Solutions:**
- Restart the backend server after changing `.env`
- The backend uses `dotenv` which loads variables on startup
- If using Docker, rebuild the container:
```bash
docker compose up -d --build backend
```

### Missing variables in production

**Solution:** Ensure all required environment variables are set in your hosting platform:
- `DATABASE_URL`
- `JWT_SECRET` and `REFRESH_TOKEN_SECRET` (use strong random values)
- `CORS_ORIGIN` (set to your frontend domain)
- Any OAuth credentials being used
- `GROQ_API_KEY` (if using AI features)

Generate strong secrets:
```bash
openssl rand -hex 64
```
