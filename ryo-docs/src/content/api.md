# API Reference

RyoFramework provides a comprehensive RESTful API organized by resource prefix. All endpoints return JSON responses and require authentication unless otherwise noted.

## Base URL

```
http://localhost:4000/api     (development)
https://your-domain.com/api   (production)
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types

| Token | Lifetime | Purpose |
|---|---|---|
| Access Token | 15 minutes (default) | API authentication |
| Refresh Token | 7 days (default) | Obtain new access tokens |

### Obtaining Tokens

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": { ... }
  }
}
```

### Refreshing Tokens

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict — duplicate resource |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal server error |

## Rate Limiting

- **Window**: 15 minutes
- **Max requests**: 100 per window per IP
- **Headers**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- Response on limit: HTTP 429 with `{ "success": false, "message": "Too many requests, please try again later." }`

## Endpoints

### Health Check

```
GET /api/health
```

Response 200:
```json
{
  "success": true,
  "message": "RyoFramework API is running",
  "timestamp": "2026-07-22T12:00:00.000Z"
}
```

---

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | No | Login with email and password |
| `POST` | `/auth/signup` | No | Register a new account |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `POST` | `/auth/logout` | Yes | Revoke refresh token |
| `POST` | `/auth/forgot-password` | No | Send password reset email |
| `POST` | `/auth/reset-password` | No | Reset password with token |
| `GET` | `/auth/me` | Yes | Get current user profile |

#### POST `/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response 201:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "MEMBER",
      "status": "PENDING"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

#### POST `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "MEMBER",
      "status": "ACTIVE"
    }
  }
}
```

#### POST `/auth/logout`

Request body: `{ "refreshToken": "eyJhbG..." }`

#### POST `/auth/forgot-password`

```json
{ "email": "user@example.com" }
```

#### POST `/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ss1"
}
```

#### GET `/auth/me`

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MEMBER",
    "status": "ACTIVE",
    "avatar": null,
    "emailVerifiedAt": "2026-07-22T10:00:00.000Z",
    "createdAt": "2026-07-22T10:00:00.000Z"
  }
}
```

---

### OAuth (`/api/auth/oauth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/oauth/providers` | No | List enabled OAuth providers |
| `GET` | `/auth/oauth/:provider` | No | Initiate OAuth flow |
| `GET` | `/auth/oauth/:provider/callback` | No | OAuth callback handler |

Supported providers: `google`, `facebook`, `apple`, `microsoft`, `twitter`

```
GET /api/auth/oauth/providers

Response 200:
{
  "success": true,
  "data": [
    { "key": "google", "name": "Google", "icon": "G", "color": "#4285F4" },
    { "key": "github", "name": "GitHub", "icon": "GH", "color": "#333" }
  ]
}
```

---

### Users (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/users/me` | Yes | Any | Get own profile |
| `PATCH` | `/users/me` | Yes | Any | Update own profile |
| `POST` | `/users/me/password` | Yes | Any | Change own password |
| `GET` | `/users` | Yes | ADMIN+ | List all users |
| `GET` | `/users/:id` | Yes | ADMIN+ | Get user by ID |
| `PATCH` | `/users/:id` | Yes | ADMIN+ | Update any user |
| `DELETE` | `/users/:id` | Yes | SUPER_ADMIN | Delete user |

#### PATCH `/users/me`

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### POST `/users/me/password`

```json
{
  "currentPassword": "OldP@ss1",
  "newPassword": "NewP@ss1"
}
```

---

### Organizations (`/api/organizations`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/organizations` | Yes | Any | Create organization |
| `GET` | `/organizations` | Yes | Any | List user's organizations |
| `GET` | `/organizations/:id` | Yes | Member | Get organization details |
| `PATCH` | `/organizations/:id` | Yes | ADMIN+ | Update organization |
| `DELETE` | `/organizations/:id` | Yes | SUPER_ADMIN | Delete organization |
| `POST` | `/organizations/:id/invite` | Yes | ADMIN+ | Invite member |
| `DELETE` | `/organizations/:id/members/:memberId` | Yes | ADMIN+ | Remove member |
| `POST` | `/organizations/accept-invitation` | Yes | Any | Accept invitation |

#### POST `/organizations`

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "website": "https://acme.com"
}
```

#### POST `/organizations/:id/invite`

```json
{
  "email": "collaborator@example.com",
  "role": "MEMBER"
}
```

#### POST `/organizations/accept-invitation`

```json
{ "token": "invitation-token" }
```

---

### Teams (`/api/teams`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/teams` | Yes | Create team within organization |
| `GET` | `/teams` | Yes | List teams |
| `GET` | `/teams/:id` | Yes | Get team details |
| `PATCH` | `/teams/:id` | Yes | Update team |
| `DELETE` | `/teams/:id` | Yes | Delete team |
| `POST` | `/teams/:id/members` | Yes | Add member |
| `DELETE` | `/teams/:id/members/:memberId` | Yes | Remove member |

---

