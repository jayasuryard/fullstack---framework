# Project Structure

RyoFramework follows a **monorepo-style** layout with clear separation of concerns. Every directory has a defined purpose, and naming conventions are applied consistently across the codebase.

---

## Top-Level Structure

```
ryo-framework/
├── backend/           # Node.js/Express API server
├── frontend/          # React/Vite/Tailwind application
├── ai/                # AI agent definitions and prompt templates
├── infrastructure/    # Docker, nginx, CI/CD configuration
├── docs/              # Static documentation site
├── packages/          # Shared packages (types, utils, validators)
├── scripts/           # Utility scripts (dev, build, deploy)
├── .github/           # GitHub Actions workflows and templates
├── .env.example       # Environment variable template
├── docker-compose.yml # Local development orchestration
├── package.json       # Root workspace configuration
├── tsconfig.base.json # Shared TypeScript configuration
└── README.md          # Project overview
```

---

## Backend Structure

```
backend/
├── src/
│   ├── config/           # Application configuration
│   │   ├── index.ts          # Central config from env vars
│   │   ├── cors.ts           # CORS settings
│   │   ├── rate-limit.ts     # Rate limiting configuration
│   │   ├── session.ts        # Session store setup
│   │   └── logger.ts         # Logging configuration (Pino)
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts            # JWT verification middleware
│   │   ├── rbac.ts            # Role/permission guard
│   │   ├── validate.ts        # Request validation (Zod schemas)
│   │   ├── upload.ts          # File upload handling (Multer)
│   │   ├── tenant.ts          # Organization context resolution
│   │   ├── audit.ts           # Audit logging middleware
│   │   ├── error-handler.ts   # Global error handler
│   │   ├── not-found.ts       # 404 handler
│   │   └── async-handler.ts   # Async route wrapper
│   │
│   ├── routes/            # Express route definitions
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts     # /api/v1/auth/*
│   │   ├── users.routes.ts    # /api/v1/users/*
│   │   ├── orgs.routes.ts     # /api/v1/orgs/*
│   │   ├── teams.routes.ts    # /api/v1/teams/*
│   │   ├── billing.routes.ts  # /api/v1/billing/*
│   │   ├── notifications.routes.ts
│   │   ├── files.routes.ts    # /api/v1/files/*
│   │   ├── search.routes.ts   # /api/v1/search/*
│   │   ├── settings.routes.ts # /api/v1/settings/*
│   │   ├── admin.routes.ts    # /api/v1/admin/*
│   │   ├── webhooks.routes.ts # /api/v1/webhooks/*
│   │   └── health.routes.ts   # /api/v1/health
│   │
│   ├── controllers/       # Request handlers (thin layer)
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── orgs.controller.ts
│   │   ├── teams.controller.ts
│   │   ├── billing.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── files.controller.ts
│   │   ├── search.controller.ts
│   │   ├── settings.controller.ts
│   │   ├── admin.controller.ts
│   │   └── ai.controller.ts
│   │
│   ├── services/          # Business logic layer
│   │   ├── auth/
│   │   │   ├── auth.service.ts      # Login, register, refresh, logout
│   │   │   ├── oauth.service.ts     # GitHub, Google OAuth flows
│   │   │   ├── password.service.ts  # Hashing, reset, change
│   │   │   └── session.service.ts   # Session management
│   │   ├── users/
│   │   │   ├── users.service.ts     # CRUD, profile, preferences
│   │   │   └── rbac.service.ts      # Role and permission management
│   │   ├── orgs/
│   │   │   ├── orgs.service.ts      # Organization CRUD
│   │   │   └── membership.service.ts# Member invite, join, leave
│   │   ├── teams/
│   │   │   └── teams.service.ts     # Team CRUD and membership
│   │   ├── billing/
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── invoices.service.ts
│   │   │   ├── usage.service.ts     # Usage metering
│   │   │   └── stripe.service.ts    # Stripe API integration
│   │   ├── notifications/
│   │   │   ├── email.service.ts     # Email delivery (SMTP/Resend)
│   │   │   ├── push.service.ts      # Push notification delivery
│   │   │   └── template.service.ts  # Notification templates
│   │   ├── files/
│   │   │   ├── storage.service.ts   # Local/S3/R2 abstraction
│   │   │   ├── image.service.ts     # Image processing (Sharp)
│   │   │   └── upload.service.ts    # Upload pipeline
│   │   ├── ai/
│   │   │   ├── ai.service.ts        # GROQ API client
│   │   │   ├── agent.service.ts     # Agent orchestration
│   │   │   ├── tools.service.ts     # AI tool definitions
│   │   │   └── prompts.service.ts   # Prompt template management
│   │   ├── search/
│   │   │   └── search.service.ts    # Full-text search
│   │   ├── audit/
│   │   │   └── audit.service.ts     # Audit log recording and query
│   │   └── admin/
│   │       ├── analytics.service.ts # Dashboard metrics
│   │       └── admin.service.ts     # Admin operations
│   │
│   ├── jobs/              # Background job definitions
│   │   ├── index.ts             # Queue setup (BullMQ)
│   │   ├── send-email.job.ts
│   │   ├── process-image.job.ts
│   │   ├── generate-report.job.ts
│   │   └── cleanup-files.job.ts
│   │
│   ├── validators/        # Zod schemas for request validation
│   │   ├── auth.schema.ts
│   │   ├── users.schema.ts
│   │   ├── orgs.schema.ts
│   │   ├── teams.schema.ts
│   │   ├── billing.schema.ts
│   │   └── common.schema.ts
│   │
│   ├── types/             # TypeScript type definitions
│   │   ├── express.d.ts        # Express Request augmentation
│   │   ├── models.ts           # Entity type interfaces
│   │   └── responses.ts        # API response envelope types
│   │
│   ├── utils/             # Shared utility functions
│   │   ├── api-response.ts     # Standardized response builder
│   │   ├── pagination.ts       # Cursor and offset pagination
│   │   ├── encryption.ts       # AES encryption helpers
│   │   ├── tokens.ts           # JWT generation and verification
│   │   ├── slug.ts             # URL slug generation
│   │   └── date.ts             # Date formatting utilities
│   │
│   └── app.ts             # Express app setup (middleware registration)
│
├── prisma/
│   ├── schema.prisma      # Database schema (all models)
│   ├── migrations/        # Versioned SQL migration files
│   ├── seed.ts            # Database seeding script
│   └── client.ts          # Prisma client singleton
│
├── tests/
│   ├── unit/              # Unit tests (Vitest)
│   │   ├── services/
│   │   └── validators/
│   ├── integration/       # Integration tests (Supertest)
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   └── orgs.test.ts
│   └── fixtures/          # Test data and factories
│       └── factories.ts
│
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Backend Architecture Flow

```
HTTP Request
    ↓
