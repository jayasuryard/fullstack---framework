# Development Rules & Conventions

## Language Convention

| Layer | Language | Module System | Enforcement |
|---|---|---|---|
| **Frontend** | TypeScript (`.ts`, `.tsx`) | ESM (`import`/`export`) | `tsc -b` builds |
| **Backend** | JavaScript (`.js`) | ESM (`import`/`export`, `"type": "module"`) | ESLint |
| **Database** | Prisma Schema (`.prisma`) | — | `prisma validate` |
| **Config** | JavaScript (`.js`, `.ts`) | Varies by context | — |

The frontend uses TypeScript throughout for type safety. The backend uses JavaScript with ESM — Prisma's auto-generated client provides type-safe database access even in JS.

## File Naming Conventions

### Frontend

| Asset Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth.tsx`, `useBreakpoint.ts` |
| Utilities | camelCase | `utils.ts`, `formatDate.ts` |
| Design tokens | camelCase | `colors.js`, `typography.js` |
| Styles | Tailwind only (no CSS files) | — |

### Backend

| Asset Type | Convention | Example |
|---|---|---|
| Routes | kebab-case, plural | `auth.js`, `emailVerification.js` |
| Controllers | camelCase, `Controller` suffix | `authController.js` |
| Services | camelCase, `Service` suffix in file | `authService.js` |
| Middleware | camelCase | `auth.js`, `errorHandler.js` |
| Validators | camelCase (same as route) | `auth.js` |
| Utilities | camelCase | `tokens.js`, `helpers.js` |
| Config | camelCase | `index.js`, `database.js`, `passport.js` |

### Database

| Asset Type | Convention | Example |
|---|---|---|
| Models | PascalCase, singular | `User`, `RefreshToken`, `OrganizationMember` |
| Fields | camelCase | `firstName`, `lastLoginAt`, `emailVerifiedAt` |
| Enums | PascalCase | `UserRole`, `UserStatus` |
| Enum values | UPPER_SNAKE_CASE | `SUPER_ADMIN`, `EMAIL_VERIFICATION` |
| Relations | Plural for `hasMany`, singular for `hasOne` | `sessions`, `refreshTokens` |
| Indexes | Named by field pattern | `@@index([userId, read])` |

### General

| Asset | Convention | Example |
|---|---|---|
| Directories | kebab-case | `notification-prefs`, `data-display` |
| Scripts | kebab-case | `db:migrate`, `db:generate` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |
| API paths | kebab-case, plural | `/api/audit-logs`, `/api/email-verification` |

## Code Style

### Backend (JavaScript)

```js
// Use ESM imports
import express from 'express';
import { ApiError } from '../utils/ApiError.js';

// Always include .js extension in imports
// Use named exports for functions
export async function login(req, res, next) {
  try {
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

// Use arrow functions for callbacks
const router = Router();
router.post('/login', validate(schema), controller.login);
```

### Frontend (TypeScript)

```tsx
// Use TypeScript — define interfaces for all props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

// Use React.forwardRef for reusable components
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, ...props }, ref) => {
    // implementation
  }
);
Button.displayName = 'Button';

// Use @ alias for imports
import { cn } from '@/design-system/utils';
import { useAuth } from '@/hooks/useAuth';
```

### General Rules

- **2-space indentation** throughout
- **Semicolons** required
- **Single quotes** for strings (JS/TS)
- **No default exports** — prefer named exports (except `app.js` → `export default app`)
- **Trailing commas** in multiline objects/arrays
- **Max line length**: 120 characters
- **Curly braces** for all control flow, even single-line

## Component Structure Rules

### Component File Template

```tsx
import React from 'react';
import { cn } from '@/design-system/utils';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName = React.forwardRef<HTMLElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        {children}
      </div>
    );
  }
);
ComponentName.displayName = 'ComponentName';
```

### Rules

1. **One component per file** (except tightly coupled composites like `Select` + `SelectItem`)
2. **Export from barrel** (`index.ts`) for public API
3. **Props interface** named `{ComponentName}Props`
4. **`React.forwardRef`** for all interactive components
5. **`className` prop** accepted and merged via `cn()`
6. **Spreading props** on the root element for native HTML attributes
7. **displayName** set after component definition
8. **Data fetching** lives in feature pages/features, not in design system components
9. **State management** via hooks — components should be controlled where possible

### Design System Components: Boundaries

Design system components in `src/design-system/components/` must:
- Be **presentational** — no API calls, no business logic
- Accept **className** for customization
- Support **dark mode** via Tailwind `dark:` variants
- Be **keyboard accessible** (use Radix primitives for complex interactions)
- Handle **disabled**, **loading**, and **empty** states

Feature components in `src/features/` may:
- Use hooks (`useAuth`, `useQuery`, etc.)
- Import design system primitives
- Handle business logic and data fetching

## API Endpoint Conventions

### URL Structure

```
/api/{resource}              # Collection
/api/{resource}/{id}         # Single resource
/api/{resource}/{id}/sub     # Nested resource
```

### HTTP Methods

| Method | Action | Convention |
|---|---|---|
| `GET` | List / Retrieve | No side effects; query params for filter/sort/paginate |
| `POST` | Create | Returns 201 with created resource |
| `PUT` | Full update | Replaces entire resource |
| `PATCH` | Partial update | Updates only provided fields |
| `DELETE` | Remove | Returns 200/204 |

### Response Format

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "message": "Resource created", "data": { "id": "uuid" } }

// Error
{ "success": false, "message": "Validation failed", "details": [...] }
```

