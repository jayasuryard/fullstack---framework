# Architecture Decision Records

This document captures key architectural decisions made during the development of RyoFramework, following the ADR (Architecture Decision Record) format.

## ADR-001: JavaScript Backend Instead of TypeScript

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Choosing the language for the backend API layer. The alternative was TypeScript, which is used in the frontend.

**Decision:** Use JavaScript (ES modules) for the backend, TypeScript for the frontend.

**Rationale:**
- **Lower barrier to entry**: JavaScript is more accessible to a wider range of developers, especially those new to full-stack development.
- **Faster iteration**: No compilation step means faster development cycles. Changes are immediately visible with Node.js's `--watch` flag.
- **Reduced complexity**: No `tsconfig.json`, type definitions, or build tooling needed for the backend. Simplifies the project structure.
- **Framework simplicity**: RyoFramework targets rapid SaaS development — TypeScript adds ceremony without proportional benefit for the backend layer.
- **Frontend gets TypeScript**: Type safety is most valuable in the UI layer with complex component props and state management. The frontend uses TypeScript for this reason.
- **Prisma provides type safety**: Even without TypeScript, Prisma generates typed queries that provide IntelliSense and runtime validation.

**Consequences:**
- Backend code may have more runtime type errors compared to TypeScript
- Zod validation schemas serve as runtime type checking
- Developers must carefully handle null/undefined cases
- Future migration to TypeScript is possible if needed

## ADR-002: Prisma ORM

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** Choosing an ORM for database access. Candidates included Prisma, Drizzle ORM, TypeORM, Knex.js, and raw SQL.

**Decision:** Use Prisma ORM with PostgreSQL.

**Rationale:**
- **Declarative schema**: Prisma's schema file is the single source of truth for the database schema, migrations, and client types.
- **Type-safe client**: Automatic client generation with full IntelliSense support, even in JavaScript.
- **Migration system**: Built-in migration workflow with both development (`migrate dev`) and production (`migrate deploy`) commands.
- **Complex relations**: Excellent support for nested creates, updates, and eager loading with `include`.
- **Rich ecosystem**: Prisma Studio for data browsing, excellent documentation, and active community.
- **PostgreSQL support**: Full PostgreSQL feature support including enums, JSON, arrays, and indexes.

**Consequences:**
- Performance overhead compared to raw SQL for complex queries
- Learning curve for Prisma-specific query patterns
- Raw queries needed for some advanced PostgreSQL features
- Dependency on Prisma's migration generation accuracy

## ADR-003: Passport.js for OAuth

**Status:** Accepted  
**Date:** 2026-06-18  
**Context:** Choosing an OAuth authentication library. Candidates included Passport.js, NextAuth.js, and custom OAuth implementation.

**Decision:** Use Passport.js for OAuth integration.

**Rationale:**
- **500+ strategies**: Passport supports virtually every OAuth provider, including Google, Facebook, Apple, Microsoft, and Twitter.
- **Mature and proven**: Passport.js is the most widely used authentication middleware in the Node.js ecosystem with years of production use.
- **Consistent API**: Regardless of the provider, the integration follows the same pattern — strategy definition, callback handling, user serialization.
- **Flexibility**: Unlike NextAuth.js (tightly coupled to Next.js), Passport works with any Express.js application.
- **Community support**: Extensive documentation, tutorials, and community packages available.

**Consequences:**
- Passport.js API can feel dated compared to newer libraries
- Manual session serialization/deserialization required
- No built-in token management — JWT implementation is separate
- Each provider requires manual credential management

## ADR-004: Radix UI for Primitives

**Status:** Accepted  
**Date:** 2026-06-20  
**Context:** Choosing a component library for the frontend. Alternatives included MUI, Ant Design, Chakra UI, Headless UI, and shadcn/ui.

**Decision:** Use Radix UI primitives.

**Rationale:**
- **Accessibility**: Radix components are built with WAI-ARIA compliance, keyboard navigation, and screen reader support out of the box.
- **Unstyled**: Unlike MUI or Ant Design, Radix provides behavior without imposing visual design. Full control over styling with Tailwind CSS.
- **Composition over configuration**: Components follow React's composition model, making customization natural and predictable.
- **Shadcn/ui compatibility**: Radix is the foundation for shadcn/ui, which provides beautifully styled components built on Radix primitives.
- **Tree-shakeable**: Import only the primitives you need — no global CSS or unnecessary bundle bloat.

**Consequences:**
- More work to style components compared to full-featured libraries
- No built-in data grid, date picker, or advanced form components
- Need to compose multiple primitives for complex UI patterns
- Requires understanding of accessibility patterns

## ADR-005: Token-Driven Design

**Status:** Accepted  
**Date:** 2026-06-17  
**Context:** Designing the authentication and session management system.

**Decision:** Use JWT-based token authentication with short-lived access tokens and refresh token rotation.

**Rationale:**
- **Stateless API**: Access tokens enable stateless API validation — no server-side session store needed. Simplifies horizontal scaling.
- **Short-lived access tokens**: 15-minute expiry limits damage from token theft.
- **Refresh token rotation**: Each token refresh invalidates the previous refresh token. Detects token theft (reused revoked token triggers full revocation).
- **No cookie dependency**: Tokens are sent via `Authorization: Bearer` header, avoiding CSRF vulnerabilities inherent in cookie-based auth.
- **Separate secrets**: Access and refresh tokens use different secrets (`JWT_SECRET` vs `REFRESH_TOKEN_SECRET`), providing defense in depth.
- **Database-persisted refresh tokens**: Revocation is enforced at the database level, not just JWT expiry.

