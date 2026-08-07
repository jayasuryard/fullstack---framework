# Authorization

Two layers: **roles** (who) and **access levels** (read-only vs read-write). No RBAC table, no permission matrix — the framework ships with role-based guards plus a global read-only mode for sensitive environments.

## Roles

Roles are plain strings on the `User` model (`role` column). The framework ships with `admin`; the super admin script creates a user with role `admin` (configurable via `SUPER_ADMIN_SECRET`). Add roles by convention — a module simply names the roles it accepts.

Guard middleware: `backend/middleware/role.js`

```js
import { role } from '../middleware/role.js'

router.get('/reports', verifyToken, role('admin'), handler)
router.post('/reports', verifyToken, role('admin'), requireReadWrite(), handler)
```

`role(...roles)` — passes when `req.user.role` is in the list; otherwise `1003 FORBIDDEN`. Chain it **after** `verifyToken` (it needs `req.user`).

## Access Levels

The `User` model has an `accessLevel` field:

| Value | Meaning |
|-------|---------|
| `read_write` | default — full access |
| `read_only` | viewing only |

Middleware: `backend/middleware/accessLevel.js` → `requireReadWrite()`.

- On a `read_only` user, any mutating endpoint protected by `requireReadWrite()` returns `1003 FORBIDDEN`.
- Frontend: `useAuth().isReadOnly()` hides or disables edit controls.

Pattern for every mutating route:

```js
router.post('/resource', verifyToken, role('admin'), requireReadWrite(), validateBody(schema), handler)
```

Reads are protected by `verifyToken` + `role`; writes add `requireReadWrite()`.

## Request Chain

```
rateLimit → verifyToken → role(...) → requireReadWrite() → validateBody(schema) → handler
```

Order matters: rate limit first (cheap), auth before role (role needs req.user), validation last (business code sees clean data).

## Common Patterns

- **Admin-only module**: guard every route with `role('admin')`.
- **Read-only consumers**: same routes, users get `accessLevel: 'read_only'`; mutating endpoints reject automatically.
- **Multi-tenant**: `frontend/src/utils/subdomain.js` detects subdomain; backend reads the tenant from the request (e.g. subdomain or header) inside the service. Tenant scoping is product code — the framework provides the detection helper, not the enforcement.

## Frontend Guard

```jsx
<PrivateRoute allowedRoles={['admin']}>...</PrivateRoute>
```

`PrivateRoute` checks `useAuth()`; unauthenticated → redirect `/login`; wrong role → redirect to the role's default route.

## Adding a New Guard

Middleware is just a function: `(req, res, next) => { ... }` returning `response('FORBIDDEN', ...)` or calling `next()`. Keep it in `backend/middleware/`, export it, chain it.
