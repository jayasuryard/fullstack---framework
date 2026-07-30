# Framework Architecture

AI-agent reference for building new SaaS products on this scaffold. Read this before writing any new code.

---

## Stack

| Layer      | Technology |
|------------|-----------|
| Backend runtime | Node.js + Express 5 |
| Database   | PostgreSQL + Prisma 7 (`@prisma/adapter-pg` driver adapter) |
| Cache / Queue | Redis 5 (custom BLPOP job queue, pub/sub for WS progress) |
| Auth       | JWT (jsonwebtoken) + bcrypt + refresh-token rotation |
| File storage | AWS S3 (primary) + Cloudinary (secondary) |
| Email      | AWS SES |
| SMS/WhatsApp | Twilio |
| Payment    | Razorpay (plugin slot — unwire if not needed) |
| Background jobs | Custom Redis queue (`helpers/queue/jobQueue.js`) + node-cron |
| Process manager | PM2 (cluster for API, fork for worker) |
| Frontend   | React 19 + React Router 7 + Vite 7 (SWC) |
| Styling    | Tailwind CSS 4 (Vite plugin, no config file needed) |
| State      | React Context API + useState |
| Icons      | @phosphor-icons/react + react-icons |
| Charts     | recharts |

---

## Dependency Rules

```
Frontend pages
    ↓ imports from
Frontend components/hooks/contexts
    ↓ calls
src/server/api.js  (single API gateway — no fetch() calls outside this file)
    ↓ HTTP →
Backend routes/index.js
    ↓
Module routes (middleware applied here)
    ↓
Module services (business logic lives here)
    ↓
helpers/ + config/ (no business logic, no module imports)
```

**Never** import a module's service from another module's service. Cross-module communication goes through the database or a shared helper.

---

## Folder Ownership

### Backend

```
backend/
├── server.js              Entry point. Wires middleware, routes, WS servers, crons. No business logic.
├── worker.js              Background job worker. Registers handlers. No business logic.
├── ecosystem.config.js    PM2 config. Change APP_NAME constant at top.
├── config/                Infrastructure clients (DB, Redis, S3, Cloudinary). No logic.
├── middleware/            Cross-cutting middleware. No business logic.
│   ├── verifyToken.js     JWT auth. Populates req.user.
│   ├── role.js            RBAC. Usage: role('admin', 'superAdmin')
│   ├── accessLevel.js     Read-only enforcement. Usage: requireReadWrite(['management'])
│   ├── rateLimit.js       Rate limiters. Pre-built: loginLimiter, otpSendLimiter, generalLimiter.
│   └── upload.js          multer memory storage. Usage: upload.single('photo')
├── helpers/               Stateless utilities used by any module.
│   ├── apiResponse.js     Response envelope. Usage: apiResponse.response('SUCCESS', data)
│   ├── auditLogger.js     DB audit log. Usage: auditLogger('ACTION', req.user, req)
│   ├── paginate.js        Prisma pagination. Usage: const { skip, take, meta } = paginate(req.query)
│   ├── generateToken.js   JWT helpers. Usage: generateToken(user), generateRefreshToken(user)
│   └── queue/jobQueue.js  Job queue. Usage: enqueueJob('queue-name', payload)
├── globals/response.json  Response code registry. Add new codes here.
├── routes/index.js        Route aggregator. Add new module mounts here.
├── modules/               Feature modules. One folder per domain.
│   └── <module>/
│       ├── routes/<module>Routes.js    Route definitions + middleware
│       └── services/<Module>Service.js Business logic
├── jobs/                  Cron job files. One file per scheduled task.
├── workers/               Background job handlers. One file per job type.
├── prisma/schema.prisma   Data model. Framework models at top; product models below the marker.
└── scripts/               Code generators. Do not modify.
```

### Frontend

