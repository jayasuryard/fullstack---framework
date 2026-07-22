# Changelog

All notable changes to RyoFramework are documented in this file.

## 1.0.0 (2026-07-22)

Initial release of RyoFramework — the AI-first production SaaS framework.

### Features

#### Authentication & Security
- Email/password authentication with bcrypt password hashing (cost factor 12)
- JWT-based access tokens (15-minute expiry) and refresh tokens (7-day expiry)
- Refresh token rotation with automatic theft detection
- OAuth 2.0 integration for 5 providers: Google, Facebook, Apple, Microsoft, Twitter/X
- Multi-factor authentication (TOTP) setup, verification, and disable
- Email verification flow with resend capability
- Password reset via email with secure tokens
- Login attempt tracking for brute force protection
- Account lockout after failed attempts

#### Authorization
- Role-based access control with 5 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER
- Granular permission system (action + resource model with RolePermission join table)
- Static role hierarchy fallback for common operations
- Permission middleware (`can(action, resource)`)

#### User Management
- User registration, login, and profile management
- User listing with pagination (ADMIN+)
- User update and soft delete (SUPER_ADMIN only)
- Account status management (PENDING, ACTIVE, SUSPENDED, BANNED)
- Profile fields: name, email, avatar, phone, role, status

#### Organizations & Teams
- Multi-tenant organization structure
- Organization CRUD with member management
- Team sub-grouping within organizations
- Member invitations with token-based acceptance
- Role assignment per organization context
- Soft delete for organizations

#### AI Integration
- GROQ API integration for chat completions (llama3-70b-8192 model)
- Server-Sent Events (SSE) streaming for real-time AI responses
- Provider abstraction layer (`AIProvider` class)
- Prompt management system with typed prompts (default, codeReview, architecture, database)
- AI service functions: generateResponse, generateStreamingResponse, codeReview, generateSchema
- Mock mode for development without API key
- Conversation persistence with Message history
- Token usage tracking per request

#### Billing
- Subscription plan definitions (Free, Pro, Enterprise)
- Plan limits and feature configuration
- Customizable pricing and billing intervals
- Subscription lifecycle management
- Invoice generation and payment tracking
- Multiple payment method support
- Coupon/discount code system
- Usage record tracking for metered billing

#### File Management
- File upload with multer (memory storage, 10MB limit)
- MIME type whitelisting (images, PDF, CSV)
- S3-compatible storage integration
- UUID-based file naming to prevent collisions
- File download with streaming
- Soft delete for files

#### Notifications
- In-app notification system with read/unread status
- Notification channel preferences (in_app, email, push)
- Notification templates with variable support
- Bulk mark-as-read functionality
- Per-type notification channel configuration

#### API Infrastructure
- Express.js RESTful API with 20+ route groups
- Zod-based input validation with descriptive error messages
- Global rate limiting (100 requests/15 min) with per-endpoint configuration
- Helmet.js security headers
- CORS with configurable origin
- Compression middleware (gzip)
- Structured JSON error responses with field-level validation details
- Pagination support for list endpoints
- Health check endpoint (`GET /api/health`)
- Morgan HTTP request logging

#### Database
- Prisma ORM with PostgreSQL 16
- 25+ models covering all application domains
- Comprehensive indexing strategy (foreign keys, filters, sorts, unique constraints)
- UUID primary keys throughout
- Soft delete pattern (`deletedAt` fields)
- Database migration workflow
- Seed data for development (admin user, demo user, plans, permissions)

#### Frontend
- React 18 with TypeScript (strict mode)
- Vite build tooling with hot module replacement
- Tailwind CSS with custom design system
- Radix UI primitives (accordion, checkbox, dialog, dropdown, popover, radio, select, separator, slider, switch, tabs, toast, tooltip)
- TanStack Query (React Query) for server state management
- React Hook Form with Zod schema validation
- Axios HTTP client with interceptors
- GSAP animations with Lenis smooth scrolling
- Lucide React icons
- Recharts for data visualization
- React Router v6 with lazy loading
- React Hot Toast for notifications
- clsx utility for conditional classes

#### Deployment
- Multi-stage Docker builds for backend (Node 24 Alpine) and frontend (Nginx)
- Docker Compose configuration with PostgreSQL, backend, and frontend services
- Nginx reverse proxy with SPA routing and API proxying
- GitHub Actions CI/CD workflow (test, build, deploy)
- Health checks for database dependency management
- Structured JSON logging with log level configuration
- Environment variable management with .env.example

### Notes

- This is the initial release — see the [Roadmap](/development/roadmap) for upcoming features
- Breaking changes may occur in minor versions before 2.0.0
- Migration guides will be provided for each breaking change
