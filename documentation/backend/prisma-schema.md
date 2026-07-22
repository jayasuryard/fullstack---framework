# Prisma Schema

The database schema is defined in `prisma/schema.prisma` with **30 models** covering users, authentication, organizations, teams, billing, AI conversations, files, notifications, and system administration.

---

## Enums

### UserRole

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}
```

Used on `User.role`, `OrganizationMember.role`, `TeamMember.role`, and `Invitation.role`.

### UserStatus

```prisma
enum UserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  BANNED
}
```

---

## Core User Model

### User

The central model representing every user in the system.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key (UUIDv4) |
| `email` | `String @unique` | Login email (unique, used for auth) |
| `password` | `String` | bcrypt hash (12 rounds). Empty string for OAuth-only users. |
| `firstName` | `String` | User's first name |
| `lastName` | `String` | User's last name |
| `role` | `UserRole @default(MEMBER)` | Global system role |
| `status` | `UserStatus @default(PENDING)` | Account status |
| `avatar` | `String?` | Avatar image URL |
| `phone` | `String?` | Phone number |
| `emailVerifiedAt` | `DateTime?` | Null until email is verified |
| `twoFactorSecret` | `String?` | TOTP secret for authenticator apps |
| `twoFactorEnabled` | `Boolean @default(false)` | MFA enabled flag |
| `googleId` | `String? @unique` | Google OAuth subject ID |
| `facebookId` | `String? @unique` | Facebook OAuth subject ID |
| `appleId` | `String? @unique` | Apple OAuth subject ID |
| `microsoftId` | `String? @unique` | Microsoft OAuth subject ID |
| `twitterId` | `String? @unique` | X/Twitter OAuth subject ID |
| `lastLoginAt` | `DateTime?` | Timestamp of last successful login |
| `createdAt` | `DateTime @default(now())` | Record creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Record last update timestamp |
| `deletedAt` | `DateTime?` | Soft delete timestamp |

**Relations:**
- `sessions Session[]`
- `refreshTokens RefreshToken[]`
- `auditLogs AuditLog[]`
- `notifications Notification[]`
- `activities Activity[]`
- `loginAttempts LoginAttempt[]`
- `conversations Conversation[]`
- `messages Message[]`
- `subscriptions Subscription[]`
- `invoices Invoice[]`
- `paymentMethods PaymentMethod[]`
- `usageRecords UsageRecord[]`
- `notificationPrefs NotificationPreference[]`
- `files File[]`
- `apiKeys ApiKey[]`
- `organizationMembers OrganizationMember[]`

**Indexes:** `email`, `status`, `role`, `deletedAt`

---

## Authentication Models

### Session

Tracks user sessions (currently logged-in devices).

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `token` | `String @unique` | Session token |
| `ipAddress` | `String?` | IP at session creation |
| `userAgent` | `String?` | User-agent string |
| `expiresAt` | `DateTime` | Session expiry |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

**Relations:** `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`

### RefreshToken

Implements refresh token rotation (old token revoked on each refresh).

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `token` | `String @unique` | JWT refresh token |
| `expiresAt` | `DateTime` | Token expiry (7 days) |
| `revoked` | `Boolean @default(false)` | Whether token has been revoked |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

**Indexes:** `userId`, `token`

### EmailVerificationToken

One-time use token for email verification.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `token` | `String @unique` | Verification token (crypto random) |
| `expiresAt` | `DateTime` | Expiry (24 hours) |
| `usedAt` | `DateTime?` | Null until consumed |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### OtpCode

One-time passwords for MFA and login verification.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `code` | `String` | 6-digit OTP code |
| `purpose` | `String` | Context: `EMAIL_VERIFICATION`, `PASSWORD_RESET`, `MFA`, `LOGIN` |
| `expiresAt` | `DateTime` | Expiry (10 minutes) |
| `usedAt` | `DateTime?` | Null until consumed |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### LoginAttempt

Records every login attempt for security auditing.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `ipAddress` | `String?` | Source IP |
| `userAgent` | `String?` | Client user-agent |
| `success` | `Boolean` | Whether login succeeded |
| `reason` | `String?` | Failure reason (e.g., "Invalid password") |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

---

## Authorization Models

### Role

Custom roles for granular permission assignment.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `name` | `String @unique` | Role name |
| `description` | `String?` | Human-readable description |
| `isSystem` | `Boolean @default(false)` | System-protected role |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

**Relations:** `permissions RolePermission[]`

### Permission

Individual action-resource pairs for granular access control.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `action` | `String` | Action name: `create`, `read`, `update`, `delete`, `manage` |
| `resource` | `String` | Resource name: `user`, `organization`, `billing`, `settings`, etc. |
| `description` | `String?` | Human-readable description |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

**Unique constraint:** `@@unique([action, resource])`
**Relations:** `roles RolePermission[]`

### RolePermission

Many-to-many join table linking roles to permissions.

| Field | Type | Description |
|---|---|---|
| `roleId` | `String` | Foreign key to Role |
| `permissionId` | `String` | Foreign key to Permission |

**Composite primary key:** `@@id([roleId, permissionId])`

---

## Organization & Team Models

### Organization

Top-level organizational unit for multi-tenant support.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `name` | `String` | Organization name |
| `slug` | `String @unique` | URL-friendly identifier |
| `logo` | `String?` | Organization logo URL |
| `website` | `String?` | Organization website |
| `settings` | `Json?` | Flexible JSON settings store |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |
| `deletedAt` | `DateTime?` | Soft delete timestamp |

**Relations:** `members OrganizationMember[]`, `invitations Invitation[]`

### OrganizationMember

Maps users to organizations with a role within that organization.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `organizationId` | `String` | Foreign key to Organization |
| `userId` | `String` | Foreign key to User |
| `role` | `UserRole @default(MEMBER)` | Role within the organization |
| `joinedAt` | `DateTime @default(now())` | When the user joined |

**Unique constraint:** `@@unique([organizationId, userId])`

### Team

Sub-group within an organization.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `name` | `String` | Team name |
| `slug` | `String @unique` | Unique URL slug |
| `description` | `String?` | Team description |
| `organizationId` | `String` | Foreign key to Organization |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

**Relations:** `organization Organization`, `members TeamMember[]`

### TeamMember

Maps users to teams with a role within that team.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `teamId` | `String` | Foreign key to Team |
| `userId` | `String` | Foreign key to User |
| `role` | `UserRole @default(MEMBER)` | Role within the team |
| `joinedAt` | `DateTime @default(now())` | When the user joined |

**Unique constraint:** `@@unique([teamId, userId])`

### Invitation

Pending invitations for users to join organizations or teams.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `email` | `String` | Invited user's email |
| `organizationId` | `String?` | Target organization |
| `teamId` | `String?` | Target team |
| `role` | `UserRole @default(MEMBER)` | Role to assign |
| `token` | `String @unique` | Unique invitation token |
| `expiresAt` | `DateTime` | Expiry (7 days) |
| `acceptedAt` | `DateTime?` | Null until accepted |
| `createdBy` | `String` | User ID who sent the invitation |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

**Note:** If `teamId` is set, the invitation is for a specific team within an org.

---

## AI & Conversation Models

### Conversation

A chat conversation between a user and the AI.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `title` | `String @default("New conversation")` | Auto-titled from first message |
| `model` | `String?` | AI model used for this conversation |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last message timestamp |

**Relations:** `user User`, `messages Message[]`

### Message

Individual messages within a conversation.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `conversationId` | `String` | Foreign key to Conversation |
| `role` | `String` | Message role: `user`, `assistant`, `system` |
| `content` | `String` | Message body |
| `tokens` | `Int?` | Token count for AI usage tracking |
| `metadata` | `Json?` | Additional metadata |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

---

## File Storage Model

### File

Metadata for uploaded files (actual content stored in S3-compatible storage).

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User (owner) |
| `originalName` | `String` | Original filename from upload |
| `mimeType` | `String` | MIME type (e.g., `image/jpeg`) |
| `size` | `Int` | File size in bytes |
| `key` | `String @unique` | S3 object key (`{userId}/{uuid}{ext}`) |
| `url` | `String` | Public URL to the file |
| `thumbnailUrl` | `String?` | URL to 200x200 thumbnail (images only) |
| `variants` | `Json?` | Image metadata: `{ width, height, format }` |
| `bucket` | `String` | S3 bucket name |
| `region` | `String?` | S3 region |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `deletedAt` | `DateTime?` | Soft delete timestamp |

**Allowed upload MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `text/csv`
**Max file size:** 10 MB

---

## Notification Models

### Notification

In-app and push notifications delivered to users.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `type` | `String` | Notification type (e.g., `mention`, `invite`, `payment`) |
| `title` | `String` | Notification title |
| `message` | `String` | Notification body |
| `data` | `Json?` | Additional payload data |
| `read` | `Boolean @default(false)` | Whether user has read it |
| `channel` | `String @default("in_app")` | Delivery channel: `in_app`, `email`, `push` |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### NotificationPreference

Per-user, per-type notification channel preferences.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `type` | `String` | Notification type |
| `email` | `Boolean @default(true)` | Email channel enabled |
| `inApp` | `Boolean @default(true)` | In-app channel enabled |
| `push` | `Boolean @default(true)` | Push channel enabled |

**Unique constraint:** `@@unique([userId, type])`

### NotificationTemplate

Pre-defined templates for notification content (supports variable interpolation).

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `name` | `String @unique` | Template name |
| `subject` | `String?` | Email subject line |
| `body` | `String` | Template body (HTML/text) |
| `channels` | `Json?` | Compatible channel array |
| `variables` | `Json?` | Expected variable schema |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

---

## Activity & Audit Models

### Activity

User-facing activity feed entries.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `type` | `String` | Activity type: `LOGIN`, `LOGOUT`, `FILE_UPLOAD`, `SETTING_CHANGE`, `OAUTH_LOGIN`, `OAUTH_SIGNUP`, `PASSWORD_RESET` |
| `description` | `String` | Human-readable description |
| `metadata` | `Json?` | Additional context data |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### AuditLog

Admin-facing immutable audit trail for compliance.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String?` | Foreign key to User (nullable for system actions) |
| `action` | `String` | Action performed (e.g., `USER_CREATE`, `ORG_UPDATE`) |
| `entity` | `String` | Entity type (e.g., `user`, `organization`) |
| `entityId` | `String?` | ID of affected entity |
| `metadata` | `Json?` | Full request/response context |
| `ipAddress` | `String?` | Source IP |
| `userAgent` | `String?` | Client user-agent |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

