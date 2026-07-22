# Authorization

RyoFramework implements a dual-layer authorization system: **Role-Based Access Control (RBAC)** via the `authorize()` middleware and **granular permission checking** via the `can()` middleware.

---

## Role Hierarchy

There are 5 system roles defined as a `UserRole` enum:

| Role | Level | Description |
|---|---|---|
| `SUPER_ADMIN` | 5 | Full system access. Can manage admins, settings, and all resources. |
| `ADMIN` | 4 | Administrative access. Can manage users, organizations, and content. |
| `MANAGER` | 3 | Operational management. Can create, read, and update resources. |
| `MEMBER` | 2 | Standard user. Read access to most resources. |
| `VIEWER` | 1 | Read-only access. No mutation capabilities. |

The role is stored on the `User` model:

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

model User {
  // ...
  role UserRole @default(MEMBER)
}
```

---

## Authorization Middleware: `authorize(roles...)`

The role-based middleware at `src/middleware/auth.js`:

```js
import { authorize } from '../middleware/auth.js';

// Allow only ADMIN and SUPER_ADMIN
router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.listUsers);

// Allow only SUPER_ADMIN
router.delete('/users/:id', authenticate, authorize('SUPER_ADMIN'), userController.deleteUser);
```

**Behavior:**
- Checks `req.user.role` against the allowed roles list
- Returns `403 Forbidden` if the user's role is not in the allowed list
- Must be used **after** the `authenticate` middleware (which sets `req.user`)

### Route Protection Examples

```js
// User routes
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.listUsers);
router.get('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.getUser);
router.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), userController.deleteUser);

// Organization routes
router.post('/', authenticate, organizationController.create);           // any authenticated user
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), organizationController.remove);
router.post('/:id/invite', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), organizationController.invite);

// Admin routes
router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getDashboardStats);
router.get('/user-analytics', authenticate, authorize('SUPER_ADMIN'), adminController.getUserAnalytics);

// Settings routes
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), settingController.getSettings);
router.put('/:key', authenticate, authorize('SUPER_ADMIN'), settingController.updateSetting);

// Audit log routes
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), auditLogController.listAuditLogs);
```

---

## Granular Permission System: `can(action, resource)`

For more fine-grained control, the `can()` middleware checks specific action/resource permissions.

### Permission Model

```prisma
model Permission {
  id          String   @id @default(uuid())
  action      String   // create, read, update, delete, manage
  resource    String   // user, organization, billing, settings, etc.
  description String?
  createdAt   DateTime @default(now())
  roles       RolePermission[]

  @@unique([action, resource])
}

model RolePermission {
  roleId       String
  permissionId String
  role       Role       @relation(...)
  permission Permission @relation(...)
  @@id([roleId, permissionId])
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  permissions RolePermission[]
}
```

### The 11 Granular Permissions

| Action | Resource | Description |
|---|---|---|
| `create` | `user` | Create new users |
| `read` | `user` | View user profiles |
| `update` | `user` | Edit user details |
| `delete` | `user` | Remove users |
| `manage` | `organization` | Full organization control |
| `read` | `billing` | View billing info |
| `manage` | `billing` | Modify billing/plans |
| `read` | `settings` | View system settings |
| `manage` | `settings` | Modify system settings |
| `read` | `audit` | View audit logs |
| `manage` | `roles` | Manage roles and permissions |

### Static Permission Fallback

The `can()` middleware at `src/middleware/permission.js` first queries the database for a matching `Permission` + `RolePermission`. If none is found, it falls back to a static mapping:

```js
const staticPermissions = {
  SUPER_ADMIN: '*',                              // all actions on all resources
  ADMIN:       ['read', 'manage'],               // read + manage
  MANAGER:     ['read', 'create', 'update'],     // read + create + update
  MEMBER:      ['read'],                         // read only
  VIEWER:      ['read'],                         // read only
};
```

### Usage

```js
import { can } from '../middleware/permission.js';

// Only users with 'manage' action on 'settings' resource
router.put('/settings/:key', authenticate, can('manage', 'settings'), settingController.updateSetting);

