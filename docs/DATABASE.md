# Database Documentation

## Technology
- PostgreSQL 16
- Prisma ORM v6/v7

## Schema Overview

### Users & Auth
- `User` - Core user entity with roles and status
- `Session` - Active user sessions
- `RefreshToken` - JWT refresh tokens with rotation
- `LoginAttempt` - Login audit trail

### Organizations
- `Organization` - Multi-tenant support
- `OrganizationMember` - User-org membership
- `Invitation` - Org invitations

### Activity & Monitoring
- `AuditLog` - System-wide audit trail
- `Notification` - In-app notifications
- `Activity` - User activity timeline

### Configuration
- `Setting` - Key-value settings store
- `ApiKey` - API key management

### Storage
- `File` - File metadata and S3 references

## Key Design Decisions
- UUID primary keys for security and distribution
- Soft delete via `deletedAt` timestamp
- Indexed foreign keys for query performance
- JSON fields for flexible metadata
- `@unique` constraints on business identifiers
- `@updatedAt` for automatic timestamp updates

## Indexes
- All foreign keys indexed
- Email, status, role on User
- Token and expiry on refresh/auth tokens
- CreatedAt on timeline/log tables