Automatically created by the `logAudit()` middleware on any mutation endpoint.

---

## Billing Models

### Plan

Subscription plan definitions.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `name` | `String` | Plan name (e.g., "Pro") |
| `slug` | `String @unique` | URL-safe identifier |
| `description` | `String?` | Plan description |
| `price` | `Decimal @default(0)` | Price amount (10,2 precision) |
| `currency` | `String @default("USD")` | Currency code |
| `interval` | `String @default("month")` | Billing interval: `month`, `year` |
| `features` | `Json?` | Feature flags/descriptions |
| `limits` | `Json?` | Usage limits (seats, storage, API calls) |
| `active` | `Boolean @default(true)` | Whether plan is available |
| `sortOrder` | `Int @default(0)` | Display order |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

### Subscription

Active user subscriptions linked to plans.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `planId` | `String` | Foreign key to Plan |
| `status` | `String @default("active")` | Status: `active`, `cancelled`, `past_due`, `trialing`, `expired` |
| `startsAt` | `DateTime @default(now())` | Subscription start |
| `endsAt` | `DateTime?` | Subscription end (30/365 days from start) |
| `trialEndsAt` | `DateTime?` | Trial period end |
| `canceledAt` | `DateTime?` | Cancellation timestamp |
| `stripeSubscriptionId` | `String? @unique` | Stripe integration reference |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