```
frontend/src/
├── main.jsx               React root mount. Do not modify.
├── App.jsx                BrowserRouter + AuthProvider + route definitions.
├── components/
│   ├── PrivateRoute.jsx   Auth guard. Props: children, allowedRoles[].
│   ├── MainLayout.jsx     Desktop sidebar shell. Define NAV_ITEMS inside.
│   ├── MobileLayout.jsx   Mobile bottom-nav shell. Define MOBILE_NAV_ITEMS inside.
│   └── common/            Reusable UI primitives (Button, Input, Modal, Table, etc.)
├── contexts/
│   └── AuthContext.jsx    Global auth state. Access via useAuth().
├── hooks/
│   └── useDataFetch.js    Generic data-fetch hook.
├── server/
│   └── api.js             Single API gateway. All fetch() calls live here.
├── utils/
│   └── subdomain.js       Multi-tenant subdomain detection.
└── pages/                 Feature pages. Group by domain: pages/<feature>/<Feature>Page.jsx
```

---

## Naming Conventions

### Backend

| Thing | Convention | Example |
|-------|-----------|---------|
| Module folder | camelCase | `feeManagement` |
| Route file | `<module>Routes.js` | `feeManagementRoutes.js` |
| Service file | `<Module>Service.js` | `FeeManagementService.js` |
| Service function | camelCase verb | `getFees`, `createFee`, `updateFee`, `deleteFee` |
| Job handler file | `<domain><Action>JobHandler.js` | `feeReceiptNotifyJobHandler.js` |
| Cron file | `<domain><Action>Cron.js` | `feeReminderCron.js` |
| Queue name | `<domain>:<action>` | `fee:receipt-notify` |
| API path | `/api/v1/<actor>/<resource>` | `/api/v1/admin/fees` |
| Prisma model | PascalCase | `FeePayment` |
| Prisma field | camelCase | `dueDate`, `paidAt` |
| Env var | SCREAMING_SNAKE | `JWT_SECRET`, `REDIS_HOST` |

### Frontend

| Thing | Convention | Example |
|-------|-----------|---------|
| Page file | `<Feature>Page.jsx` | `FeesPage.jsx` |
| Page folder | `pages/<feature>/` | `pages/fees/` |
| Context file | `<Feature>Context.jsx` | `SchoolContext.jsx` |
| Hook file | `use<Feature>.js` | `useClasses.js` |
| API namespace | camelCase under `api.` | `api.fees.list(query)` |
| Component | PascalCase | `FeeCard`, `PaymentModal` |
| CSS | Tailwind utilities in JSX | No `.module.css`, no inline styles |

---

## API Response Envelope

Every backend response uses this shape:

```json
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": {
    "result": { }
  }
}
```

Response codes live in `globals/response.json`. The frontend `api.js` client unwraps this automatically — your page components receive `responseData.result` directly (or an `ApiError` is thrown).

**HTTP status** is almost always 200. The `responseCode` field carries semantic status. Exceptions: 503 for maintenance mode, 400 for malformed webhook payloads.

---

## Pagination

```js
// Backend service:
const { skip, take, meta } = paginate(req.query)
const rows  = await prisma.model.findMany({ skip, take, where })
const total = await prisma.model.count({ where })
res.json(apiResponse.response('SUCCESS', { rows, pagination: meta(total) }))
```

```js
// Frontend (api.js namespace):
api.feature.list = (query) => request('GET', '/admin/feature', {}, query)

// Page component:
const { data } = useDataFetch(() => api.feature.list({ page, limit: 20 }), [page])
// data.rows, data.pagination.{ total, page, limit, totalPages, hasNext, hasPrev }
```

---

## Creating a New Module (Loop Steps 1–8)

**Step 1 — Scaffold backend:**
```bash
npm run gen:module <moduleName>
# Creates modules/<moduleName>/routes/<moduleName>Routes.js
#         modules/<moduleName>/services/<Module>Service.js
# Auto-registers in routes/index.js
```

**Step 2 — Scaffold database model:**
```bash
npm run gen:model <ModelName> field:Type field2:Type?
# Appends model to prisma/schema.prisma
npm run gen:migration add_<model_name>_table
```

**Step 3 — Wire middleware in the route file:**
```js
router.get('/',    verifyToken, role('admin'),                     list)
router.post('/',   verifyToken, role('admin'), requireReadWrite(), create)
router.put('/:id', verifyToken, role('admin'), requireReadWrite(), update)
```

