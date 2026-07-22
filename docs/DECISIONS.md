# Architecture Decisions

## ADR-001: JavaScript over TypeScript for Backend
**Date**: 2024-07-22
**Status**: Accepted
**Context**: The framework uses TypeScript for frontend but JavaScript for backend.
**Decision**: Use JavaScript (ESM) for Express backend to simplify development while maintaining strict coding standards via linting.
**Consequences**: Less type safety in backend, but faster development iteration. Frontend remains fully typed.

## ADR-002: Prisma ORM for Database
**Date**: 2024-07-22
**Status**: Accepted
**Context**: Need an ORM that supports PostgreSQL with migrations and type safety.
**Decision**: Use Prisma ORM for all database access.
**Consequences**: Schema-first approach, auto-generated client, easy migrations, no raw SQL.

## ADR-003: Module-Based Architecture
**Date**: 2024-07-22
**Status**: Accepted
**Context**: Framework needs to be extensible with reusable modules.
**Decision**: Organize code by domain module (auth, users, notifications, etc.)
**Consequences**: Clear separation of concerns, easy to add/remove modules, consistent patterns.

## ADR-004: Zod for Validation
**Date**: 2024-07-22
**Status**: Accepted
**Context**: Need runtime validation for API inputs.
**Decision**: Use Zod schemas with a validation middleware.
**Consequences**: Type-safe validation, clear error messages, shared schemas possible.

## ADR-005: JWT with Refresh Token Rotation
**Date**: 2024-07-22
**Status**: Accepted
**Context**: Need secure authentication with session management.
**Decision**: Short-lived JWT (15min) + long-lived refresh tokens (7d) with rotation.
**Consequences**: Better security profile, automatic re-authentication, token revocation support.
