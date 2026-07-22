# Security

RyoFramework implements a defense-in-depth security strategy across authentication, authorization, data validation, and network layers.

## Authentication Security

### JWT Implementation

Access and refresh tokens use the `jsonwebtoken` library with separate secrets and expiration times:

```javascript
// src/utils/tokens.js
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }  // default: 15m
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }  // default: 7d
  );
}
```

| Token | Secret Env Var | Default Expiry | Storage |
|---|---|---|---|
| Access Token | `JWT_SECRET` | 15 minutes | Memory / HTTP-only cookie |
| Refresh Token | `REFRESH_TOKEN_SECRET` | 7 days | Persisted in DB, revoked on use |

### Refresh Token Rotation

Each refresh token can be used only once. When a new access token is requested:

1. The old refresh token is revoked in the database
2. A new refresh token is issued
3. If a revoked token is reused, all tokens for that user are invalidated (token theft detection)

```javascript
export async function refreshToken(req, res, next) {
  const { refreshToken } = req.body;

  // Verify JWT signature
  const decoded = verifyRefreshToken(refreshToken);

  // Check token exists and not revoked
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revoked) {
    // Token reuse detected — revoke all tokens for user
    if (storedToken?.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revoked: false },
        data: { revoked: true },
      });
    }
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Issue new tokens
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
}
```

### Brute Force Protection

Login attempts are tracked to prevent brute force attacks:

```javascript
// Rate limiting login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 attempts per window
  message: { success: false, message: 'Too many login attempts' },
});

// Account lockout after failed attempts
async function checkBruteForce(email) {
  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      user: { email },
      success: false,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  });

  if (recentAttempts >= 10) {
    throw ApiError.tooMany('Account temporarily locked. Try again in 15 minutes.');
  }
}
```

## Authorization Enforcement

### Role-Based Access Control (RBAC)

The system uses a dual-layer authorization approach:

#### 1. Route-Level Authorization

```javascript
// Middleware chain: authenticate → authorize
router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.listUsers);
router.delete('/users/:id', authenticate, authorize('SUPER_ADMIN'), userController.deleteUser);
```

#### 2. Permission-Based Authorization

Granular permissions enforced through the `can()` middleware:

```javascript
// src/middleware/permission.js
export function can(action, resource) {
  return async (req, res, next) => {
    const permission = await prisma.permission.findUnique({
      where: { action_resource: { action, resource } },
      include: {
        roles: { where: { role: { name: req.user.role } } },
      },
    });

    if (!permission || permission.roles.length === 0) {
      // Fallback to static role hierarchy
      const staticPermissions = {
        SUPER_ADMIN: '*',
        ADMIN: ['read', 'manage'],
        MANAGER: ['read', 'create', 'update'],
        MEMBER: ['read'],
        VIEWER: ['read'],
      };
      // ...
    }
    next();
  };
}
```

#### Role Hierarchy

| Role | Permissions |
|---|---|
| SUPER_ADMIN | Unrestricted access to all resources |
| ADMIN | Read/manage all resources |
| MANAGER | Read, create, update resources |
| MEMBER | Read resources |
| VIEWER | Read-only access |

### Authentication Middleware

```javascript
// src/middleware/auth.js
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('User not found or inactive');
  }

  req.user = user;
  next();
}
```

## Input Validation and Sanitization

All inputs are validated using Zod schemas before reaching controllers:

```javascript
// src/middleware/validate.js
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.badRequest('Validation failed', details));
      }
      next(error);
    }
  };
}
```

### Example Validation Schema

```javascript
// src/validators/auth.js
import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
  }),
});
```

## CORS Configuration

```javascript
app.use(cors({
  origin: config.cors.origin,     // Configurable via CORS_ORIGIN env var
  credentials: true,               // Allow cookies/auth headers
}));
```

Default configuration allows only the frontend origin (e.g., `http://localhost:5173` in development). In production, this must be set to the actual frontend domain.

## Helmet.js Headers

Helmet.js sets security-related HTTP headers:

```javascript
app.use(helmet());
```

| Header | Effect |
|---|---|
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking |
| `X-XSS-Protection: 0` | Disables legacy XSS filter (modern browsers) |
| `Strict-Transport-Security` | Enforces HTTPS |
| `Content-Security-Policy` | Controls resource loading |
| `Referrer-Policy` | Controls referrer header |

