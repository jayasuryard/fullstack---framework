# Backend Overview

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24+ | JavaScript runtime |
| Express.js | 4.21 | Web framework |
| Prisma ORM | 7 (6.x client) | Database ORM & migrations |
| PostgreSQL | 15+ | Relational database |
| Passport.js | 0.7 | Authentication strategies |
| Zod | 3.23 | Schema validation |
| Nodemailer | 6.15 | Email delivery |
| Sharp | 0.33 | Image processing |
| AWS SDK S3 | 3.600 | File storage |
| JSON Web Token | 9.0 | Token-based auth |
| Morgan | 1.10 | HTTP request logging |
| Helmet | 7.1 | Security headers |
| Compression | 1.7 | Response compression |
| express-rate-limit | 7.4 | Rate limiting |
| bcryptjs | 2.4 | Password hashing |

## Architecture: Layered Pattern

The backend follows a strict **Controllers -> Services -> Prisma** layered architecture:

```
HTTP Request
    |
    v
[Middleware] -- auth, validation, rate limiting, audit logging
    |
    v
[Controllers] -- parse request, call service, format response
    |
    v
[Services] -- business logic, orchestration, Prisma queries
    |
    v
[Prisma Client] -- type-safe database access layer
    |
    v
[PostgreSQL]
```

### Layer Responsibilities

**Middleware Layer** (`src/middleware/`)
- `auth.js` -- JWT authentication (`authenticate`) and role-based authorization (`authorize`)
- `permission.js` -- Granular permission checking with `can(action, resource)`
- `validate.js` -- Zod schema validation
- `errorHandler.js` -- Centralized error handling (404, 500, operational errors)
- `auditLog.js` -- Automatic audit log creation on mutations
- `upload.js` -- Multer configuration for file uploads

**Controller Layer** (`src/controllers/`)
- Thin layer, typically 5-15 lines per handler
- Extracts validated data from `req.validated.body`
- Delegates all logic to services
- Returns standardized responses via `sendSuccess()` / `sendPaginated()`

**Service Layer** (`src/services/`)
- Contains all business logic and database operations
- Throws `ApiError` instances for expected error conditions
- Handles transactions, side effects (email, audit logs, activities)
- Returns plain data objects

**Utility Layer** (`src/utils/`)
- `ApiError.js` -- Custom error class with static factory methods
- `response.js` -- Standardized response formatters
- `tokens.js` -- JWT generation and verification
- `logger.js` -- Structured JSON logger
- `helpers.js` -- Password hashing, pagination, token/OTP generation

**Config Layer** (`src/config/`)
- `index.js` -- Environment variables and app configuration
- `database.js` -- Prisma client singleton
- `passport.js` -- OAuth strategy registration

### Folder Structure

```
backend/
  prisma/
    schema.prisma          # Database schema (all models)
    seed.js                # Seed data
    migrations/            # Prisma migration files
  src/
    ai/                    # AI provider integration
      aiService.js         # chat, stream, code review, schema generation
      provider.js          # Groq API client (streaming support)
      promptManager.js     # System prompts by context type
    config/
      index.js             # Centralized config from env vars
      database.js          # Prisma client singleton
      passport.js          # OAuth strategy registration
    controllers/           # 19 controllers (auth, users, orgs, etc.)
    middleware/
      auth.js              # authenticate, authorize
      permission.js        # can(action, resource)
      errorHandler.js      # notFoundHandler, errorHandler
      validate.js          # Zod validation middleware
      auditLog.js          # Auto audit logging
      upload.js            # File upload config
    routes/                # 19 route modules
    services/              # 19 service modules
    utils/
      ApiError.js          # Error class with static factories
      helpers.js           # hashing, pagination, tokens
      logger.js            # JSON structured logger
      response.js          # Success/paginated response helpers
      tokens.js            # JWT sign/verify
    validators/
      auth.js              # Zod schemas for auth endpoints
      users.js             # Zod schemas for user endpoints
    app.js                 # Express app setup & route registration
    server.js              # Server entry point (startup, graceful shutdown)
```

## Request Lifecycle

```
1. HTTP Request arrives
2. Helmet sets security headers
3. CORS check
4. Compression middleware
5. Morgan logs the request
6. Rate limiter (100 req/15min per IP)
7. Express JSON body parser (10mb limit)
8. Passport initialize
9. Route matched: /api/{module}
10. authenticate middleware (if applied):
    a. Extract Bearer token from Authorization header
    b. Verify JWT (check expiry, signature)
    c. Lookup user in DB, verify ACTIVE status
    d. Attach user to req.user
11. authorize middleware (if applied):
    a. Check req.user.role against allowed roles
12. can(action, resource) middleware (if applied):
    a. Query Permission + RolePermission tables
    b. Fall back to static role-permission mapping
13. validate middleware (if applied):
    a. Parse req.body/query/params against Zod schema
    b. Attach validated data to req.validated
14. Controller function executes
15. Service function executes business logic
16. Response sent via sendSuccess() / sendPaginated()
17. auditLog middleware captures mutation (if applied)
18. Morgan logs the response
```