**Constraints:** One active/trialing subscription per user.

### Invoice

Billing invoices generated for subscriptions.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `subscriptionId` | `String?` | Foreign key to Subscription |
| `number` | `String @unique` | Invoice number (auto: `INV-000001`) |
| `amount` | `Decimal` | Total amount (10,2 precision) |
| `currency` | `String @default("USD")` | Currency code |
| `status` | `String @default("pending")` | Status: `pending`, `paid`, `overdue`, `cancelled`, `refunded` |
| `paidAt` | `DateTime?` | Payment timestamp |
| `dueAt` | `DateTime?` | Due date |
| `lines` | `Json?` | Line items |
| `stripeInvoiceId` | `String? @unique` | Stripe integration reference |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

### Payment

Individual payments against invoices.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `invoiceId` | `String` | Foreign key to Invoice |
| `amount` | `Decimal` | Payment amount |
| `currency` | `String @default("USD")` | Currency code |
| `method` | `String?` | Method: `card`, `transfer`, `crypto` |
| `status` | `String @default("pending")` | Status: `pending`, `completed`, `failed`, `refunded` |
| `stripePaymentIntentId` | `String? @unique` | Stripe reference |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### PaymentMethod

Saved payment methods for users.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `type` | `String` | Type: `card`, `bank`, `crypto` |
| `lastFour` | `String?` | Last 4 digits |
| `brand` | `String?` | Card brand (Visa, MC, etc.) |
| `expMonth` | `Int?` | Expiration month |
| `expYear` | `Int?` | Expiration year |
| `stripeMethodId` | `String? @unique` | Stripe reference |
| `isDefault` | `Boolean @default(false)` | Default payment method |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### Coupon

