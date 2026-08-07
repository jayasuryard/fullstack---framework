# Introduction to RyoFramework

RyoFramework is an **AI-first production Ryo Framework** built by RyoForge. It provides a complete, opinionated foundation for building modern SaaS applications with integrated AI capabilities, multi-tenant architecture, and production-grade infrastructure out of the box.

---

## Vision

To make AI-powered SaaS development radically efficient by providing a unified platform that handles the complexity of modern full-stack applications — from authentication and billing to AI integration and deployment — so teams can focus on building their unique product value instead of reinventing infrastructure.

## Philosophy

RyoFramework is built on the belief that the next generation of SaaS applications will be **AI-native by default**, not AI-added as an afterthought. Every architectural decision — from the data layer to the API surface to the UI components — is designed with AI workflows as a first-class citizen.

## Core Principles

| Principle | Description |
|---|---|
| **AI-First** | AI capabilities are not plugins; they are embedded into the framework core. Every endpoint, hook, and component is AI-aware. |
| **Convention over Configuration** | Sensible defaults get you running in minutes. Override only what matters for your product. |
| **Production by Default** | Security, logging, error handling, and monitoring are baked in, not bolted on. |
| **Batteries Included** | Auth, billing, teams, organizations, file uploads, search, audit logs, notifications — all ship ready to use. |
| **Type Safety End-to-End** | From the database schema (Prisma) to the frontend (TypeScript), types flow through the entire stack. |
| **Single Codebase, Multiple Environments** | One repo, one set of configurations, deploy to development, staging, or production with environment variables. |

---

## Why RyoFramework Exists

Building a production SaaS application requires solving the same hard problems every time:

- User authentication with JWT, OAuth, and role-based access control
- Multi-tenant data isolation for teams and organizations
- Billing and subscription management with usage metering
- Email and push notification delivery
- File upload, processing, and storage
- Full-text search across application data
- Audit logging for compliance and security
- Admin dashboards for customer management

RyoFramework solves all of these — plus provides an **AI integration layer** using GROQ — so you ship faster with fewer bugs and a consistent architecture.

## Framework Goals

1. **Reduce SaaS time-to-market** by 80% compared to building from scratch
2. **Provide a single, coherent developer experience** across the entire stack
3. **Make AI integration trivial** with pre-built agents, tools, and streaming hooks
4. **Enforce security and data isolation** by default in every layer
5. **Scale from prototype to production** without rewrites

## Target Audience

- **Startups** building their first SaaS product who need to move fast
- **Engineering teams** looking for a consistent internal platform for multiple SaaS products
- **Indie developers** who want production quality without a DevOps team
- **Agencies** building custom SaaS solutions for clients

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js 24** | Runtime — latest LTS with native ESM support |
| **Express** | HTTP server and API routing |
| **Prisma ORM** | Database schema, migrations, and type-safe queries |
| **PostgreSQL** | Primary database |
| **Redis** | Caching, session store, job queues |
| **JWT + OAuth** | Authentication (Access + Refresh token pattern) |
| **RBAC** | Role-based access control with fine-grained permissions |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **TailwindCSS** | Utility-first styling with design system tokens |
| **TypeScript** | Type safety across the entire frontend |
| **React Router** | Client-side routing |
| **React Hook Form** | Form state management |
| **TanStack Query** | Server state and caching |
| **Zustand** | Client state management |

### AI Layer

| Technology | Purpose |
|---|---|
| **GROQ** | AI inference for chat, completion, and function calling |
| **AI SDK (Vercel)** | Streaming, tool calling, and agent orchestration |
| **LangChain** | Complex agent workflows and RAG pipelines |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Local development and containerized deployment |
| **Docker Compose** | Multi-service orchestration (app, db, redis, queue) |
| **Nginx** | Reverse proxy and SSL termination |
| **GitHub Actions** | CI/CD pipelines |

---

## Design Principles

### API Design

- RESTful endpoints with consistent URL patterns (`/api/v1/{resource}`)
- JSON responses with `{ data, meta, error }` envelope
- Pagination, filtering, and sorting via query parameters
- Idempotency keys for mutation endpoints
- Rate limiting per user and per IP

### Database Design

- Prisma schema as the single source of truth
- Soft deletes on all entities (`deletedAt` field)
- Organization-level data isolation via `organizationId` on every table
- Audit triggers on all mutation tables
- Migration-first workflow (no raw SQL migrations)

### UI Design

- Design system with CSS custom properties matching Tailwind theme
- Responsive by default (mobile-first)
- Dark mode support with `class` strategy
- Accessibility-first (WCAG 2.1 AA minimum)
- Loading states, empty states, error boundaries everywhere

### AI Design

- Agent-based architecture with tool calling
- Streaming responses for real-time UX
- Fallback chains for reliability
- Prompt versioning stored alongside code
- Usage tracking per user and per organization

---

## Documentation Structure

- **[Installation](/docs/installation)** — Get up and running locally
- **[Project Structure](/docs/project-structure)** — Understand the codebase layout
- **[Development Phases](/docs/phases)** — Step-by-step build guide
- **Backend** — API reference, middleware, services, and database schemas
- **Frontend** — Components, hooks, design system, and feature modules
- **AI** — Agent architecture, tool definitions, and prompt management
- **Development** — Testing, CI/CD, environment management
- **Reference** — Configuration, environment variables, and deployment guides

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ryoforge/ryo-framework.git
cd ryo-framework

# Follow the installation guide
# => See /docs/installation for full instructions
```

RyoFramework is MIT licensed. Built with care by [RyoForge](https://ryoforge.dev).