## Error Handling

### ApiError Class

All operational errors are thrown as `ApiError` instances with a status code and message:

```js
// src/utils/ApiError.js
throw ApiError.badRequest('Validation failed', details);   // 400
throw ApiError.unauthorized('Invalid token');               // 401
throw ApiError.forbidden('Insufficient permissions');       // 403
throw ApiError.notFound('User not found');                  // 404
throw ApiError.conflict('Email already registered');         // 409
throw ApiError.tooMany('Too many requests');                // 429
throw ApiError.internal('Server error');                    // 500
```

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

### Global Error Handler

The `errorHandler` middleware at `src/middleware/errorHandler.js`:
- Catches `ApiError` instances and returns structured JSON
- Logs unhandled errors via `logger.error`
- Returns 500 for unexpected errors (never leaks stack traces)

### Not Found Handler

The `notFoundHandler` middleware returns a 404 for any unmatched route.

## Environment Configuration

All configuration is loaded from environment variables via `src/config/index.js`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | 4000 | Server port |
| `NODE_ENV` | development | Environment name |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | dev-jwt-secret | Access token signing key |
| `JWT_EXPIRES_IN` | 15m | Access token TTL |
| `REFRESH_TOKEN_SECRET` | dev-refresh-secret | Refresh token signing key |
| `REFRESH_TOKEN_EXPIRES_IN` | 7d | Refresh token TTL |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `SMTP_HOST` | — | SMTP server hostname |
| `SMTP_PORT` | 587 | SMTP port |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password |
| `SMTP_FROM` | noreply@ryoforge.com | From address for emails |
| `S3_ENDPOINT` | — | S3-compatible endpoint |
| `S3_BUCKET` | — | S3 bucket name |
| `S3_REGION` | — | S3 region |
| `S3_ACCESS_KEY` | — | S3 access key |
| `S3_SECRET_KEY` | — | S3 secret key |
| `GROQ_API_KEY` | — | Groq AI API key |
| `GROQ_MODEL` | llama3-70b-8192 | AI model name |
| `OAUTH_CALLBACK_URL` | http://localhost:4000/api/auth/oauth | OAuth callback base URL |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `FACEBOOK_APP_ID` | — | Facebook app ID |
| `FACEBOOK_APP_SECRET` | — | Facebook app secret |
| `APPLE_CLIENT_ID` | — | Apple service ID |
| `APPLE_TEAM_ID` | — | Apple team ID |
| `APPLE_KEY_ID` | — | Apple key ID |
| `APPLE_PRIVATE_KEY_PATH` | — | Apple private key path |
| `MICROSOFT_CLIENT_ID` | — | Microsoft client ID |
| `MICROSOFT_CLIENT_SECRET` | — | Microsoft client secret |
| `MICROSOFT_TENANT` | common | Microsoft tenant |
| `TWITTER_CONSUMER_KEY` | — | X/Twitter API key |
| `TWITTER_CONSUMER_SECRET` | — | X/Twitter API secret |

## Logging System

The logger at `src/utils/logger.js` outputs structured JSON to stdout:

```js
import { logger } from '../utils/logger.js';

logger.info('User created', { userId: 'abc', email: 'user@example.com' });
logger.error('Failed to send email', { error: error.message });
logger.warn('Rate limit exceeded', { ip: '::1' });
logger.debug('Query executed', { duration: 12 });
```

### Log Levels

| Level | Priority | Use Case |
|---|---|---|
| `debug` | 0 | Development-only verbose logging |
| `info` | 1 | Normal operations (user actions, system events) |
| `warn` | 2 | Suspicious or degraded behavior |
| `error` | 3 | Failures and exceptions |

Controlled via `LOG_LEVEL` env var (default: `info`).

### Log Format

```
{"timestamp":"2026-07-22T10:30:00.000Z","level":"info","message":"User created","meta":{"userId":"abc","email":"user@example.com"}}
```

HTTP request logging is handled by **Morgan** in `dev` format, configured in `src/app.js`.

## Security Middleware

| Middleware | Purpose |
|---|---|
| `helmet()` | Sets security headers (CSP, X-Frame-Options, etc.) |
| `cors({ origin, credentials: true })` | Cross-origin resource sharing |
| `express-rate-limit` | 100 requests per 15-minute window per IP |
| `express.json({ limit: '10mb' })` | Body size limit |
| `passport.initialize()` | OAuth authentication framework |

## Health Check

```
GET /api/health
```

```json
{
  "success": true,
  "message": "RyoFramework API is running",
  "timestamp": "2026-07-22T10:30:00.000Z"
}
```
