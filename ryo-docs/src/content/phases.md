# Development Phases

Building a SaaS application with RyoFramework follows five distinct phases. Each phase builds on the previous one, incrementally adding features while maintaining a working application at every step.

> **Estimated total time:** 4–8 weeks for a single developer working full-time.
> **Team of 2–3:** 2–4 weeks.

---

## Phase 1: Setup & Auth

**Goal:** Get the project running locally with authentication, user management, and the foundation laid for all future features.

**Estimated Time:** 5–7 days

### Tasks

#### Day 1: Project Initialization

- [ ] Clone the repository and install dependencies (backend + frontend)
- [ ] Configure PostgreSQL and Redis
- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Run `prisma db push` to create database tables
- [ ] Run `prisma db seed` to create initial admin user and roles
- [ ] Start backend (`npm run dev`) and frontend (`npm run dev`)
- [ ] Verify health check endpoint returns connected services
- [ ] Commit: `chore: initial project setup`

#### Day 2–3: Authentication System

- [ ] Review auth configuration in `backend/src/config/`
- [ ] Implement registration endpoint (POST `/api/v1/auth/register`)
  - Validate email uniqueness, password strength
  - Hash password with bcrypt, create user record
  - Return access + refresh tokens
- [ ] Implement login endpoint (POST `/api/v1/auth/login`)
  - Verify credentials, issue JWT pair
  - Set refresh token in HTTP-only cookie
- [ ] Implement logout endpoint (POST `/api/v1/auth/logout`)
  - Invalidate refresh token in Redis
- [ ] Implement token refresh endpoint (POST `/api/v1/auth/refresh`)
  - Verify refresh token, issue new access token
- [ ] Implement password reset flow
  - Request reset (sends email with token)
  - Reset password with token
- [ ] Build auth UI in frontend
  - LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
  - Auth context provider that manages token lifecycle
  - Protected route wrapper component
  - Auto-redirect to login on 401 responses
- [ ] Write auth interceptor in `lib/api.ts`
  - Attach Bearer token to requests
  - Handle 401 → attempt refresh → retry or redirect to login
- [ ] Commit: `feat: authentication with JWT tokens and password reset`

#### Day 4: OAuth Integration

- [ ] Configure OAuth providers in `.env` (GitHub, Google)
- [ ] Implement OAuth controller and service
  - Redirect to provider consent screen
  - Handle callback, exchange code for tokens
  - Create or link user account
- [ ] Build OAuth buttons in frontend
- [ ] Commit: `feat: OAuth with GitHub and Google`

#### Day 5: RBAC (Role-Based Access Control)

- [ ] Define roles in database: `super_admin`, `admin`, `member`, `viewer`
- [ ] Define permissions per role in `backend/src/config/rbac.ts`
- [ ] Implement RBAC middleware (`rbac.ts`)
  - Check user role against required permission
  - Return 403 on unauthorized access
- [ ] Create admin user management page
- [ ] Commit: `feat: role-based access control`

#### Day 6: Testing & Polish

- [ ] Write integration tests for auth flow (register, login, refresh, logout)
- [ ] Write unit tests for password hashing and token utilities
- [ ] Write frontend component tests for login form
- [ ] Audit error messages for security (no revealing user existence)
- [ ] Add rate limiting to auth endpoints
- [ ] Commit: `test: auth integration tests`

### Deliverables

- Running backend with PostgreSQL and Redis
- Login and registration (email + password)
- OAuth login (GitHub and/or Google)
- Password reset via email
- JWT access + refresh token flow
- Role-based access control with 4 roles
- Auth UI with protected routing
- Tests covering auth flow

---

## Phase 2: Core Features

**Goal:** Implement the core SaaS building blocks — organizations, teams, user management, and the admin dashboard.

**Estimated Time:** 7–10 days

### Tasks

#### Day 1–2: Organizations

- [ ] Review org models in Prisma schema
  - `Organization`, `OrganizationMember`, `Invitation`
- [ ] Implement org CRUD endpoints
  - Create org (POST `/api/v1/orgs`)
  - Update org (PATCH `/api/v1/orgs/:id`)
  - Delete org (soft delete, DELETE `/api/v1/orgs/:id`)
  - List user's orgs (GET `/api/v1/orgs`)
