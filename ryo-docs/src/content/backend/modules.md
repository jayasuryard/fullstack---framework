# Backend Modules

The RyoFramework backend is organized into 15 feature modules, each following a consistent pattern: **Routes → Controllers → Services → Prisma**.

---

## Module Architecture Pattern

Every module follows this structure:

```
routes/{module}.js        -- HTTP route definitions + middleware
controllers/{module}.js   -- Request handlers (thin, delegates to service)
services/{module}.js      -- Business logic + database access
```

Dependencies flow in one direction only: `Routes → Controllers → Services`. Services never import controllers, and controllers never import routes.

---

## Module: Auth

**Files:** `routes/auth.js`, `controllers/authController.js`, `services/authService.js`

### Purpose

Handles user authentication: login, registration, token management, password reset, and session management.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Authenticate and get tokens |
| `POST` | `/api/auth/refresh` | No | Rotate refresh token |
| `POST` | `/api/auth/logout` | Yes | Revoke refresh token |
| `POST` | `/api/auth/forgot-password` | No | Send password reset email |
| `POST` | `/api/auth/reset-password` | No | Reset password with token |
| `GET` | `/api/auth/me` | Yes | Get authenticated user |

### Services

**`authService.login(email, password, ipAddress, userAgent)`**
- Validates credentials against bcrypt hash
- Records login attempt (success/failure)
- Creates refresh token in database
- Updates `lastLoginAt` and sets status to `ACTIVE`
- Creates `LOGIN` activity entry
- Returns `{ user, accessToken, refreshToken }`

**`authService.signup(data)`**
- Checks for existing email (throws 409)
- Creates user with bcrypt-hashed password
- Generates initial tokens
- Returns `{ user, accessToken, refreshToken }`

**`authService.refreshToken(token)`**
- Verifies JWT signature of refresh token
- Checks token exists, not revoked, not expired
- Revokes old token (rotation)
- Issues new access + refresh tokens
- Creates new `RefreshToken` record

**`authService.logout(userId, refreshToken)`**
- Revokes the specified refresh token
- Creates `LOGOUT` activity entry

**`authService.forgotPassword(email)`**
- Always returns same response (prevents enumeration)
- If user exists: generates reset token, sends email
- Revokes all existing refresh tokens

**`authService.resetPassword(token, password)`**
- Verifies reset token via JWT
- Updates password hash
- Revokes all refresh tokens
- Creates `PASSWORD_RESET` activity

### Usage Pattern

```js
// In a controller
const result = await authService.login(email, password, req.ip, req.headers['user-agent']);
sendSuccess(res, result, 'Login successful');
```

---

## Module: OAuth

**Files:** `routes/oauth.js`, `controllers/oauthController.js`, `services/oauthService.js`, `config/passport.js`

### Purpose

Social login via external identity providers. Supports Google, Facebook, Apple, Microsoft, and X/Twitter.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/oauth/providers` | No | List configured providers |
| `GET` | `/api/auth/oauth/:provider` | No | Redirect to provider |
| `GET` | `/api/auth/oauth/:provider/callback` | No | Handle OAuth callback |

### Services

**`oauthService.findOrCreateUser(provider, profile)`**
- Normalizes provider-specific profile data to a standard format
- Looks up existing user by email or provider ID
- If exists: links provider ID, updates `lastLoginAt`, generates tokens
- If new: creates user with role `MEMBER`, status `ACTIVE`, email pre-verified
- Returns `{ user, accessToken, refreshToken }`

### Provider Configuration

Each provider is configured with OAuth credentials in `config/index.js` and a Passport strategy in `config/passport.js`. Providers are auto-disabled when their credentials are missing from the environment.

### Usage Pattern

```js
// Frontend redirects user to:
window.location.href = '/api/auth/oauth/google';

// After authentication, the callback redirects to:
// FRONTEND_URL/oauth/callback?token=accessToken&refreshToken=refreshToken
```

---

## Module: MFA

**Files:** `routes/mfa.js`, `controllers/mfaController.js`, `services/mfaService.js`

### Purpose

Multi-factor authentication with TOTP (authenticator apps) and OTP (email-based).

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/mfa/generate` | Yes | Generate TOTP secret |
| `POST` | `/api/mfa/enable` | Yes | Enable MFA |
| `POST` | `/api/mfa/disable` | Yes | Disable MFA |
| `POST` | `/api/mfa/send-otp` | No | Send email OTP |
| `POST` | `/api/mfa/verify-otp` | Yes | Verify OTP code |