### Files (`/api/files`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/files/upload` | Yes | Upload a file |
| `GET` | `/files` | Yes | List user's files |
| `GET` | `/files/:id` | Yes | Get file metadata |
| `GET` | `/files/:id/download` | Yes | Download file |
| `DELETE` | `/files/:id` | Yes | Delete file |

#### POST `/files/upload`

- Content-Type: `multipart/form-data`
- Field name: `file`
- Max size: 10MB
- Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `text/csv`

Response 201:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "size": 245760,
    "url": "https://bucket.s3.amazonaws.com/uuid.pdf",
    "createdAt": "2026-07-22T12:00:00.000Z"
  }
}
```

---

### AI (`/api/ai`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/chat` | Yes | Send prompt to AI |
| `POST` | `/ai/stream` | Yes | Stream AI response (SSE) |

#### POST `/ai/chat`

```json
{
  "prompt": "Write a Prisma schema for a blog",
  "context": { "framework": "RyoFramework" },
  "type": "database"
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "response": "```prisma\nmodel Post {\n  id        String   @id @default(uuid())\n  title     String\n  content   String\n  ...\n}\n```",
    "usage": {
      "prompt_tokens": 120,
      "completion_tokens": 340,
      "total_tokens": 460
    }
  }
}
```

#### POST `/ai/stream`

Same request body as `/ai/chat`. Response is an SSE stream:

```
data: {"content": "Here"}
data: {"content": " is"}
data: {"content": " your"}
data: {"content": " schema"}
data: [DONE]
```

---

### Conversations (`/api/conversations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/conversations` | Yes | Create conversation |
| `GET` | `/conversations` | Yes | List conversations |
| `GET` | `/conversations/:id` | Yes | Get conversation with messages |
| `POST` | `/conversations/:id/messages` | Yes | Add message |
| `DELETE` | `/conversations/:id` | Yes | Delete conversation |

---

### Billing (`/api/billing`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/billing/plans` | No | — | List available plans |
| `GET` | `/billing/subscription` | Yes | Any | Get current subscription |
| `POST` | `/billing/subscription` | Yes | Any | Create/change subscription |
| `DELETE` | `/billing/subscription` | Yes | Any | Cancel subscription |
| `GET` | `/billing/invoices` | Yes | Any | List invoices |
| `GET` | `/billing/invoices/:id` | Yes | Any | Get invoice details |
| `GET` | `/billing/payment-methods` | Yes | Any | List payment methods |
| `POST` | `/billing/payment-methods` | Yes | Any | Add payment method |
| `DELETE` | `/billing/payment-methods/:id` | Yes | Any | Remove payment method |

---

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Yes | List user's notifications |
| `PATCH` | `/notifications/:id/read` | Yes | Mark notification as read |
| `POST` | `/notifications/read-all` | Yes | Mark all as read |
| `DELETE` | `/notifications/:id` | Yes | Delete notification |

---

### Notification Preferences (`/api/notification-preferences`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notification-preferences` | Yes | Get preferences |
| `PUT` | `/notification-preferences` | Yes | Update preferences |

---

### Activities (`/api/activities`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/activities` | Yes | List recent user activities |
| `GET` | `/activities/feed` | Yes | Get activity feed |

---

### Audit Logs (`/api/audit-logs`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/audit-logs` | Yes | ADMIN+ | List audit logs |
| `GET` | `/audit-logs/:id` | Yes | ADMIN+ | Get log details |

---

### MFA (`/api/mfa`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/mfa/setup` | Yes | Enable MFA |
| `POST` | `/mfa/verify` | Yes | Verify MFA setup |
| `POST` | `/mfa/disable` | Yes | Disable MFA |

---

### Email Verification (`/api/email-verification`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/email-verification/send` | Yes | Send verification email |
| `POST` | `/email-verification/verify` | Yes | Verify email with code |

---

### Settings (`/api/settings`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/settings` | Yes | ADMIN+ | List application settings |
| `PATCH` | `/settings/:key` | Yes | ADMIN+ | Update setting |

---

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Yes | Get dashboard statistics |
| `GET` | `/dashboard/recent-activity` | Yes | Get recent activity |

---

### Search (`/api/search`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search?q=query` | Yes | Global search across resources |

---

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/admin/stats` | Yes | ADMIN+ | System statistics |
| `GET` | `/admin/users` | Yes | ADMIN+ | Manage users |
| `GET` | `/admin/audit-logs` | Yes | ADMIN+ | System audit trail |

---

## Webhook Events (Future)

Planned webhook system for event-driven integrations:

| Event | Description |
|---|---|
| `user.created` | New user registered |
| `user.updated` | User profile updated |
| `user.deleted` | User account deleted |
| `organization.created` | Organization created |
| `organization.member.added` | Member invited/joined |
| `organization.member.removed` | Member removed |
| `billing.subscription.changed` | Subscription plan changed |
| `billing.invoice.paid` | Invoice paid |
| `billing.invoice.overdue` | Invoice overdue |
| `file.uploaded` | File uploaded |
| `ai.response.completed` | AI response generated |

Webhook delivery will use:
- **Payload**: Signed JSON body with HMAC-SHA256
- **Retry**: Up to 5 attempts with exponential backoff
- **Security**: Configurable secret per endpoint