- [ ] Implement membership management
  - Invite member (POST `/api/v1/orgs/:id/invitations`)
  - Accept/decline invitation (PATCH `/api/v1/invitations/:id`)
  - Remove member (DELETE `/api/v1/orgs/:id/members/:userId`)
  - Leave org (POST `/api/v1/orgs/:id/leave`)
- [ ] Implement tenant isolation middleware
  - Extract `organizationId` from request header or subdomain
  - Scope all database queries to the organization
- [ ] Build org UI
  - Org creation flow (first-time setup wizard)
  - Org settings page (name, logo, slug)
  - Members list with role management
  - Invite member modal (email + role selector)
- [ ] Commit: `feat: organization CRUD and membership`

#### Day 3–4: Teams

- [ ] Review team models: `Team`, `TeamMember`
- [ ] Implement team CRUD endpoints
- [ ] Implement team member management
- [ ] Build team UI (list, create, edit, member management)
- [ ] Commit: `feat: team management`

#### Day 5–6: User Profile & Preferences

- [ ] Implement user profile endpoints
  - Get profile (GET `/api/v1/users/me`)
  - Update profile (PATCH `/api/v1/users/me`)
  - Change password (POST `/api/v1/users/me/password`)
  - Upload avatar (POST `/api/v1/users/me/avatar`)
- [ ] Implement user preferences
  - Theme preference (light/dark/system)
  - Notification preferences (email, push, in-app)
  - Timezone and locale
- [ ] Build settings UI
  - Profile settings page (name, email, avatar)
  - Security settings page (password change, active sessions)
  - Appearance settings page (theme toggle)
  - Notification preferences page
- [ ] Commit: `feat: user profile and preferences`

#### Day 7–8: Admin Dashboard

- [ ] Implement admin endpoints
  - User management (list, search, suspend, delete)
  - Organization management
  - System metrics (active users, new signups, revenue)
  - Audit log viewer
- [ ] Build admin UI
  - Admin layout with sidebar navigation
  - Users table with search, filter, actions
  - Metrics dashboard with stat cards and charts
  - Audit log with date range filtering
- [ ] Commit: `feat: admin dashboard`

#### Day 9–10: Search

- [ ] Configure search driver (PostgreSQL full-text search or Meilisearch)
- [ ] Implement search endpoint (GET `/api/v1/search`)
  - Search across users, orgs, files, and custom entities
  - Return ranked results with highlighted matches
- [ ] Build global search UI
  - Search bar in header (`Cmd+K` or `Ctrl+K` shortcut)
  - Search results dropdown with categories
  - Dedicated search results page
- [ ] Commit: `feat: full-text search`

### Deliverables

- Multi-tenant organizations with member management
- Team management within organizations
- User profiles with avatar upload
- User preferences (theme, notifications, locale)
- Admin dashboard with user/org management
- System metrics and audit log
- Global full-text search across entities
- Tenant isolation enforced at database level

---

## Phase 3: AI Integration

**Goal:** Integrate GROQ-powered AI features — chat, agents, content generation, and AI-assisted workflows.

**Estimated Time:** 5–7 days

### Tasks

#### Day 1: GROQ Setup & AI Service