**Step 4 — Implement business logic in the service file.** Follow the pattern:
```js
async function list(req, res) {
  try {
    const { skip, take, meta } = paginate(req.query)
    const where = { /* filter from req.query */ }
    const [rows, total] = await Promise.all([
      prisma.model.findMany({ skip, take, where }),
      prisma.model.count({ where }),
    ])
    res.json(apiResponse.response('SUCCESS', { rows, pagination: meta(total) }))
  } catch (error) {
    console.error('[ModuleService.list]', error)
    res.json(apiResponse.response('ERROR'))
  }
}
```

**Step 5 — Add API namespace to `frontend/src/server/api.js`:**
```js
api.feature = {
  list:   (query)       => request('GET',    '/admin/feature',     {}, query),
  get:    ({ id })      => request('GET',    '/admin/feature/:id', { id }),
  create: (body)        => request('POST',   '/admin/feature',     {}, {}, body),
  update: ({ id, ...b}) => request('PUT',    '/admin/feature/:id', { id }, {}, b),
  delete: ({ id })      => request('DELETE', '/admin/feature/:id', { id }),
}
```

**Step 6 — Create a page** (copy `pages/_stub.jsx`):
```
src/pages/feature/FeaturePage.jsx
```

**Step 7 — Register the route** in `App.jsx`:
```jsx
import { FeaturePage } from './pages/feature/FeaturePage'
<Route path="/admin/feature" element={<FeaturePage />} />
```

---

## Creating a Background Job

1. **Copy** `workers/_stub.js` → `workers/<domain><Action>JobHandler.js`
2. **Implement** your handler function
3. **Register** in `worker.js`: add `'<queue>:<action>': handle<Feature>` to the `handlers` map
4. **Enqueue** from any service: `await enqueueJob('<queue>:<action>', { ...payload })`
5. **Optionally stream progress** to the browser using the WebSocket pattern from `Product/backend/helpers/queue/jobWsServer.js`

---

## Creating a Cron Job

1. **Copy** `jobs/_stub.js` → `jobs/<domain><Action>Cron.js`
2. **Implement** the schedule + logic
3. **Register** in `server.js`: import and call `start<Feature>Cron()` at the bottom

---

## Authentication Pattern

The framework implements:
- JWT access token (24h) + refresh token (7d, single-use rotation)
- Hashed refresh tokens stored in the `RefreshToken` DB table
- `tokenVersion` on the `User` model — increment to force-invalidate all tokens (on logout, password reset)
- Account lockout after 5 consecutive failed logins (15-minute lock)
- Soft delete (`isDeleted`) + active flag checked on every request

To add product-specific JWT claims (e.g. `tenantId`), pass them as `extraClaims` to `generateToken`:
```js
generateToken(user, null, { tenantId: user.tenantId })
```

---

## Security Checklist for Every New Module

Before marking a module done, confirm:

- [ ] All routes have `verifyToken` (except intentionally public ones)
- [ ] All routes have `role(...)` matching their actor segment
- [ ] All mutating routes (POST/PUT/PATCH/DELETE) have `requireReadWrite()`
- [ ] User input is validated before use (no trusting `req.body` blindly)
- [ ] File uploads use `upload.single/array()` with the 5 MB limit
- [ ] Sensitive actions are logged with `auditLogger()`
- [ ] No secrets appear in code or logs
- [ ] Rate limiting applied to public / abuse-prone endpoints

---

## Environment Variables

All config comes from `process.env` (loaded via `dotenv`). No hardcoded values anywhere.
Copy `.env.example` → `.env` and fill in values. The `.env` file is gitignored.

Frontend env vars are prefixed `VITE_` and injected at build time via `import.meta.env`.
Copy `.env.example` → `.env` in the frontend folder.

---

## Process Model

```
PM2
├── <app>-api     cluster (instances: max)  — Express server
└── <app>-worker  fork   (instances: 1)     — Redis BLPOP job processor
```

Both read from the same `.env`. The worker uses a separate Redis connection.
Change `APP_NAME` in `ecosystem.config.js` before deploying.
