# Source Mapping

Every framework pattern traced to its origin in `Product/`. Nothing in `Framework/` was invented.

---

## Backend

| Framework file | Source in Product/ | Notes |
|---|---|---|
| `backend/package.json` | `Product/backend/package.json` | Name changed; same deps |
| `backend/.env.example` | `Product/backend/` (env vars across config/middleware) | Generalized; product-specific provider vars removed |
| `backend/server.js` | `Product/backend/server.js` | Product-specific crons, webhook pre-mount, and product name removed |
| `backend/worker.js` | `Product/backend/worker.js` | Product-specific handler registrations removed |
| `backend/ecosystem.config.js` | `Product/backend/ecosystem.config.js` | Process names replaced with `APP_NAME` placeholder |
| `backend/config/dbConnect.js` | `Product/backend/config/dbConnect.js` | Direct extraction |
| `backend/config/redisConfig.js` | `Product/backend/config/redisConfig.js` | Direct extraction |
| `backend/config/s3.js` | `Product/backend/config/s3.js` | Direct extraction |
| `backend/config/cloudinary.js` | `Product/backend/config/cloudinary.js` | Direct extraction |
| `backend/globals/response.json` | `Product/backend/globals/response.json` | Direct extraction |
| `backend/helpers/apiResponse.js` | `Product/backend/helpers/apiResponse.js` | Direct extraction |
| `backend/helpers/paginate.js` | `Product/backend/helpers/paginate.js` | Direct extraction |
| `backend/helpers/auditLogger.js` | `Product/backend/helpers/auditLogger.js` | Domain-scoped field removed; `extra` spread param added |
| `backend/helpers/generateToken.js` | `Product/backend/helpers/generateToken.js` | Domain-specific JWT claims removed from base; `extraClaims` param added |
| `backend/helpers/queue/jobQueue.js` | `Product/backend/helpers/queue/jobQueue.js` | Direct extraction |
| `backend/middleware/verifyToken.js` | `Product/backend/middleware/verifyToken.js` | Product-specific role-elevation grant check removed |
| `backend/middleware/role.js` | `Product/backend/middleware/role.js` | Direct extraction |
| `backend/middleware/accessLevel.js` | `Product/backend/middleware/accessLevel.js` | Hardcoded role name removed; `readOnlyRoles` parameter added |
| `backend/middleware/rateLimit.js` | `Product/backend/middleware/rateLimit.js` | Refactored into `createLimiter()` factory; same pre-built limiters |
| `backend/middleware/upload.js` | `Product/backend/middleware/upload.js` | Direct extraction |
| `backend/routes/index.js` | `Product/backend/routes/index.js` | Product module mounts removed; auth mount retained as example |
| `backend/modules/auth/routes/authRoutes.js` | `Product/backend/modules/auth/routes/authRoutes.js` | Product-specific persona-switch routes removed |
| `backend/modules/auth/services/AuthService.js` | `Product/backend/modules/auth/services/AuthService.js` + `ForgotPasswordService.js` | Domain-specific validation, entity-relationship fetching, and role-branching removed |
| `backend/jobs/_stub.js` | `Product/backend/jobs/` (all cron files) | Structural pattern only; no business logic |
| `backend/workers/_stub.js` | `Product/backend/workers/` (all worker handlers) | Structural pattern only; no business logic |
| `backend/prisma/schema.prisma` | `Product/backend/prisma/schema.prisma` | Only `User`, `RefreshToken`, `AuditLog` extracted; all domain models omitted |
| `backend/scripts/generateModule.js` | `Product/backend/scripts/generateModule.js` | Direct extraction (already generic) |
| `backend/scripts/generateModel.js` | `Product/backend/scripts/generateModel.js` | Direct extraction (already generic) |
| `backend/scripts/generateMigration.js` | `Product/backend/scripts/generateMigration.js` | Direct extraction |
| `backend/scripts/deployMigration.js` | `Product/backend/scripts/deployMigration.js` | Direct extraction |

---

## Frontend

