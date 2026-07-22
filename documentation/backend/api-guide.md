# API Guide

## Base URL

```
http://localhost:4000/api
```

All API endpoints are prefixed with `/api`. The root health check is at `/api/health`.

---

## RESTful Conventions

- **Resource-oriented URLs** — `/api/users`, `/api/organizations/:id/members`
- **HTTP verbs for CRUD** — `GET` (list/read), `POST` (create), `PATCH` (update), `DELETE` (remove)
- **Plural nouns** for collection endpoints
- **Nested resources** under parent resource (e.g., `/api/organizations/:id/invite`)
- **Snake_case** for JSON field names
- **UUIDv4** for all resource IDs

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "...": "..." },
    "accessToken": "eyJ..."
  }
}
```

### Success (No Data)

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "...": "..." },
    { "...": "..." }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Pagination, Filtering & Sorting

### Pagination

Use `page` and `limit` query parameters:

```
GET /api/users?page=2&limit=20
```

| Parameter | Default | Max | Description |
|---|---|---|---|
| `page` | 1 | — | Page number (1-indexed) |
| `limit` | 10 | 100 | Items per page |

Response includes a `pagination` object with `page`, `limit`, `total`, and `totalPages`.

### Filtering

Pass field values as query parameters for exact or partial match:

```
GET /api/users?role=ADMIN&status=ACTIVE
GET /api/audit-logs?action=USER_CREATE&entity=user
```

String fields use case-insensitive `contains` matching. Other types use exact match.

### Sorting

Results are sorted by `createdAt` in descending order by default (newest first). Sorting is controlled server-side per endpoint.

---

## Authentication Headers

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Error Codes

| Status | Code | Description |
|---|---|---|
| 400 | `BAD_REQUEST` | Validation failed or malformed request |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired token |
| 403 | `FORBIDDEN` | Insufficient role/permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., email already taken) |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded (100 req/15min) |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Server health check |

```bash
curl http://localhost:4000/api/health
```

```json
{
  "success": true,
  "message": "RyoFramework API is running",
  "timestamp": "2026-07-22T10:30:00.000Z"
}
```

---

### Auth

**Base:** `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Create account |
| `POST` | `/login` | No | Log in |
| `POST` | `/refresh` | No | Refresh access token |
| `POST` | `/logout` | Yes | Log out |
| `POST` | `/forgot-password` | No | Request password reset |
| `POST` | `/reset-password` | No | Reset password with token |
| `GET` | `/me` | Yes | Get current user profile |

**POST /api/auth/login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"securePassword123"}'
```

**POST /api/auth/signup**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"securePassword123","confirmPassword":"securePassword123"}'
```

**POST /api/auth/refresh**
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJ..."}'
```

**POST /api/auth/logout**
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJ..."}'
```

**POST /api/auth/forgot-password**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com"}'
```

**POST /api/auth/reset-password**
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"reset-token","password":"newPass123","confirmPassword":"newPass123"}'
```

**GET /api/auth/me**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJ..."
```

---

### OAuth

**Base:** `/api/auth/oauth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/providers` | No | List enabled providers |
| `GET` | `/:provider` | No | Initiate OAuth flow |
| `GET` | `/:provider/callback` | No | OAuth callback handler |

**GET /api/auth/oauth/providers**
```bash
curl http://localhost:4000/api/auth/oauth/providers
```

**GET /api/auth/oauth/google** (redirects to Google)

---

### MFA

**Base:** `/api/mfa`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate` | Yes | Generate MFA secret |
| `POST` | `/enable` | Yes | Enable MFA with code |
| `POST` | `/disable` | Yes | Disable MFA with code |
| `POST` | `/send-otp` | No | Send OTP code via email |
| `POST` | `/verify-otp` | Yes | Verify OTP code |

**POST /api/mfa/generate**
```bash
curl -X POST http://localhost:4000/api/mfa/generate \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "message": "MFA secret generated",
  "data": {
    "secret": "ABCDEF1234567890",
    "qrCode": "otpauth://totp/RyoFramework:jane@example.com?secret=ABCDEF1234567890&issuer=RyoFramework"
  }
}
```