Discount codes for billing.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `code` | `String @unique` | Coupon code |
| `description` | `String?` | Description |
| `discountType` | `String` | Type: `percentage`, `fixed` |
| `discountValue` | `Decimal` | Discount amount |
| `maxUses` | `Int?` | Maximum redemptions |
| `usedCount` | `Int @default(0)` | Current usage count |
| `minAmount` | `Decimal?` | Minimum order amount |
| `startsAt` | `DateTime?` | Validity start |
| `expiresAt` | `DateTime?` | Validity end |
| `active` | `Boolean @default(true)` | Whether coupon is active |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

### UsageRecord

Tracks feature usage for metered billing.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `feature` | `String` | Feature name: `api_calls`, `storage`, `seats`, etc. |
| `quantity` | `Int @default(1)` | Usage quantity |
| `recordedAt` | `DateTime @default(now())` | When usage occurred |

---

## System Models

### Setting

Key-value configuration store (system-level settings).

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `key` | `String @unique` | Setting key |
| `value` | `Json` | Setting value (JSON-encoded) |
| `group` | `String @default("general")` | Grouping category |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

### ApiKey

API keys for programmatic access.

| Field | Type | Description |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Foreign key to User |
| `name` | `String` | Key name/identifier |
| `key` | `String @unique` | The API key value |
| `lastUsedAt` | `DateTime?` | Last usage timestamp |
| `expiresAt` | `DateTime?` | Optional expiry |
| `active` | `Boolean @default(true)` | Whether key is active |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |

---

## Relationship Diagram

```
User ──1:N──> Session
User ──1:N──> RefreshToken
User ──1:N──> EmailVerificationToken
User ──1:N──> OtpCode
User ──1:N──> LoginAttempt
User ──1:N──> Activity
User ──1:N──> AuditLog
User ──1:N──> Notification
User ──1:N──> NotificationPreference
User ──1:N──> Conversation ──1:N──> Message
User ──1:N──> File
User ──1:N──> Subscription ──N:1── Plan
User ──1:N──> Invoice ──1:N──> Payment
User ──1:N──> PaymentMethod
User ──1:N──> UsageRecord
User ──1:N──> ApiKey
User ──N:M──> Organization (via OrganizationMember)
Organization ──1:N──> Team
Organization ──1:N──> Invitation
Team ──1:N──> TeamMember
Team ──N:M──> User (via TeamMember)
Role ──N:M──> Permission (via RolePermission)
```

---

## Soft Delete Pattern

Models that support soft deletion use a `deletedAt: DateTime?` field:

- **User** — `deletedAt` on `User` + status set to `SUSPENDED`
- **Organization** — `deletedAt` on `Organization`
- **File** — `deletedAt` on `File`

Queries should filter by `deletedAt: null` to exclude soft-deleted records:

```js
const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null },
});

const activeFiles = await prisma.file.findMany({
  where: { userId, deletedAt: null },
});
```

## Audit Fields

Every model includes standard audit timestamps:

| Field | Type | Description |
|---|---|---|
| `createdAt` | `DateTime @default(now())` | Set automatically on creation |
| `updatedAt` | `DateTime @updatedAt` | Updated automatically on every write |
| `deletedAt` | `DateTime?` | Set manually for soft deletes |