### Naming Conventions

- **Resources**: plural nouns (`/api/users`, `/api/audit-logs`)
- **Multi-word**: kebab-case (`/api/email-verification`, `/api/notification-preferences`)
- **Query params**: camelCase (`?page=1&limit=20&sortBy=createdAt&sortOrder=desc`)
- **Request body**: camelCase (`{ firstName, lastName, email }`)

### Error Response Codes

| Code | When |
|---|---|
| 400 | Validation failure (invalid input) |
| 401 | Missing or expired authentication |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Unexpected server error |

## Database Naming Conventions

### Tables (Models)

```prisma
model User {}              // PascalCase, singular
model RefreshToken {}      // Compound name, PascalCase
model OrganizationMember {} // Join table, descriptive name
model EmailVerificationToken {} // Purpose-specific
```

### Columns (Fields)

| Pattern | Example |
|---|---|
| Regular fields | `firstName`, `email`, `password` |
| Foreign keys | `userId`, `organizationId` (camelCase of related model + `Id`) |
| Timestamps | `createdAt`, `updatedAt`, `deletedAt`, `lastLoginAt`, `emailVerifiedAt` |
| Status flags | `active`, `revoked`, `isDefault`, `isSystem`, `twoFactorEnabled` |
| Soft delete | `deletedAt` (nullable DateTime, not boolean) |
| Social IDs | `googleId`, `facebookId`, `appleId`, `microsoftId`, `twitterId` |

### Indexes

```prisma
@@index([field])              // Single field
@@index([field1, field2])     // Composite
@@unique([field1, field2])    // Unique composite
```

### Conventions

- Every table has a **UUID primary key** named `id`
- Every table has `createdAt` and `updatedAt` timestamps
- Soft-deletable tables have `deletedAt` (nullable)
- Foreign keys follow the pattern `{relatedModel}CamelCaseId`
- Composite unique constraints for join tables: `@@unique([orgId, userId])`
- Indexes created for all foreign keys and common query patterns
- JSON columns for flexible/configuration data (`settings`, `features`, `limits`, `metadata`)

## Git Workflow

### Branch Naming

| Pattern | Example |
|---|---|
| `feat/{description}` | `feat/user-invitations` |
| `fix/{description}` | `fix/login-error-handling` |
| `chore/{description}` | `chore/update-dependencies` |
| `docs/{description}` | `docs/architecture-diagram` |
| `refactor/{description}` | `refactor/auth-middleware` |

### Commit Messages

```
type(scope): concise description

- Use conventional commits format
- Type: feat, fix, chore, docs, refactor, style, test
- Scope: frontend, backend, api, db, design-system, docs
- Description: imperative mood, no period
- Body (optional): bullet points for details
```

Examples:
```
feat(api): add email verification endpoint
fix(frontend): resolve OAuth redirect loop
chore(backend): upgrade prisma to v6
docs(architecture): add request lifecycle diagram
```

### Workflow

1. Branch from `main`
2. Make changes in feature branch
3. Keep commits small and focused
4. Run lint and type-check before committing
5. Open PR with description of changes
6. Squash merge to `main` on approval
7. Delete feature branch after merge

## Code Review Guidelines

### What Reviewers Check

| Category | Checklist Item |
|---|---|
| **Correctness** | Does the code do what it claims? Are edge cases handled? |
| **Security** | Are inputs validated? Is auth enforced? Are secrets exposed? |
| **Performance** | Are N+1 queries avoided? Are paginated queries efficient? |
| **Consistency** | Does it follow the conventions in this document? |
| **Error handling** | Are errors caught and propagated properly via `ApiError`? |
| **Types** | Are TypeScript types correct and not using `any`? |
| **Imports** | Are unused imports removed? Are barrel exports used correctly? |
| **Testing** | Are there tests for new functionality? |
| **Documentation** | Are APIs documented? Are complex decisions explained? |