| Framework file | Source in Product/ | Notes |
|---|---|---|
| `frontend/package.json` | `Product/frontend/package.json` | Name changed; same deps |
| `frontend/vite.config.js` | `Product/frontend/vite.config.js` | Direct extraction |
| `frontend/eslint.config.js` | `Product/frontend/eslint.config.js` | Direct extraction |
| `frontend/index.html` | `Product/frontend/index.html` | Product branding script and favicon removed; OG placeholders retained |
| `frontend/src/main.jsx` | `Product/frontend/src/main.jsx` | Direct extraction |
| `frontend/src/App.jsx` | `Product/frontend/src/App.jsx` | All product page imports and route definitions removed; shell structure retained |
| `frontend/src/index.css` | `Product/frontend/src/index.css` | Tailwind import only |
| `frontend/src/components/PrivateRoute.jsx` | `Product/frontend/src/components/PrivateRoute.jsx` | Direct extraction |
| `frontend/src/components/MainLayout.jsx` | `Product/frontend/src/components/MainLayout.jsx` | Product nav items, domain-specific components, and context-switch UI removed |
| `frontend/src/components/MobileLayout.jsx` | `Product/frontend/src/components/MobileLayout.jsx` | Product nav items removed |
| `frontend/src/components/common/` (17 files) | `Product/frontend/src/components/common/` | Direct copy for all generic UI primitives |
| `frontend/src/components/common/index.js` | `Product/frontend/src/components/common/index.js` | Product-specific component exports removed |
| `frontend/src/contexts/AuthContext.jsx` | `Product/frontend/src/contexts/AuthContext.jsx` | Domain-specific state, entity relationships, and role context switching removed |
| `frontend/src/server/api.js` | `Product/frontend/src/server/api.js` | Product-specific constants and all domain method namespaces removed |
| `frontend/src/utils/subdomain.js` | `Product/frontend/src/utils/subdomain.js` | Direct extraction |
| `frontend/src/hooks/useDataFetch.js` | Pattern across `Product/frontend/src/hooks/` and inline page fetches | Generalized into a standalone reusable hook |
| `frontend/src/pages/_stub.jsx` | Pattern across all product pages | Structural template only; no business logic |

---

## Explicitly NOT Extracted

| What | Why not extracted |
|---|---|
| All feature modules | Business logic specific to the product's domain |
| Cron job implementations | Product-specific scheduling logic |
| Worker handler implementations | Product-specific job business logic |
| Frontend page components | Product-specific UI and domain logic |
| Email templates | Product-branded HTML and domain-specific content |
| SMS/WhatsApp helper implementations | Product-specific notification triggers and provider config |
| S3 helper, signed URLs, storage quota | Domain-specific storage model |
| PDF generation helpers | Domain-specific document templates |
| Payment client + OAuth onboarding | Payment provider's partner-onboarding business logic |
| Product-specific role-elevation personas | Product domain — exam management role switching |
| Domain models (50+) | All product-specific database entities |
| Domain-specific globals | Domain configuration data |
| Domain-specific React contexts | Product-specific state domains |
| Demo login system | Product-specific demo infrastructure |
| Product-specific UI components | Domain-specific UI (chatbot, child switcher, hierarchy selectors, etc.) |
| WebSocket live feature server | Product-specific real-time feature |

---

## Open Questions / Gaps

A human decision is needed on each before the framework can be considered complete for the relevant capability.

| # | Gap | What to decide |
|---|-----|----------------|
| 1 | **Node.js version** | No `engines` field or `.nvmrc` in `Product/`. Confirm the Node version in production and pin it in `framework/backend/package.json`. |
| 2 | **Rate limit store in cluster mode** | `express-rate-limit` uses in-memory store. With PM2 `instances: "max"`, each worker has its own counter. Decide whether to add a Redis-backed store (e.g. `rate-limit-redis`) for shared limits. |
| 3 | **Input validation library** | All validation in `Product/` is manual inline checks. No Zod/Joi/express-validator used. Decide whether to introduce a schema-level validation library for future products. |
| 4 | **Centralized error handler** | `Product/` catches errors per handler — no Express error boundary. Decide whether to introduce a centralized `app.use((err, req, res, next) => {...})` middleware. |
| 5 | **Prisma Accelerate** | `@prisma/extension-accelerate` is installed in `Product/` but not visibly activated in `dbConnect.js`. Confirm whether it is used in production and whether to wire it into the framework. |
| 6 | **Cloudinary vs S3 routing** | Both are configured in `Product/` but which asset types go to each provider was not determinable from code. Document the routing rule and encode it in a storage helper. |
| 7 | **WebSocket job progress bridge** | `Product/backend/helpers/queue/jobWsServer.js` is generic infrastructure that pairs with the job queue. It was not extracted because it depends on the JWT shape. Decide whether to extract it into the framework. |
| 8 | **Email transport helper** | The SES transport is a framework concern; the templates are product-specific. Decide whether to add a bare email transport helper (no templates) to the framework. |
| 9 | **Structured logging** | `Product/` uses `console.log/error` only. Decide whether to introduce a structured logging library (Winston/Pino) as a framework standard. |
| 10 | **Testing framework** | `Product/` has no tests. Decide on a testing strategy and configure it in the framework before shipping products that require coverage. |
| 11 | **Code formatter** | `Product/` has ESLint but no Prettier. Decide whether to add a formatter and which config to standardize on. |
| 12 | **`prisma.config.ts`** | `Product/backend/prisma.config.ts` was not read. Confirm whether it contains runtime configuration that should carry into the framework's Prisma setup. |
| 13 | **Docker / Nginx config** | `Product/` has dockerfiles and `nginx.conf` in both frontend and backend. Not extracted because they require product-specific domain names and cert paths. Extract and parameterize if the framework should include deployment config. |
| 14 | **API documentation generator** | `Product/backend/scripts/generatePostman.js` generates Postman docs from route files. Not extracted because its conventions may be product-specific. Confirm whether to include it. |