**POST /api/mfa/enable**
```bash
curl -X POST http://localhost:4000/api/mfa/enable \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

---

### Email Verification

**Base:** `/api/email-verification`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/send` | Yes | Send verification email |
| `POST` | `/verify` | No | Verify email with token |

**POST /api/email-verification/verify**
```bash
curl -X POST http://localhost:4000/api/email-verification/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"verification-token"}'
```

---

### Users

**Base:** `/api/users`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/me` | Yes | Any | Get own profile |
| `PATCH` | `/me` | Yes | Any | Update own profile |
| `POST` | `/me/password` | Yes | Any | Change own password |
| `GET` | `/` | Yes | ADMIN, SUPER_ADMIN | List all users |
| `GET` | `/:id` | Yes | ADMIN, SUPER_ADMIN | Get user by ID |
| `PATCH` | `/:id` | Yes | ADMIN, SUPER_ADMIN | Update any user |
| `DELETE` | `/:id` | Yes | SUPER_ADMIN | Delete user |

**PATCH /api/users/me**
```bash
curl -X PATCH http://localhost:4000/api/users/me \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith"}'
```

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": { "id": "...", "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com", "role": "MEMBER" }
  }
}
```

**POST /api/users/me/password**
```bash
curl -X POST http://localhost:4000/api/users/me/password \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"oldPass","newPassword":"newPass123","confirmPassword":"newPass123"}'
```

**GET /api/users**
```bash
curl "http://localhost:4000/api/users?role=ADMIN&page=1&limit=20" \
  -H "Authorization: Bearer eyJ..."
```

**DELETE /api/users/:id**
```bash
curl -X DELETE http://localhost:4000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJ..."
```

---

### Organizations

**Base:** `/api/organizations`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/` | Yes | Any | Create organization |
| `GET` | `/` | Yes | Any | List user's organizations |
| `POST` | `/accept-invitation` | Yes | Any | Accept invite by token |
| `GET` | `/:id` | Yes | Any | Get organization details |
| `PATCH` | `/:id` | Yes | ADMIN, SUPER_ADMIN | Update organization |
| `DELETE` | `/:id` | Yes | SUPER_ADMIN | Delete organization |
| `POST` | `/:id/invite` | Yes | ADMIN, SUPER_ADMIN | Invite member |
| `DELETE` | `/:id/members/:memberId` | Yes | ADMIN, SUPER_ADMIN | Remove member |

**POST /api/organizations**
```bash
curl -X POST http://localhost:4000/api/organizations \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","slug":"acme-corp","website":"https://acme.com"}'
```

```json
{
  "success": true,
  "message": "Organization created",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "website": "https://acme.com",
      "settings": {},
      "createdAt": "2026-07-22T10:30:00.000Z"
    }
  }
}
```

**POST /api/organizations/accept-invitation**
```bash
curl -X POST http://localhost:4000/api/organizations/accept-invitation \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"token":"invitation-token"}'
```

**POST /api/organizations/:id/invite**
```bash
curl -X POST http://localhost:4000/api/organizations/org-uuid/invite \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","role":"MEMBER"}'
```

**GET /api/organizations/:id**
```bash
curl http://localhost:4000/api/organizations/org-uuid \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "members": [
        { "id": "muuid", "role": "ADMIN", "user": { "id": "uuid", "email": "jane@example.com", "firstName": "Jane", "lastName": "Doe" } }
      ],
      "invitations": [
        { "id": "iuuid", "email": "pending@example.com", "role": "MEMBER" }
      ]
    }
  }
}
```

---

### Teams

**Base:** `/api/teams`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/` | Yes | Any | Create team |
| `GET` | `/` | Yes | Any | List user's teams |
| `GET` | `/:id` | Yes | Any | Get team details |
| `PATCH` | `/:id` | Yes | ADMIN, SUPER_ADMIN | Update team |
| `DELETE` | `/:id` | Yes | ADMIN, SUPER_ADMIN | Delete team |
| `POST` | `/:id/members` | Yes | ADMIN, SUPER_ADMIN | Add member |
| `DELETE` | `/:id/members/:memberId` | Yes | ADMIN, SUPER_ADMIN | Remove member |

**POST /api/teams**
```bash
curl -X POST http://localhost:4000/api/teams \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering","organizationId":"org-uuid"}'
```

---