### Services

**`mfaService.generateMfaSecret(userId)`**
- Generates a random secret
- Stores in `user.twoFactorSecret`
- Returns secret and `otpauth://` URL for QR code

**`mfaService.verifyAndEnableMfa(userId, code)`**
- Verifies the 6-digit code against the stored secret
- Sets `twoFactorEnabled = true`

**`mfaService.disableMfa(userId, code)`**
- Verifies code, then clears `twoFactorSecret` and sets `twoFactorEnabled = false`

**`mfaService.sendOtp(userId, purpose)`**
- Generates 6-digit OTP, stores in `OtpCode` with 10-minute expiry
- Sends via email for `LOGIN` and `MFA` purposes

**`mfaService.verifyOtp(userId, code, purpose)`**
- Finds matching non-expired, non-used OTP
- Marks it as used
- Returns `true` on success

---

## Module: Email Verification

**Files:** `routes/emailVerification.js`, `controllers/emailVerificationController.js`, `services/emailVerificationService.js`

### Purpose

Verifies user email addresses via one-time tokens.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/email-verification/send` | Yes | Send verification email |
| `POST` | `/api/email-verification/verify` | No | Verify email with token |

### Usage Pattern

```js
// User requests verification email
await emailVerificationService.sendVerificationEmail(user.id);

// User clicks link with token
await emailVerificationService.verifyEmail(token);
// Sets emailVerifiedAt, marks token as used
```

---

## Module: Users

**Files:** `routes/users.js`, `controllers/userController.js`, `services/userService.js`, `validators/users.js`

### Purpose

User profile management and administration.

### Key Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/users/me` | Yes | Any | Get profile |
| `PATCH` | `/api/users/me` | Yes | Any | Update profile |
| `POST` | `/api/users/me/password` | Yes | Any | Change password |
| `GET` | `/api/users` | Yes | ADMIN+ | List users |
| `GET` | `/api/users/:id` | Yes | ADMIN+ | Get user |
| `PATCH` | `/api/users/:id` | Yes | ADMIN+ | Update user |
| `DELETE` | `/api/users/:id` | Yes | SUPER_ADMIN | Delete user (soft) |

### Services

**`userService.getProfile(userId)`** — Returns user without sensitive fields (password, twoFactorSecret)

**`userService.updateProfile(userId, data)`** — Updates firstName, lastName, phone

**`userService.updatePassword(userId, currentPassword, newPassword)`** — Verifies current password, then hashes and updates

**`userService.listUsers(query)`** — Paginated, filterable by `email`, `firstName`, `lastName`, `role`, `status`

**`userService.deleteUser(userId)`** — Sets `deletedAt` and status to `SUSPENDED`

---

## Module: Organizations

**Files:** `routes/organizations.js`, `controllers/organizationController.js`, `services/organizationService.js`

### Purpose

Multi-tenant organization management. Users can belong to multiple organizations.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/organizations` | Yes | Create org (creator becomes ADMIN) |
| `GET` | `/api/organizations` | Yes | List user's orgs |
| `POST` | `/api/organizations/accept-invitation` | Yes | Accept org invite |
| `GET` | `/api/organizations/:id` | Yes | Get org with members |
| `PATCH` | `/api/organizations/:id` | Yes | Update org |
| `DELETE` | `/api/organizations/:id` | Yes | Soft-delete org |
| `POST` | `/api/organizations/:id/invite` | Yes | Invite member |
| `DELETE` | `/api/organizations/:id/members/:memberId` | Yes | Remove member |

### Services

**`organizationService.createOrganization(data, userId)`**
- Auto-generates slug from name if not provided
- Checks slug uniqueness
- Creates organization + `OrganizationMember` with role `ADMIN`

**`organizationService.inviteMember(orgId, email, role, invitedBy)`**
- Checks no pending invitation exists
- Creates `Invitation` with crypto token, 7-day expiry
- Returns the invitation record

**`organizationService.acceptInvitation(token, userId)`**
- Finds and validates invitation (not expired, not accepted)
- Creates `OrganizationMember` in a transaction
- Marks invitation as accepted

### Usage Pattern

```js
// Create an org
const org = await organizationService.createOrganization(
  { name: 'Acme Corp', slug: 'acme-corp' },
  req.user.id
);