Customize for your needs:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## Rate Limiting

Global rate limiter applied to all `/api/` routes:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                     // 100 requests per window
  standardHeaders: true,        // Return RateLimit headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

app.use('/api/', limiter);
```

### Per-Endpoint Limits

```javascript
// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

app.use('/api/auth/login', authLimiter);
```

## SQL Injection Prevention

RyoFramework uses Prisma ORM which inherently prevents SQL injection by using parameterized queries. Never use raw queries with string interpolation:

```javascript
// Safe — Prisma parameterized query
const user = await prisma.user.findUnique({ where: { email } });

// Dangerous — raw string interpolation
const user = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);

// Safe — raw query with parameters
const user = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;
```

## XSS Protection

1. **Helmet.js**: Sets `X-XSS-Protection` and `Content-Security-Policy` headers
2. **React's built-in escaping**: React automatically escapes output
3. **Input sanitization**: Zod validation strips unexpected characters
4. **Content-Type enforcement**: API expects and returns JSON only

## CSRF Considerations

Since the API uses stateless JWT authentication (via `Authorization` header) rather than cookies, CSRF attacks are inherently mitigated. If switching to cookie-based auth:

- Implement CSRF tokens
- Use `SameSite=Strict` cookie attribute
- Validate `Origin` and `Referer` headers

## File Upload Security

```javascript
// src/middleware/upload.js
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/csv',
];
const MAX_SIZE = 10 * 1024 * 1024;  // 10MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`), false);
  }
};

export const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: MAX_SIZE } });
```

Security measures:
- **File type whitelist**: Only specific MIME types allowed
- **Size limit**: 10MB maximum file size
- **Memory storage**: Files stored in memory before secure S3 upload
- **UUID filenames**: Prevents directory traversal and filename collisions
- **No execution**: Files stored on S3, not on application server
- **Virus scanning**: Recommended via S3 event triggers (future)

## Environment Variable Management

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ryo_framework

# JWT
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# SMTP (Email)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ryoforge.com

# S3 (File Storage)
S3_ENDPOINT=
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# AI
GROQ_API_KEY=
GROQ_MODEL=llama3-70b-8192
```

### Best Practices

- **Never commit secrets**: `.env` is in `.gitignore`; use `.env.example` for documentation
- **Secret rotation**: Rotate `JWT_SECRET` and `REFRESH_TOKEN_SECRET` periodically
- **Environment separation**: Use different secrets for dev/staging/production
- **Secret management**: Use vault services (AWS Secrets Manager, HashiCorp Vault) in production
- **Least privilege**: Database user should only have access to the application database

## OWASP Top 10 Compliance

| # | OWASP Category | RyoFramework Mitigation |
|---|---|---|
| A01 | Broken Access Control | RBAC with route-level and permission-level authorization |
| A02 | Cryptographic Failures | JWT with strong secrets, bcrypt password hashing, HTTPS enforcement |
| A03 | Injection | Prisma ORM parameterized queries, Zod input validation |
| A04 | Insecure Design | Layered architecture, validation middleware, audit logging |
| A05 | Security Misconfiguration | Helmet.js, CORS configuration, environment-based settings |
| A06 | Vulnerable Components | Regular dependency updates via npm audit |
| A07 | Auth Failures | JWT with short expiration, refresh rotation, brute force protection |
| A08 | Data Integrity Failures | Input validation, audit logs, soft deletes |
| A09 | Logging Failures | Structured JSON logging, audit trail for sensitive operations |
| A10 | SSRF | No direct URL fetching from user input |

## Additional Security Measures

### Password Hashing

```javascript
import bcrypt from 'bcryptjs';

// Hashing (cost factor 12)
const hashedPassword = bcrypt.hashSync(password, 12);

// Verification
const isValid = bcrypt.compareSync(password, hashedPassword);
```

### Audit Logging

All sensitive operations are logged with the `auditLog` middleware:

```javascript
// src/middleware/auditLog.js
export function auditLog(action, entity) {
  return async (req, res, next) => {
    // Log the action after response
    res.on('finish', async () => {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action,
          entity,
          entityId: req.params.id,
          metadata: { ...req.body },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
    });
    next();
  };
}
```

### Session Management

- Short-lived access tokens (15 minutes)
- Refresh token rotation with theft detection
- Session records tracked for audit
- Logout revokes refresh tokens server-side