### Billing

**Base:** `/api/billing`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/plans` | No | — | List active plans |
| `POST` | `/subscribe` | Yes | Any | Subscribe to a plan |
| `GET` | `/subscription` | Yes | Any | Get current subscription |
| `POST` | `/subscription/:id/cancel` | Yes | Any | Cancel subscription |
| `GET` | `/invoices` | Yes | Any | List invoices (paginated) |
| `GET` | `/usage` | Yes | Any | Get feature usage |

**GET /api/billing/plans**
```bash
curl http://localhost:4000/api/billing/plans
```

```json
{
  "success": true,
  "data": {
    "plans": [
      { "id": "plan-uuid", "name": "Starter", "slug": "starter", "price": "0.00", "interval": "month", "features": { ... }, "limits": { ... } },
      { "id": "plan-uuid", "name": "Pro", "slug": "pro", "price": "29.00", "interval": "month", "features": { ... }, "limits": { ... } }
    ]
  }
}
```

**POST /api/billing/subscribe**
```bash
curl -X POST http://localhost:4000/api/billing/subscribe \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"planId":"plan-uuid"}'
```

**GET /api/billing/usage?feature=api_calls**
```bash
curl "http://localhost:4000/api/billing/usage?feature=api_calls" \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "usage": 142
  }
}
```

---

### AI

**Base:** `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/chat` | Yes | Send prompt to AI |
| `POST` | `/stream` | Yes | Stream AI response (SSE) |

**POST /api/ai/chat**
```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write a Prisma schema for a blog","type":"database"}'
```

```json
{
  "success": true,
  "data": {
    "response": "model Post { ... }",
    "usage": { "prompt_tokens": 50, "completion_tokens": 200, "total_tokens": 250 }
  }
}
```

**POST /api/ai/stream** (Server-Sent Events)
```bash
curl -N http://localhost:4000/api/ai/stream \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain MVC pattern","type":"default"}'
```

```
data: {"content":"MVC "}
data: {"content":"stands "}
data: {"content":"for "}
data: {"content":"Model-View-Controller..."}
data: [DONE]
```

---

### Conversations

**Base:** `/api/conversations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Yes | Create conversation |
| `GET` | `/` | Yes | List conversations |
| `GET` | `/:id` | Yes | Get conversation with messages |
| `DELETE` | `/:id` | Yes | Delete conversation |
| `POST` | `/:id/messages` | Yes | Send message and get AI reply |
| `POST` | `/:id/stream` | Yes | Stream AI reply (SSE) |

**POST /api/conversations**
```bash
curl -X POST http://localhost:4000/api/conversations \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"title":"Code review session"}'
```

**POST /api/conversations/:id/messages**
```bash
curl -X POST http://localhost:4000/api/conversations/conv-uuid/messages \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"content":"Review this code: ..."}'
```

```json
{
  "success": true,
  "data": {
    "message": { "id": "msg-uuid", "role": "assistant", "content": "Your code looks good but..." },
    "usage": { "total_tokens": 300 }
  }
}
```

**GET /api/conversations/:id**
```bash
curl http://localhost:4000/api/conversations/conv-uuid \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv-uuid",
      "title": "Code review session",
      "messages": [
        { "role": "user", "content": "Review this code", "createdAt": "..." },
        { "role": "assistant", "content": "Looks good but...", "createdAt": "..." }
      ]
    }
  }
}
```

---

### Files

**Base:** `/api/files`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload` | Yes | Upload a file (multipart) |
| `GET` | `/` | Yes | List user's files (paginated) |
| `GET` | `/:id` | Yes | Get file metadata |
| `GET` | `/:id/download` | Yes | Redirect to file URL |
| `DELETE` | `/:id` | Yes | Soft-delete a file |

**POST /api/files/upload**
```bash
curl -X POST http://localhost:4000/api/files/upload \
  -H "Authorization: Bearer eyJ..." \
  -F "file=@screenshot.png"
```

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "file": {
      "id": "file-uuid",
      "originalName": "screenshot.png",
      "mimeType": "image/png",
      "size": 245760,
      "url": "https://s3.amazonaws.com/bucket/user-uuid/file-uuid.png"
    }
  }
}
```