// Invite a member
const invite = await organizationService.inviteMember(
  org.id, 'colleague@example.com', 'MEMBER', req.user.id
);
// Send invite.inviteToken to the email
```

---

## Module: Teams

**Files:** `routes/teams.js`, `controllers/teamController.js`, `services/teamService.js`

### Purpose

Sub-groups within organizations for finer-grained team management.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/teams` | Yes | Create team |
| `GET` | `/api/teams` | Yes | List user's teams |
| `GET` | `/api/teams/:id` | Yes | Get team with members |
| `PATCH` | `/api/teams/:id` | Yes | Update team |
| `DELETE` | `/api/teams/:id` | Yes | Delete team |
| `POST` | `/api/teams/:id/members` | Yes | Add member |
| `DELETE` | `/api/teams/:id/members/:memberId` | Yes | Remove member |

### Services

**`teamService.createTeam(data, userId)`** — Creates team + adds creator as ADMIN member

**`teamService.listTeams(userId)`** — Returns teams the user belongs to

**`teamService.addTeamMember(teamId, userId, role)`** — Checks for duplicate membership before adding

---

## Module: Billing

**Files:** `routes/billing.js`, `controllers/billingController.js`, `services/billingService.js`

### Purpose

Subscription management, plan listing, invoicing, and usage tracking.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/billing/plans` | No | List active plans |
| `POST` | `/api/billing/subscribe` | Yes | Subscribe to plan |
| `GET` | `/api/billing/subscription` | Yes | Get current sub |
| `POST` | `/api/billing/subscription/:id/cancel` | Yes | Cancel sub |
| `GET` | `/api/billing/invoices` | Yes | List invoices |
| `GET` | `/api/billing/usage` | Yes | Get feature usage |

### Services

**`billingService.listPlans()`** — Returns active plans sorted by `sortOrder`

**`billingService.createSubscription(userId, planId)`**
- Validates plan exists and is active
- Checks no active subscription exists (enforces one-subscription rule)
- Sets `endsAt` based on plan interval (30 or 365 days)

**`billingService.cancelSubscription(subscriptionId, userId)`**
- Ownership check
- Sets status to `cancelled` and `canceledAt`

**`billingService.getUsage(userId, feature)`** — Sums usage records for the current month

**`billingService.createInvoice(data)`** — Auto-generates invoice number (`INV-000001` style)

### Usage Pattern

```js
// Record API call usage
await billingService.recordUsage(user.id, 'api_calls', 1);

// Check if user is within plan limits
const usage = await billingService.getUsage(user.id, 'api_calls');
const plan = subscription.plan;
if (usage >= plan.limits.maxApiCalls) {
  // Block feature or warn user
}
```

---

## Module: AI

**Files:** `routes/ai.js`, `controllers/aiController.js`, `ai/aiService.js`, `ai/provider.js`, `ai/promptManager.js`

### Purpose

AI-powered chat completions via Groq API (Llama 3 70B). Supports streaming via Server-Sent Events.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Yes | Send prompt, get response |
| `POST` | `/api/ai/stream` | Yes | Stream response (SSE) |

### Architecture

```
aiService.js (high-level API) --> promptManager.js (message builder) --> provider.js (Groq API client)
```

### Services

**`aiService.generateResponse(prompt, context, type)`**
- Builds chat messages with system prompt based on `type`
- Supports types: `default`, `codeReview`, `architecture`, `database`
- Returns `{ content, usage }`

**`aiService.generateStreamingResponse(prompt, context, type)`**
- Async generator that yields content chunks
- Uses SSE format: `data: {"content": "chunk"}\n\n`

**`aiService.codeReview(code, language)`** — Specialized code review endpoint

**`aiService.generateSchema(description)`** — Generates Prisma schemas from natural language

### AI Provider

The `AIProvider` class in `provider.js`:
- Uses Groq API (`https://api.groq.com/openai/v1`)
- Falls back to mock responses when `GROQ_API_KEY` is not configured
- Supports streaming via `ReadableStream`

### Prompt Manager

System prompts are pre-defined by conversation type:

```js
const systemPrompts = {
  default: `You are RyoAI, the AI assistant for RyoFramework...`,
  codeReview: `You are a senior code reviewer...`,
  architecture: `You are a software architect...`,
  database: `You are a database architect specializing in Prisma ORM and PostgreSQL...`,
};
```

### Usage Pattern

```js
// Non-streaming chat
const result = await aiService.generateResponse('Write a function', null, 'codeReview');

// Streaming chat
for await (const chunk of aiService.generateStreamingResponse(prompt)) {
  res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
}
```