- [ ] Obtain GROQ API key from [console.groq.com](https://console.groq.com)
- [ ] Configure `GROQ_API_KEY` and `GROQ_MODEL` in `.env`
- [ ] Implement AI client in `backend/src/services/ai/`
  - `ai.service.ts` — Base GROQ client with streaming support
  - `prompts.service.ts` — Prompt template loading and rendering
- [ ] Implement AI chat endpoint
  - POST `/api/v1/ai/chat` — Send message, receive streamed response
  - Support conversation history context
- [ ] Implement AI completion endpoint
  - POST `/api/v1/ai/complete` — Single-turn completion (no history)
- [ ] Build AI chat UI
  - ChatWindow component with message list
  - MessageBubble component (user + AI, with streaming indicator)
  - PromptInput with send button (Enter to send, Shift+Enter for newline)
  - Streaming response rendering (text appears token by token)
- [ ] Commit: `feat: AI chat with GROQ integration`

#### Day 2–3: AI Agents

- [ ] Define agent architecture
  - Each agent has a system prompt, available tools, and model config
  - Agents are defined in `ai/agents/` as TypeScript modules
- [ ] Implement agent orchestration service
  - `agent.service.ts` — Loads agent config, manages conversation loop
  - Tool calling loop: model → tool request → execute → model
- [ ] Implement the support agent
  - `ai/agents/support.agent.ts`
  - Tools: search knowledge base, look up user account, create ticket
- [ ] Implement the content agent
  - `ai/agents/content.agent.ts`
  - Tools: generate blog post, summarize document, rewrite text
- [ ] Implement agent endpoints
  - POST `/api/v1/ai/agents/:agentId/chat` — Chat with specific agent
  - GET `/api/v1/ai/agents` — List available agents
- [ ] Build agent selector UI
  - Agent selection dropdown or card grid
  - Agent-specific UI (different input hints, example prompts)
- [ ] Commit: `feat: AI agents with tool calling`

#### Day 4: AI Tools

- [ ] Implement tool definitions in `ai/tools/`
  - Each tool has a name, description, parameter schema, and execute function
- [ ] Build core tools:
  - `search.tool.ts` — Search application data (users, docs, files)
  - `database.tool.ts` — Read-only SQL queries (with safety constraints)
  - `calculator.tool.ts` — Math, statistics, data analysis
  - `send-email.tool.ts` — Send emails on behalf of the user
  - `weather.tool.ts` — Weather information (demonstration tool)
- [ ] Register tools with agents via configuration
- [ ] Build tool usage visualization in frontend
  - Show when the AI is "thinking" or "using a tool"
  - Display tool results inline in the chat
- [ ] Commit: `feat: AI tool definitions and execution`

#### Day 5: Prompt Management

- [ ] Implement prompt template system
  - Templates stored as Markdown files in `ai/prompts/`
  - Templates use Handlebars/Mustache-style variables
  - Version tracking via file hashing or git
- [ ] Create system prompts
  - `ai/prompts/system/support.md` — Customer support agent persona
  - `ai/prompts/system/content.md` — Content writer agent persona
  - `ai/prompts/system/analytics.md` — Data analyst agent persona
- [ ] Create user prompt templates
  - `ai/prompts/user/summarize.md` — "Summarize the following: {{text}}"
  - `ai/prompts/user/generate.md` — "Generate a {{type}} about {{topic}}"
- [ ] Implement prompt preview and testing UI (admin only)
- [ ] Commit: `feat: prompt template management`

#### Day 6: AI Usage Tracking & Safety

- [ ] Implement AI usage tracking
  - Track tokens used per user and per organization
  - Store in `AiUsage` database model
  - Expose usage stats via API
- [ ] Implement rate limits for AI endpoints
  - Per-user token limits (hourly/daily)
  - Per-organization concurrent request limits
- [ ] Add content safety checks
  - Input validation and sanitization
  - Output filtering for sensitive content
  - Prompt injection protection (delimiter injection, role play detection)
- [ ] Build AI usage dashboard for admin
- [ ] Commit: `feat: AI usage tracking and safety`

#### Day 7: AI-Assisted Workflows

- [ ] Implement AI-assisted content generation in the app
  - "AI Write" button on text inputs (blog posts, descriptions)
  - "AI Summarize" action on documents
  - "AI Translate" for multi-language support
- [ ] Implement AI-assisted search
  - Natural language query understanding
  - "Show me all users who signed up last week" → structured query
- [ ] Build AI playground page for developers (admin)
  - Test prompts, tools, and agent configurations
  - Raw response viewer with timing metrics
- [ ] Commit: `feat: AI-assisted workflows`

### Deliverables

- GROQ-powered chat with streaming responses
- Multi-agent system (support, content, analytics)
- Tool calling with 5+ tools
- Prompt template system with versioning
- AI usage tracking and rate limiting
- AI-assisted writing throughout the app
- Natural language search
- AI playground for developer testing

---

## Phase 4: Billing & Notifications

**Goal:** Implement subscription billing with Stripe, email notifications, push notifications, and in-app notifications.

**Estimated Time:** 6–8 days

### Tasks

#### Day 1–2: Stripe Integration

- [ ] Create Stripe account and get API keys
- [ ] Configure Stripe products and prices in Dashboard
- [ ] Configure `.env` with Stripe keys
- [ ] Implement Stripe service in `backend/src/services/billing/`
  - Create customer on user registration
  - Create/update subscription
  - Handle price changes (upgrade/downgrade proration)
  - Cancel subscription
- [ ] Implement Stripe webhook handler
  - `customer.subscription.updated` — Sync subscription status
  - `customer.subscription.deleted` — Handle cancellation
  - `invoice.payment_succeeded` — Record payment
  - `invoice.payment_failed` — Handle failed payment
  - Verify webhook signatures for security
- [ ] Implement billing endpoints
  - GET `/api/v1/billing/plans` — List available plans
  - GET `/api/v1/billing/subscription` — Current subscription
  - POST `/api/v1/billing/subscription` — Create/change subscription
  - POST `/api/v1/billing/subscription/cancel` — Cancel
  - GET `/api/v1/billing/invoices` — Invoice history
  - POST `/api/v1/billing/portal` — Stripe Customer Portal session
- [ ] Commit: `feat: Stripe subscription billing`

#### Day 3: Usage Metering

- [ ] Implement usage tracking service
  - Track API calls, storage used, AI tokens, team members
  - Per-organization usage counters
- [ ] Implement usage-based billing
  - Define metered prices in Stripe
  - Report usage to Stripe via API
  - Cap usage at plan limits
- [ ] Build usage dashboard UI
  - Current usage vs. plan limits (progress bars)
  - Usage history chart (last 30 days)
  - Predictions for end-of-billing-cycle usage
- [ ] Commit: `feat: usage metering`

#### Day 4–5: Billing UI

- [ ] Build pricing page
  - Plan comparison table (Free, Pro, Enterprise)
  - Feature highlights per plan
  - Annual/monthly toggle with discount display
- [ ] Build subscription management page
  - Current plan display with features
  - Upgrade/downgrade flow
  - Payment method management (Stripe Elements)
  - Invoice history table
- [ ] Build billing settings in admin
  - Override subscription for any organization
  - Issue credits, apply discounts
  - View all invoices
- [ ] Commit: `feat: billing UI`

#### Day 6: Email Notifications

- [ ] Configure SMTP provider (Mailpit for dev, SendGrid/Resend for production)
- [ ] Implement email service
  - `email.service.ts` — Send emails with templates
  - Support HTML + plain text multipart
  - Queue emails via BullMQ for async delivery
- [ ] Implement email templates
  - Welcome email (on registration)
  - Password reset email
  - Invitation email (join organization)
  - Payment confirmation invoice
  - Subscription expiring notice
  - AI report complete notification
- [ ] Build email preview UI (admin)
  - Preview templates with sample data
  - Send test email
- [ ] Commit: `feat: email notifications`

#### Day 7: Push & In-App Notifications

- [ ] Implement in-app notification system
  - `Notification` model in database
  - Create notification on relevant events (member joined, invoice paid, etc.)
  - GET `/api/v1/notifications` — List notifications (paginated)
  - PATCH `/api/v1/notifications/:id/read` — Mark as read
  - POST `/api/v1/notifications/read-all` — Mark all as read
- [ ] Implement real-time notifications
  - WebSocket connection (Socket.io or Server-Sent Events)
  - Push new notifications to connected clients
  - Badge counter on notification bell
- [ ] Build notification UI
  - Notification bell in header with unread count badge
  - Dropdown notification list with recent items
  - Full notifications page with history and filtering
  - Toast notifications for real-time events
- [ ] Implement notification preferences
  - Per-event-type toggle (email, push, in-app, none)
  - Digest mode (daily/weekly summary email)
- [ ] Commit: `feat: push and in-app notifications`

### Deliverables

- Stripe subscription billing (monthly, yearly, metered)
- Customer portal for payment management
- Usage metering with visual dashboard
- Email notifications with 6+ templates
- Queue-based async email delivery
- In-app notification system
- Real-time push notifications via WebSocket
- Notification preference management

---

## Phase 5: Polish & Deploy

**Goal:** Production hardening, testing, documentation, performance optimization, and deployment.

**Estimated Time:** 7–10 days

### Tasks

#### Day 1–2: Testing

- [ ] Write backend integration tests for all endpoints
  - Auth flow (register, login, refresh, logout, reset)
  - Organization CRUD + membership
  - Team CRUD
  - Billing flow (subscription, webhooks)
  - AI endpoints (chat, agents, tools)
  - File upload and retrieval
- [ ] Write backend unit tests for services
  - `auth.service.ts` — All edge cases
  - `rbac.service.ts` — Permission inheritance
  - `stripe.service.ts` — Webhook signature verification
  - `search.service.ts` — Query parsing
- [ ] Write frontend component tests
  - All design system components (Button, Input, Modal, Table, etc.)
  - Critical feature components (LoginForm, InviteForm, SubscriptionCard)
- [ ] Write frontend E2E tests (Playwright)
  - User registration → login → create org → invite member
  - Admin login → view metrics → manage users
  - AI chat → send message → receive streaming response
  - Billing → view plans → subscribe → view invoice
- [ ] Set test coverage thresholds
  - Backend: 80%+ line coverage
  - Frontend: 70%+ component coverage
- [ ] Commit: `test: comprehensive test suite`

#### Day 3: Security Audit

- [ ] Run security audit tools
  - `npm audit` for dependency vulnerabilities
  - OWASP ZAP or similar for API security scanning
- [ ] Review security checklist
  - [ ] All passwords hashed (bcrypt, cost factor 12)
  - [ ] JWT secrets are strong and rotated
  - [ ] CORS configured to allow only frontend origin
  - [ ] Helmet.js enabled for HTTP headers
  - [ ] Rate limiting on auth and AI endpoints
  - [ ] SQL injection prevention (Prisma parameterized queries)
  - [ ] XSS prevention (React auto-escapes, CSP headers)
  - [ ] CSRF protection (SameSite cookies, CSRF tokens)
  - [ ] File upload validation (type, size, virus scanning)
  - [ ] API request size limits
  - [ ] Input validation on all endpoints (Zod)
  - [ ] Audit logging on all sensitive operations
  - [ ] Proper error handling (no stack traces in production)
- [ ] Commit: `chore: security audit fixes`

#### Day 4: Performance Optimization

- [ ] Database optimization
  - Add missing indexes (analyze with `EXPLAIN ANALYZE`)
  - Enable connection pooling (PgBouncer or Prisma Accelerate)
  - Archive old data with partitioning
- [ ] API optimization
  - Add response caching where appropriate (Redis)
  - Implement eager loading to avoid N+1 queries
  - Add pagination to all list endpoints
  - Compress responses (gzip/brotli)
- [ ] Frontend optimization
  - Code splitting with React.lazy + Suspense
  - Image optimization (lazy loading, WebP, responsive sizes)
  - Bundle analysis and dead code elimination
  - Implement virtual scrolling for large lists
- [ ] Run Lighthouse audit
  - Aim for 90+ on Performance, Accessibility, Best Practices, SEO
- [ ] Commit: `perf: database indexes and frontend code splitting`

#### Day 5: Monitoring & Observability

- [ ] Set up structured logging
  - JSON log output in production
  - Request ID correlation across services
  - Log levels: debug, info, warn, error, fatal
- [ ] Set up error tracking (Sentry or similar)
  - Capture uncaught exceptions and promise rejections
  - Source maps for stack trace deobfuscation
  - User context in error reports
- [ ] Set up performance monitoring
  - API response time tracking
  - Database query performance
  - AI token usage and latency
- [ ] Set up health check endpoints
  - `/api/v1/health` — Basic service status
  - `/api/v1/health/ready` — Readiness probe (DB, Redis connected)
  - `/api/v1/health/live` — Liveness probe
- [ ] Configure uptime monitoring (Better Uptime, Checkly, or similar)
- [ ] Commit: `feat: monitoring and observability`

#### Day 6: Documentation

- [ ] Complete API documentation
  - All endpoints documented with request/response examples
  - Error codes documented
  - Authentication methods explained
- [ ] Complete frontend documentation
  - Design system component reference with usage examples
  - Feature module overviews
  - State management patterns
- [ ] Write deployment guide
  - Docker Compose (staging)
  - Production deployment options (VPS, Kubernetes, Cloud Run, Fly.io)
  - Environment variable reference
- [ ] Write contributor guide
  - Setup instructions
  - Code conventions
  - PR process
- [ ] Record Loom walkthrough videos (optional)
- [ ] Commit: `docs: complete API and deployment documentation`

#### Day 7–8: CI/CD & Deployment

- [ ] Configure GitHub Actions
  - Lint on PR (ESLint + Prettier)
  - Type check on PR (tsc --noEmit)
  - Test on PR (vitest, playwright)
  - Build on PR (frontend + backend)
  - Deploy to staging on merge to `develop`
  - Deploy to production on merge to `main`
- [ ] Configure Docker build
  - Multi-stage Dockerfile for small production images
  - Cache layers for faster builds
  - Health check in Dockerfile
- [ ] Configure staging environment
  - Deploy to staging with `docker compose up`
  - Staging database with anonymized production data
  - Test Stripe webhooks with Stripe CLI
- [ ] Configure production environment
  - PostgreSQL (managed: RDS, Cloud SQL, Supabase)
  - Redis (managed: Upstash, ElastiCache)
  - File storage (S3 or R2)
  - Domain and SSL (Let's Encrypt via Caddy or nginx)
  - SMTP for email delivery
- [ ] Run production smoke tests
  - Register user → verify email → login
  - Create organization → invite member
  - Subscribe to paid plan → verify Stripe webhook
  - Use AI chat → verify streaming and token tracking
- [ ] Application monitoring live (Sentry, Grafana)
- [ ] Commit: `ci: GitHub Actions with test and deploy workflows`

#### Day 9–10: Launch Preparation

- [ ] Create product landing page
- [ ] Set up analytics (Plausible, PostHog, or similar)
- [ ] Configure domain email (send-only via Resend/SendGrid)
- [ ] Set up customer support channel (Intercom, Crisp, or Discord)
- [ ] Create user onboarding flow
  - Welcome email sequence
  - In-app onboarding checklist
  - First-run wizard
- [ ] Write terms of service and privacy policy
- [ ] Final review of all hardcoded text, URLs, and credentials
- [ ] Tag version: `git tag v1.0.0 && git push --tags`

### Deliverables

- Comprehensive test suite (unit, integration, E2E)
- Security audit passed
- Performance optimized (90+ Lighthouse)
- Monitoring and error tracking configured
- Complete documentation
- CI/CD pipeline with GitHub Actions
- Staging environment
- Production deployment
- Launch checklist completed

---

## Phase Timeline Summary

| Phase | Duration | Cumulative |
|---|---|---|
| **Phase 1:** Setup & Auth | 5–7 days | Week 1 |
| **Phase 2:** Core Features | 7–10 days | Weeks 2–3 |
| **Phase 3:** AI Integration | 5–7 days | Weeks 3–4 |
| **Phase 4:** Billing & Notifications | 6–8 days | Weeks 4–5 |
| **Phase 5:** Polish & Deploy | 7–10 days | Weeks 6–8 |

## Skipping Phases

Not every project needs all features. RyoFramework is modular:

- **No billing?** Skip Phase 4 entirely. Remove billing routes and pages.
- **No AI?** Skip Phase 3. Remove AI service and middleware references.
- **Single-tenant?** Simplify Phase 2 — skip orgs and teams, use simple user profiles.
- **Internal tool?** Skip billing and OAuth. Use only email/password auth.

Each phase is independent. You can build a minimal product with just Phases 1, 2, and 5 in ~3 weeks.

---

## Next Steps

- **[Introduction](/docs/introduction)** — Learn about RyoFramework's vision and philosophy
- **[Installation](/docs/installation)** — Set up the project
- **[Project Structure](/docs/project-structure)** — Understand the codebase layout
