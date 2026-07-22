# Project Memory

## Current Sprint
Building RyoFramework core backend modules and infrastructure.

## Current Features
- Authentication (JWT + Refresh Tokens)
- User Management (CRUD, Roles)
- Notifications (In-App, Email)
- File Management (S3 Compatible)
- Activity & Audit Logging
- Settings Management
- Admin Dashboard
- Dashboard Widgets
- Global Search
- AI Integration (GROQ)

## Current APIs
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/notifications` - Notifications
- `/api/activities` - User activities
- `/api/audit-logs` - Audit logs
- `/api/files` - File uploads
- `/api/settings` - Application settings
- `/api/admin` - Admin operations
- `/api/dashboard` - Dashboard data
- `/api/search` - Global search
- `/api/ai` - AI chat and streaming

## Current Database
- Users, Sessions, RefreshTokens, LoginAttempts
- AuditLogs, Notifications, Activities
- Organizations, OrganizationMembers, Invitations
- Settings, ApiKeys, Files

## Architecture Decisions
- JavaScript backend (not TypeScript) for simplicity
- Layered architecture: Routes → Controllers → Services
- Zod for validation, Prisma for database
- Module-based organization
- Centralized error handling via ApiError class
- Environment-based configuration

## Pending Tasks
- Billing module
- Frontend implementation
- Comprehensive testing
- Production hardening

## Known Issues
- None currently