app.ts → middleware chain (auth → rbac → tenant → audit → validate)
    ↓
routes/{resource}.routes.ts → validates path + method
    ↓
controllers/{resource}.controller.ts → parses input, calls service, formats response
    ↓
services/{resource}/{resource}.service.ts → business logic, calls Prisma/external APIs
    ↓
prisma/schema.prisma → database interaction
    ↓
HTTP Response ← error-handler (if error) or controller response
```

### Backend Conventions

| Convention | Standard |
|---|---|
| **File naming** | `kebab-case.{type}.ts` (e.g., `auth.service.ts`) |
| **Controller methods** | `index`, `show`, `store`, `update`, `destroy` |
| **Service methods** | Descriptive verbs: `createUser`, `findByEmail`, `updateSubscription` |
| **Route prefixes** | `/api/v1/{resource}` |
| **Error handling** | Throw `AppError` subclasses; caught by global error handler |
| **Response format** | `{ data, meta: { page, limit, total }, error: null }` for success |
| **Authentication** | `req.user` populated by `auth.ts` middleware |
| **Organization context** | `req.org` populated by `tenant.ts` middleware |

---

## Frontend Structure

```
frontend/
├── src/
│   ├── features/              # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/        # LoginForm, RegisterForm, OAuthButtons
│   │   │   ├── hooks/             # useAuth, useLogin, useRegister
│   │   │   ├── pages/             # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   ├── services/          # auth.api.ts (API calls)
│   │   │   ├── schemas/           # Zod validation schemas
│   │   │   └── types/             # Auth-specific types
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/        # StatCard, ActivityFeed, QuickActions
│   │   │   ├── hooks/             # useDashboard
│   │   │   └── pages/             # DashboardPage
│   │   │
│   │   ├── users/
│   │   │   ├── components/        # UserTable, UserForm, UserAvatar
│   │   │   ├── hooks/             # useUsers, useUser
│   │   │   └── pages/             # UsersPage, UserDetailPage
│   │   │
│   │   ├── orgs/
│   │   │   ├── components/        # OrgSettings, MemberList, InviteForm
│   │   │   ├── hooks/             # useOrg, useMembers
│   │   │   └── pages/             # OrgSettingsPage, MembersPage
│   │   │
│   │   ├── teams/
│   │   │   ├── components/        # TeamCard, TeamForm, TeamMemberList
│   │   │   ├── hooks/             # useTeams, useTeam
│   │   │   └── pages/             # TeamsPage, TeamDetailPage
│   │   │
│   │   ├── billing/
│   │   │   ├── components/        # SubscriptionCard, InvoiceTable, PricingCards
│   │   │   ├── hooks/             # useSubscription, useInvoices
│   │   │   └── pages/             # BillingPage, PricingPage
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/        # NotificationBell, NotificationList, NotificationItem
│   │   │   ├── hooks/             # useNotifications
│   │   │   └── pages/             # NotificationsPage
│   │   │
│   │   ├── files/
│   │   │   ├── components/        # FileUploader, FileList, FilePreview
│   │   │   ├── hooks/             # useFiles, useUpload
│   │   │   └── pages/             # FilesPage
│   │   │
│   │   ├── ai/
│   │   │   ├── components/        # ChatWindow, MessageBubble, PromptInput
│   │   │   ├── hooks/             # useChat, useAICompletion
│   │   │   └── pages/             # AIChatPage, AgentPlaygroundPage
│   │   │
│   │   ├── search/
│   │   │   ├── components/        # SearchBar, SearchResults, SearchFilters
│   │   │   ├── hooks/             # useSearch
│   │   │   └── pages/             # SearchPage
│   │   │
│   │   ├── admin/
│   │   │   ├── components/        # AdminLayout, MetricsGrid, UserManagementTable
│   │   │   ├── hooks/             # useAdminMetrics
│   │   │   └── pages/             # AdminDashboardPage, AdminUsersPage
│   │   │
│   │   └── settings/
│   │       ├── components/        # ProfileForm, SecuritySettings, AppearanceSettings
│   │       ├── hooks/             # useSettings
│   │       └── pages/             # SettingsPage
│   │
│   ├── design-system/         # Design system (DS) components
│   │   ├── Button/
│   │   │   ├── Button.tsx          # Variants: primary, secondary, ghost, danger
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx           # Text, email, password, search variants
│   │   │   └── index.ts
│   │   ├── Select/
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx           # Accessible modal with Portal
│   │   │   └── index.ts
│   │   ├── Table/
│   │   │   ├── Table.tsx           # Sortable, paginated table
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx           # Status, severity, count badges
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── Skeleton/
│   │   │   ├── Skeleton.tsx        # Loading skeleton component
│   │   │   └── index.ts
│   │   ├── Toast/
│   │   │   ├── Toast.tsx           # Toast notification system
│   │   │   ├── ToastProvider.tsx
│   │   │   └── index.ts
│   │   ├── Avatar/
│   │   │   ├── Avatar.tsx          # User avatar with fallback
│   │   │   └── index.ts
│   │   ├── Dropdown/
│   │   │   ├── Dropdown.tsx
│   │   │   └── index.ts
│   │   └── index.ts            # Barrel exports for all DS components
│   │
│   ├── components/             # Shared / layout components
│   │   ├── Layout.tsx              # App shell (sidebar + header + content)
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Header.tsx              # Top header bar (search, notifications, user menu)
│   │   ├── PageHeader.tsx          # Page title + actions pattern
│   │   ├── EmptyState.tsx          # Empty state placeholder
│   │   ├── ErrorBoundary.tsx       # React error boundary
│   │   ├── LoadingScreen.tsx       # Full-page loading spinner
│   │   ├── ConfirmDialog.tsx       # Confirmation modal
│   │   └── ThemeToggle.tsx         # Dark/light mode switch
│   │
│   ├── hooks/                  # Shared React hooks
│   │   ├── useDebounce.ts          # Debounced value
│   │   ├── useClickOutside.ts      # Click outside detection
│   │   ├── useMediaQuery.ts        # Responsive breakpoint hooks
│   │   ├── useLocalStorage.ts      # Typed localStorage hook
│   │   ├── usePagination.ts        # Pagination state management
│   │   └── useIntersectionObserver.ts
│   │
│   ├── lib/                    # Library configurations
│   │   ├── api.ts                 # Axios/fetch instance with auth interceptor
│   │   ├── query-client.ts        # TanStack Query client configuration
│   │   ├── router.tsx             # React Router route definitions
│   │   └── auth-context.tsx       # Auth context provider
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── auth.store.ts          # Auth/token state
│   │   ├── theme.store.ts         # Theme/dark mode state
│   │   └── notifications.store.ts # Notification state
│   │
│   ├── types/                  # Shared frontend types
│   │   ├── api.ts                 # API response types
│   │   ├── models.ts              # Entity types matching backend
│   │   └── common.ts              # Utility types
│   │
│   ├── styles/                 # Global styles
│   │   ├── globals.css            # Tailwind directives + base styles
│   │   └── typography.css         # Prose styles for markdown rendering
│   │
│   ├── App.tsx                 # Root component with providers
│   └── main.tsx                # Entry point
│
├── public/                    # Static assets
│   ├── favicon.svg
│   └── og-image.png
│
├── tests/
│   ├── components/            # Component tests (Vitest + Testing Library)
│   ├── hooks/                 # Hook tests
│   └── e2e/                   # E2E tests (Playwright)
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── playwright.config.ts
```

### Frontend Architecture Flow

```
User Action (click, form submit, navigation)
    ↓