### What Reviewers Don't Check

- Code style (enforced by ESLint/Prettier)
- Spelling/grammar in minor comments
- Personal preferences that don't affect correctness

### PR Requirements

- PR must pass CI (lint, type-check, tests)
- PR must have a clear description of what and why
- PR should be smaller than 500 lines when possible
- Reviewer should respond within 24 hours

## Documentation Requirements

### What Must Be Documented

- **All API endpoints**: method, path, request body, response format, auth requirement
- **All exported components**: props, variants, usage example
- **Architecture decisions**: ADRs for significant technical choices
- **Environment variables**: name, purpose, required/optional
- **Database models**: schema changes in PR descriptions

### Documentation Standards

- Docs live in `ryo-docs/src/content/` organized by category
- Use **Markdown** with Mermaid diagrams where helpful
- Keep docs up to date with code changes
- Include code examples for API usage and component usage

## Testing Requirements

### Testing Philosophy

- **Integration over unit** for backend (test request → response)
- **Component testing** for frontend (render → interaction → assertion)
- **Critical paths** must be tested (auth, billing, data access)

### What to Test

| Layer | What | Tool |
|---|---|---|
| **Backend API** | Endpoint responses, validation, auth enforcement | Vitest + supertest |
| **Backend services** | Business logic, edge cases | Vitest |
| **Frontend components** | Render, user interactions, states | Vitest + Testing Library |
| **Hooks** | State changes, side effects | Vitest + renderHook |

### Testing Conventions

- Test files co-located with source: `authService.test.js` next to `authService.js`
- Use `describe`/`it` blocks with descriptive names
- Mock external services (Prisma, email, S3) in unit tests
- Test happy path and error cases
- Avoid testing implementation details — test behavior

### Minimum Coverage Requirements

- Backend services: 80% line coverage
- Backend controllers: 70% line coverage
- Frontend components: 70% line coverage
- Critical paths (auth, billing): 90% coverage

## Backend Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Development seed data
├── src/
│   ├── server.js              # Entry point: DB connect + listen
│   ├── app.js                 # Express app setup + middleware
│   ├── config/
│   │   ├── index.js           # Environment config
│   │   ├── database.js        # Prisma client singleton
│   │   └── passport.js        # OAuth strategy configuration
│   ├── routes/                # Route definitions
│   ├── controllers/           # Request/response handling
│   ├── services/              # Business logic
│   ├── middleware/            # Express middleware
│   ├── validators/            # Zod schemas
│   ├── utils/                 # Shared utilities
│   └── ai/                    # AI integration
├── package.json
└── .env
```

## Frontend Project Structure

```
frontend/
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Router + route definitions
│   ├── design-system/
│   │   ├── index.ts           # Public API barrel
│   │   ├── tokens/            # Design tokens (colors, typography, etc.)
│   │   ├── components/        # UI, layout, form, data-display components
│   │   ├── providers/         # ThemeProvider
│   │   ├── animations/        # GSAP + Lenis
│   │   ├── hooks/             # Shared hooks
│   │   └── utils/             # cn() utility
│   ├── features/              # Feature-specific pages
│   ├── hooks/                 # App-level hooks (useAuth)
│   └── lib/                   # Third-party configurations
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Rules Summary

```
DO:                                                                  DON'T:
├── Named exports everywhere                                         ├── Default exports (with exceptions)
├── .js extension in backend imports                                 ├── Omitting file extensions
├── TypeScript on frontend                                           ├── JavaScript on frontend
├── Zod validation on all API inputs                                 ├── Trusting raw req.body
├── Centralized error handling via next(error)                       ├── try/catch with res.status().json()
├── Service layer for business logic                                 ├── Business logic in controllers
├── Soft deletes (deletedAt) instead of hard deletes                 ├── DELETE FROM table
├── UUID primary keys                                                ├── Auto-increment integers
├── Prisma for all DB access                                         ├── Raw SQL queries
├── Radix UI primitives for complex interactions                     ├── Building custom ARIA patterns
├── Tailwind dark: prefix for dark mode                              ├── Separate dark mode CSS files
├── cn() utility for class merging                                   ├── Template literal class strings
├── GSAP for rich animations                                         ├── CSS animations for complex sequences
├── Access tokens in memory, refresh tokens rotated                  ├── Storing tokens in localStorage
├── Kebab-case for API paths and directories                         ├── snake_case or camelCase for URLs
└── Conventional commits                                             └── Vague commit messages
```