**GET /api/files**
```bash
curl "http://localhost:4000/api/files?page=1&limit=10" \
  -H "Authorization: Bearer eyJ..."
```

---

### Notifications

**Base:** `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | List notifications (paginated) |
| `GET` | `/unread-count` | Yes | Get unread notification count |
| `POST` | `/mark-all-read` | Yes | Mark all as read |
| `PATCH` | `/:id/read` | Yes | Mark one as read |
| `DELETE` | `/:id` | Yes | Delete notification |

**GET /api/notifications**
```bash
curl http://localhost:4000/api/notifications?page=1&limit=20 \
  -H "Authorization: Bearer eyJ..."
```

**GET /api/notifications/unread-count**
```bash
curl http://localhost:4000/api/notifications/unread-count \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": { "count": 3 }
}
```

---

### Notification Preferences

**Base:** `/api/notification-preferences`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | Get user notification prefs |
| `PATCH` | `/` | Yes | Update notification prefs |

---

### Activities

**Base:** `/api/activities`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | List user's activities (paginated) |

---

### Audit Logs

**Base:** `/api/audit-logs`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | Yes | ADMIN, SUPER_ADMIN | List audit logs (paginated) |

**GET /api/audit-logs?action=USER_CREATE&page=1&limit=50**
```bash
curl "http://localhost:4000/api/audit-logs?action=USER_CREATE&page=1" \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": [
    { "id": "log-uuid", "action": "USER_CREATE", "entity": "user", "userId": "admin-uuid", "createdAt": "..." }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### Settings

**Base:** `/api/settings`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | Yes | ADMIN, SUPER_ADMIN | List settings (optional `?group=` filter) |
| `GET` | `/:key` | Yes | ADMIN, SUPER_ADMIN | Get setting by key |
| `PUT` | `/:key` | Yes | SUPER_ADMIN | Create or update setting |

**PUT /api/settings/:key**
```bash
curl -X PUT http://localhost:4000/api/settings/app.name \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"value":"RyoFramework Pro","group":"general"}'
```

**GET /api/settings?group=general**
```bash
curl "http://localhost:4000/api/settings?group=email" \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "settings": {
      "smtp_host": "smtp.example.com",
      "smtp_port": 587
    }
  }
}
```

---

### Dashboard

**Base:** `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | Get user dashboard data |

**GET /api/dashboard**
```bash
curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "dashboard": {
      "recentActivities": [ ... ],
      "unreadNotifications": 3,
      "recentFiles": [ ... ]
    }
  }
}
```

---

### Admin

**Base:** `/api/admin`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/stats` | Yes | ADMIN, SUPER_ADMIN | Platform statistics |
| `GET` | `/user-analytics` | Yes | SUPER_ADMIN | User analytics by role/status |

**GET /api/admin/stats**
```bash
curl http://localhost:4000/api/admin/stats \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "activeUsers": 987,
      "totalFiles": 3421,
      "recentLogs": 156
    }
  }
}
```

---

### Search

**Base:** `/api/search`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | Global search (requires `?q=` parameter) |

**GET /api/search?q=jane**
```bash
curl "http://localhost:4000/api/search?q=jane" \
  -H "Authorization: Bearer eyJ..."
```

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "users",
        "data": [
          { "id": "uuid", "email": "jane@example.com", "firstName": "Jane", "lastName": "Doe" }
        ]
      },
      {
        "type": "files",
        "data": [
          { "id": "uuid", "originalName": "jane-report.pdf", "url": "..." }
        ]
      }
    ]
  }
}
```

---

## Response Helpers

The response helpers at `src/utils/response.js` standardize all API responses:

```js
import { sendSuccess, sendPaginated } from '../utils/response.js';

// Simple success
sendSuccess(res, { user }, 'Profile updated');

// Success with 201 status
sendSuccess(res, { organization: org }, 'Organization created', 201);

// Paginated
sendPaginated(res, users, pagination);
```

## Validation

All request bodies are validated using Zod schemas defined in `src/validators/`. The `validate()` middleware parses and coerces input, attaching the result to `req.validated`:

```js
// If validation fails:
// 400 Bad Request with details array
{
  "success": false,
  "message": "Validation failed",
  "details": [{ "field": "email", "message": "Invalid email address" }]
}
```