---

## Module: Conversations

**Files:** `routes/conversations.js`, `controllers/conversationController.js`, `services/conversationService.js`

### Purpose

Persistent AI chat conversations with message history.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/conversations` | Yes | Create conversation |
| `GET` | `/api/conversations` | Yes | List conversations |
| `GET` | `/api/conversations/:id` | Yes | Get with messages |
| `DELETE` | `/api/conversations/:id` | Yes | Delete |
| `POST` | `/api/conversations/:id/messages` | Yes | Send message |
| `POST` | `/api/conversations/:id/stream` | Yes | Stream response |

### Services

**`conversationService.sendMessage(conversationId, userId, content)`**
- Verifies conversation ownership
- Saves user message to DB
- Loads last 50 messages as context
- Calls AI provider for response
- Saves assistant message with token count
- Auto-titles conversation from first user message

**`conversationService.streamMessage(conversationId, userId, content)`**
- Same as `sendMessage` but streams the AI response
- Saves the complete assistant message after streaming finishes

### Usage Pattern

```js
const conversation = await conversationService.createConversation(userId);

const result = await conversationService.sendMessage(
  conversation.id, userId, 'Hello!'
);
// result.message -- assistant's reply
// result.usage -- token usage
```

---

## Module: Files

**Files:** `routes/files.js`, `controllers/fileController.js`, `services/fileService.js`, `middleware/upload.js`

### Purpose

File upload, storage (S3-compatible), thumbnail generation, and management.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/files/upload` | Yes | Upload file (multipart) |
| `GET` | `/api/files` | Yes | List files (paginated) |
| `GET` | `/api/files/:id` | Yes | Get file metadata |
| `GET` | `/api/files/:id/download` | Yes | Redirect to file URL |
| `DELETE` | `/api/files/:id` | Yes | Soft-delete file |

### Upload Middleware (`middleware/upload.js`)

- Accepts: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `text/csv`
- Max size: 10 MB
- Uses memory storage (buffer in memory)
- Generates UUID-based file keys

### Services

**`fileService.uploadFile(userId, file)`**
- Generates unique S3 key (`{userId}/{uuid}{ext}`)
- Uploads to S3 (or stores local fallback if S3 not configured)
- For images: generates 200x200 thumbnail + records image dimensions
- Creates `File` record in database
- Returns file metadata with URLs

**`fileService.getFile(fileId, userId)`** — Ownership check, filtered by `deletedAt: null`

**`fileService.listFiles(userId, query)`** — Paginated file listing (newest first)

**`fileService.deleteFile(userId, fileId)`** — Soft delete via `deletedAt` timestamp

### Usage Pattern

```js
// Upload
const file = await fileService.uploadFile(req.user.id, req.file);

// Get file URL
const file = await fileService.getFile(fileId, userId);
// file.url -> "https://s3.amazonaws.com/bucket/uuid/file.pdf"
```

---

## Module: Notifications

**Files:** `routes/notifications.js`, `controllers/notificationController.js`, `services/notificationService.js`

**Also:** `routes/notificationPrefs.js`, `controllers/notificationPrefController.js`, `services/notificationPrefService.js`

### Purpose

In-app notification delivery and user notification preference management.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Yes | List notifications |
| `GET` | `/api/notifications/unread-count` | Yes | Unread count |
| `POST` | `/api/notifications/mark-all-read` | Yes | Mark all read |
| `PATCH` | `/api/notifications/:id/read` | Yes | Mark one read |
| `DELETE` | `/api/notifications/:id` | Yes | Delete notification |
| `GET` | `/api/notification-preferences` | Yes | Get prefs |
| `PATCH` | `/api/notification-preferences` | Yes | Update prefs |

### Services

**`notificationService.createNotification(userId, type, title, message, data)`** — Used by other services to send notifications

**`notificationService.listNotifications(userId, query)`** — Paginated, newest first

**`notificationService.getUnreadCount(userId)`** — Quick count of unread notifications

**`notificationPrefService.updatePreferences(userId, preferences)`** — Bulk update of channel preferences per notification type

---

## Module: Activity

**Files:** `routes/activities.js`, `controllers/activityController.js`, `services/activityService.js`

### Purpose