Page Component (features/{module}/pages/)
    ↓
Feature Component (features/{module}/components/) → uses design-system atoms
    ↓
Custom Hook (features/{module}/hooks/) → uses TanStack Query or Zustand
    ↓
API Service (features/{module}/services/) → uses lib/api.ts instance
    ↓
Backend API → JSON Response
    ↓
TanStack Query cache → re-render UI
```

### Frontend Conventions

| Convention | Standard |
|---|---|
| **File naming** | `PascalCase.tsx` for components, `kebab-case.ts` for non-components |
| **Component structure** | One component per file, with `index.ts` barrel export |
| **CSS** | Tailwind utility classes only; no CSS modules or styled-components |
| **Custom classes** | Only in `globals.css` for base resets or complex animations |
| **State management** | TanStack Query for server state, Zustand for client state |
| **Form validation** | React Hook Form + Zod schemas shared with backend |
| **API calls** | Through `lib/api.ts` which handles auth tokens, retries, and error normalization |
| **Dark mode** | Tailwind `dark:` prefix; managed via Zustand `theme.store` |
| **Design system** | All DS components in `design-system/`; feature components in `features/` |

---

## AI Structure

```
ai/
├── agents/                  # AI agent definitions
│   ├── support.agent.ts         # Customer support agent
│   ├── content.agent.ts         # Content generation agent
│   ├── analytics.agent.ts       # Data analysis agent
│   └── coding.agent.ts          # Code assistant agent
│
├── tools/                   # Tool definitions (function calling)
│   ├── search.tool.ts           # Search application data
│   ├── weather.tool.ts          # Weather lookup
│   ├── calculator.tool.ts       # Math calculation
│   ├── send-email.tool.ts       # Send email on behalf of user
│   └── database.tool.ts         # Read-only database queries
│
├── prompts/                 # Prompt templates
│   ├── system/                  # System prompts
│   │   ├── support.md
│   │   ├── content.md
│   │   └── analytics.md
│   └── user/                    # User prompt templates
│       ├── summarize.md
│       └── generate.md
│
├── types/                   # AI-specific types
│   ├── agent.ts
│   ├── message.ts
│   └── tool.ts
│
├── config.ts                # AI configuration (model, temperature, max tokens)
└── client.ts                # GROQ client setup
```

---

## Infrastructure Structure

```
infrastructure/
├── docker/
│   ├── Dockerfile.dev          # Development container with hot-reload
│   ├── Dockerfile.prod         # Production multi-stage build
│   └── Dockerfile.frontend     # Frontend build + nginx serve
│
├── nginx/
│   ├── nginx.conf              # Main nginx configuration
│   ├── sites/
│   │   ├── app.conf            # Reverse proxy to Node app
│   │   └── frontend.conf       # Static file serving + SPA fallback
│   └── ssl/                    # SSL certificates (production)
│
├── monitoring/
│   ├── prometheus.yml          # Metrics collection configuration
│   └── grafana-dashboards/     # Grafana dashboard JSON
│
└── scripts/
    ├── deploy.sh               # Deployment script (Docker Swarm or K8s)
    ├── backup.sh               # Database backup script
    └── healthcheck.sh          # Health check endpoint wrapper