**Consequences:**
- Clients must handle token refresh logic (interceptor pattern)
- Token storage requires careful consideration (memory, HTTP-only cookies, or secure storage)
- Revoked tokens require database lookup on refresh
- All tokens invalidated on password change

## ADR-006: Layered Architecture

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Designing the backend application structure.

**Decision:** Use a layered architecture with Routes → Controllers → Services → Data (Prisma).

**Rationale:**
- **Separation of concerns**: Each layer has a distinct responsibility:
  - **Routes**: Define HTTP methods, paths, and middleware chains
  - **Controllers**: Handle HTTP request/response parsing, call services, format responses
  - **Services**: Implement business logic, orchestrate multiple data operations
  - **Prisma**: Data access layer (managed by Prisma ORM)
- **Testability**: Services can be unit-tested in isolation. Controllers can be integration-tested with mocked services.
- **Maintainability**: Changes to business logic only affect services. Changes to API structure only affect routes and controllers.
- **Middleware separation**: Auth, validation, error handling, and audit logging are separate middleware functions.
- **Consistent patterns**: Every resource follows the same structure, making the codebase predictable.

**Consequences:**
- More files and boilerplate compared to a flat structure
- Service-to-service calls for complex operations
- May feel verbose for simple CRUD operations
- Requires discipline to maintain layer boundaries

## ADR-007: PostgreSQL with UUID Primary Keys

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** Choosing the database and primary key strategy.

**Decision:** Use PostgreSQL 16 with UUID primary keys for all models.

**Rationale:**
- **Distributed-friendly**: UUIDs can be generated client-side or in distributed systems without collision.
- **No enumeration**: Unlike auto-increment IDs, UUIDs don't expose record count or enable sequential scraping.
- **Merge-friendly**: UUIDs don't conflict when merging databases from different environments.
- **PostgreSQL performance**: With proper indexing, UUID performance is acceptable for SaaS-scale applications.
- **Database as a platform**: PostgreSQL's JSON, full-text search, and extension ecosystem (pgvector for future AI features).

**Consequences:**
- UUIDs are larger than integer IDs (16 bytes vs 4-8 bytes)
- Index performance can be lower than auto-increment integers for very large tables
- More verbose in URLs and API responses
- Requires UUID generation on the client or application layer

## ADR-008: GROQ as Primary AI Provider

**Status:** Accepted  
**Date:** 2026-06-22  
**Context:** Choosing the AI inference provider for integrated AI features.

**Decision:** Use GROQ as the primary AI provider with a pluggable provider architecture.

**Rationale:**
- **Inference speed**: GROQ's LPU (Language Processing Unit) provides up to 10x faster inference than GPU-based alternatives. Critical for real-time streaming experiences.
- **Competitive pricing**: GROQ offers high-quality models at significantly lower costs than OpenAI.
- **Open models**: GROQ runs open-source models (Llama 3, Mixtral), avoiding vendor lock-in to proprietary model APIs.
- **Provider abstraction**: The `AIProvider` class makes it trivial to switch providers without changing any business logic.
- **Mock mode**: Built-in mock responses enable development without API keys, improving the onboarding experience.

**Consequences:**
- Limited to models available on GROQ platform
- No access to OpenAI's GPT-4 or Anthropic's Claude (until providers are added)
- GROQ availability and pricing may change
- Mock mode may hide integration issues until production

## ADR-009: Express.js with Native fetch

**Status:** Accepted  
**Date:** 2026-06-19  
**Context:** Choosing the HTTP framework and HTTP client.

**Decision:** Use Express.js for the HTTP server and native `fetch` for outgoing HTTP requests.

**Rationale:**
- **Express maturity**: Most stable and widely deployed Node.js HTTP framework. All middleware, debugging tools, and best practices are well-established.
- **No Axios needed**: Node.js 24's native `fetch` API is stable and sufficient for AI provider API calls. Removes an unnecessary dependency.
- **Minimal abstraction**: Express provides exactly the right level of abstraction — routing, middleware, and error handling — without dictating application structure.
- **Middleware ecosystem**: Helmet, CORS, compression, morgan, and rate-limit are all Express middleware with simple, composable APIs.

**Consequences:**
- Express request/response objects include some legacy API surface
- Native `fetch` requires manual response streaming handling
- No built-in request validation (handled by Zod)
- No built-in OpenAPI/Swagger support (added separately)

## ADR-010: Soft Deletes with Audit Trail

**Status:** Accepted  
**Date:** 2026-06-20  
**Context:** Designing the data deletion strategy.

**Decision:** Use soft deletes (via `deletedAt` timestamp) combined with a separate audit log system.

**Rationale:**
- **Data recovery**: Soft deletes allow data recovery within a window before permanent deletion.
- **Audit compliance**: Maintains a record of all data changes, including deletions, through audit logs.
- **Referential integrity**: Soft deletes maintain foreign key relationships that would break with hard deletes.
- **Selective exposure**: Queries filter `WHERE deletedAt IS NULL` for normal operations, with admin access to deleted data.
- **Legal compliance**: Supports GDPR "right to erasure" through actual deletion after a retention period.

**Consequences:**
- Every query must filter out soft-deleted records
- Additional storage for non-active records
- More complex `ON DELETE CASCADE` behavior (must be handled manually)
- Periodic cleanup jobs needed for actual deletion after retention period