// Only users with 'read' action on 'billing' resource
router.get('/billing/invoices', authenticate, can('read', 'billing'), billingController.listInvoices);
```

**Behavior:**
1. Looks up `Permission` by `{ action, resource }`
2. Checks if any `RolePermission` links it to the user's `role`
3. If no DB permission found, falls back to static role mapping
4. `SUPER_ADMIN` with `*` is always allowed
5. Returns `403 Forbidden` if not permitted

---

## Role-Permission Mapping Table

| Role | create | read | update | delete | manage |
|---|---|---|---|---|---|
| **SUPER_ADMIN** | ALL | ALL | ALL | ALL | ALL |
| **ADMIN** | ✓ user | ✓ user, billing, settings, audit | ✓ user | ✓ user | ✓ org, billing, settings |
| **MANAGER** | ✓ user | ✓ user, billing | ✓ user | ✗ | ✗ |
| **MEMBER** | ✗ | ✓ (own data) | ✗ | ✗ | ✗ |
| **VIEWER** | ✗ | ✓ (read-only) | ✗ | ✗ | ✗ |

---

## Organization & Team Roles

In addition to the global user role, users can have roles within organizations:

```prisma
model OrganizationMember {
  id             String
  organizationId String
  userId         String
  role           UserRole @default(MEMBER)
  // ...
  @@unique([organizationId, userId])
}
```

```prisma
model TeamMember {
  id     String
  teamId String
  userId String
  role   UserRole @default(MEMBER)
  // ...
  @@unique([teamId, userId])
}
```

This enables a multi-tenant role model where a `MEMBER` globally might be an `ADMIN` within a specific organization.

---

## Authorization Flow Diagram

```
Request
  |
  v
authenticate middleware
  |-- No token? --> 401 Unauthorized
  |-- Invalid token? --> 401 Unauthorized
  |-- User inactive? --> 401 Unauthorized
  |-- OK --> req.user = { id, email, role, ... }
  |
  v
authorize('ADMIN', 'SUPER_ADMIN')  
  |-- Role not in list? --> 403 Forbidden
  |-- OK --> continue
  |
  v
can('manage', 'settings')
  |-- Query Permission + RolePermission
  |-- Found? --> Check if user role is linked
  |-- Not found? --> Fall back to static map
  |-- Not permitted? --> 403 Forbidden
  |-- OK --> continue
  |
  v
Controller -> Service -> Prisma
```

---

## API Endpoint Authorization Matrix

| Endpoint | Auth | Role Required |
|---|---|---|
| `POST /api/auth/signup` | No | — |
| `POST /api/auth/login` | No | — |
| `POST /api/auth/refresh` | No | — |
| `GET /api/auth/me` | Yes | Any authenticated |
| `POST /api/auth/logout` | Yes | Any authenticated |
| `GET /api/users` | Yes | ADMIN, SUPER_ADMIN |
| `GET /api/users/:id` | Yes | ADMIN, SUPER_ADMIN |
| `PATCH /api/users/:id` | Yes | ADMIN, SUPER_ADMIN |
| `DELETE /api/users/:id` | Yes | SUPER_ADMIN only |
| `GET /api/admin/stats` | Yes | ADMIN, SUPER_ADMIN |
| `GET /api/admin/user-analytics` | Yes | SUPER_ADMIN only |
| `GET /api/settings` | Yes | ADMIN, SUPER_ADMIN |
| `PUT /api/settings/:key` | Yes | SUPER_ADMIN only |
| `GET /api/audit-logs` | Yes | ADMIN, SUPER_ADMIN |
| `POST /api/organizations` | Yes | Any authenticated |
| `DELETE /api/organizations/:id` | Yes | SUPER_ADMIN |
| `POST /api/organizations/:id/invite` | Yes | ADMIN, SUPER_ADMIN |
| `DELETE /api/organizations/:id/members/:memberId` | Yes | ADMIN, SUPER_ADMIN |
| `POST /api/teams` | Yes | Any authenticated |
| `PATCH /api/teams/:id` | Yes | ADMIN, SUPER_ADMIN |
| `DELETE /api/teams/:id` | Yes | ADMIN, SUPER_ADMIN |
| `POST /api/teams/:id/members` | Yes | ADMIN, SUPER_ADMIN |
| `GET /api/billing/plans` | No | — |
| `POST /api/billing/subscribe` | Yes | Any authenticated |
| `GET /api/billing/invoices` | Yes | Any authenticated |
| `GET /api/dashboard` | Yes | Any authenticated |
| `GET /api/search` | Yes | Any authenticated |
| `POST /api/ai/chat` | Yes | Any authenticated |
| `POST /api/ai/stream` | Yes | Any authenticated |