```

---

## Documentation Structure

```
docs/                           # Doc site (VitePress or custom)
├── src/
│   ├── content/                # Markdown documentation files
│   │   ├── introduction.md
│   │   ├── installation.md
│   │   ├── project-structure.md
│   │   ├── phases.md
│   │   ├── backend/
│   │   │   ├── api-reference.md
│   │   │   ├── authentication.md
│   │   │   ├── database.md
│   │   │   └── services.md
│   │   ├── frontend/
│   │   │   ├── design-system.md
│   │   │   ├── components.md
│   │   │   ├── hooks.md
│   │   │   └── features.md
│   │   ├── ai/
│   │   │   ├── agents.md
│   │   │   ├── tools.md
│   │   │   └── prompts.md
│   │   ├── development/
│   │   │   ├── testing.md
│   │   │   ├── ci-cd.md
│   │   │   └── contributing.md
│   │   └── reference/
│   │       ├── env-vars.md
│   │       └── deployment.md
│   └── components/            # Doc site React components
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Conventions Summary

### Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| **Backend files** | `kebab-case.{type}.ts` | `auth.service.ts`, `users.routes.ts` |
| **Frontend components** | `PascalCase.tsx` | `LoginForm.tsx`, `Button.tsx` |
| **Frontend non-components** | `kebab-case.ts` | `useAuth.ts`, `auth.store.ts` |
| **Database models** | `snake_case` (singular) | `user`, `organization`, `team_member` |
| **API endpoints** | `kebab-case` plural | `/api/v1/users`, `/api/v1/organizations` |
| **Database columns** | `snake_case` | `created_at`, `first_name`, `organization_id` |
| **JavaScript/TypeScript** | `camelCase` | `createUser()`, `isActive` |
| **CSS classes** | Tailwind utility only | — |
| **Environment variables** | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |
| **Git branches** | `kebab-case` | `feat/user-invite`, `fix/login-error` |

### Code Organization Principles

1. **Folder by feature, not by type** — Files that change together live together
2. **One file, one responsibility** — A controller file does not contain services
3. **Barrel exports** — Every module has an `index.ts` that exports its public API
4. **Explicit imports** — No deep imports across feature boundaries; use the barrel export
5. **Shared types go in `types/`** — Types used across features are hoisted up; local types stay in the feature
6. **Design system is immutable** — DS components accept props but do not import from feature modules
7. **API layer is the only communication channel** — Frontend features never import backend code directly

### Directory Relationship Map

```
Frontend Feature (e.g., users/)
    └── calls → lib/api.ts → HTTP → Backend Route
                                              └── Controller
                                                    └── Service
                                                          └── Prisma Client
                                                                └── PostgreSQL
```

---

## Next Steps

- **[Development Phases](/docs/phases)** — Follow the phased implementation guide
- **[Installation](/docs/installation)** — Set up the project locally
- **Backend API Reference** — Explore endpoint specifications
- **Frontend Design System** — Browse available components