User-facing activity feed showing actions the user has taken.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/activities` | Yes | List activities (paginated) |

### Services

**`activityService.createActivity(userId, type, description, metadata)`** — Called by other services to log user actions

**`activityService.listActivities(userId, query)`** — Paginated feed of user's activities

### Activity Types

| Type | Description |
|---|---|
| `LOGIN` | User logged in |
| `LOGOUT` | User logged out |
| `OAUTH_LOGIN` | User logged in via OAuth |
| `OAUTH_SIGNUP` | User registered via OAuth |
| `PASSWORD_RESET` | Password changed |
| `FILE_UPLOAD` | File uploaded |
| `SETTING_CHANGE` | System setting changed |

---

## Module: Audit

**Files:** `routes/auditLogs.js`, `controllers/auditLogController.js`, `services/auditLogService.js`, `middleware/auditLog.js`

### Purpose

Immutable admin audit trail for compliance and security monitoring.

### Key Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/audit-logs` | Yes | ADMIN+ | List audit logs (paginated, filterable) |

### Middleware: `logAudit(action, entity)`

The `logAudit` middleware at `middleware/auditLog.js` automatically captures audit events on mutation endpoints:

```js
import { logAudit } from '../middleware/auditLog.js';

router.post('/', authenticate, logAudit('USER_CREATE', 'user'), userController.createUser);
```

It intercepts `res.json()` to capture the response body and logs:
- `userId`, `action`, `entity`, `entityId`
- `metadata` (HTTP method, path, request body)
- `ipAddress`, `userAgent`

### Services

**`auditLogService.listAuditLogs(query)`** — Paginated, filterable by `action`, `entity`, `entityId`, includes user info

---

## Module: Admin

**Files:** `routes/admin.js`, `controllers/adminController.js`, `services/adminService.js`

### Purpose

Platform-level administration endpoints for monitoring and analytics.

### Key Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/admin/stats` | Yes | ADMIN+ | Platform statistics |
| `GET` | `/api/admin/user-analytics` | Yes | SUPER_ADMIN | User breakdown |

### Services

**`adminService.getDashboardStats()`** — Returns:
- `totalUsers` — All users count
- `activeUsers` — Users with status ACTIVE
- `totalFiles` — Non-deleted files
- `recentLogs` — Audit logs in the last 24 hours

**`adminService.getUserAnalytics()`** — Returns:
- `total` — Total user count
- `byRole` — Users grouped by role (SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER)
- `byStatus` — Users grouped by status (PENDING, ACTIVE, SUSPENDED, BANNED)

---

## Module: Dashboard

**Files:** `routes/dashboard.js`, `controllers/dashboardController.js`, `services/dashboardService.js`

### Purpose

User-specific dashboard aggregating recent data from multiple sources.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Yes | Get user dashboard |

### Services

**`dashboardService.getUserDashboard(userId)`** — Returns in parallel:
- Last 10 activities
- Unread notification count
- Last 5 files

---

## Module: Settings

**Files:** `routes/settings.js`, `controllers/settingController.js`, `services/settingService.js`

### Purpose

Key-value system settings store with group categorization.

### Key Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/settings` | Yes | ADMIN+ | List settings (optional `?group=` filter) |
| `GET` | `/api/settings/:key` | Yes | ADMIN+ | Get setting by key |
| `PUT` | `/api/settings/:key` | Yes | SUPER_ADMIN | Create or update setting |

### Services

**`settingService.getSettings(group)`** — Returns settings as a flat key-value object: `{ "key": value }`

**`settingService.getSetting(key)`** — Returns a single setting's value or `null`

**`settingService.updateSetting(key, value, group)`** — Uses `prisma.setting.upsert()` to create or update

**`settingService.updateSettings(settings)`** — Bulk update multiple settings in a loop

### Usage Pattern

```js
// Get all email settings
const emailSettings = await settingService.getSettings('email');
// { "smtp_host": "...", "smtp_port": 587 }

// Set a value
await settingService.updateSetting('app.name', 'RyoFramework Pro', 'general');
```

---

## Module: Search

**Files:** `routes/search.js`, `controllers/searchController.js`, `services/searchService.js`

### Purpose

Global search across users and files.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search?q=term` | Yes | Global search |

### Services

**`searchService.globalSearch(query, userId)`**
- Requires minimum 2-character query
- Searches users by `email`, `firstName`, `lastName` (case-insensitive contains)
- Searches user's files by `originalName` (case-insensitive contains, excludes soft-deleted)
- Returns grouped results: `{ results: [{ type: 'users', data: [...] }, { type: 'files', data: [...] }] }`
