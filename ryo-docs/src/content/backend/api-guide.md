# API Guide

How to build and consume API endpoints on this framework. Pair with the [API Reference](../api) for the full endpoint/code table.

## Routing

Central router: `backend/routes/index.js`. Module routers mount under `/api/v1`:

```js
import authRoutes from '../modules/auth/routes/authRoutes.js'

router.use('/common/auth', authRoutes)      // /api/v1/common/auth/*
router.use('/admin/invoices', invoiceRoutes) // /api/v1/admin/invoices/*
```

Naming convention: `/api/v1/<actor>/<resource>` — `common` for cross-cutting features, `admin`/`superadmin` for role-scoped resources, `public` for open endpoints.

## The Envelope

Every response, success or error, uses `helpers/apiResponse`:

```js
import { response, send } from '../helpers/apiResponse.js'

// route handler
res.status(200).json(response('SUCCESS', { items, meta }))
// or the shorthand that maps code → HTTP status:
send(res, 'SUCCESS', data)
```

Response keys come from `backend/globals/response.json`:

```json
{
  "1000": { "message": "Operation completed successfully.", "http": 200 },
  "1001": { "message": "Validation error.",               "http": 400 },
  "1002": { "message": "Unauthorized.",                    "http": 401 },
  "1003": { "message": "Forbidden.",                       "http": 403 },
  "1004": { "message": "Not found.",                       "http": 404 },
  "1005": { "message": "Conflict.",                        "http": 409 },
  "1006": { "message": "Internal server error.",           "http": 500 },
  "1007": { "message": "Too many requests.",               "http": 429 },
  "1008": { "message": "Account locked.",                  "http": 423 },
  "1010": { "message": "Token expired.",                   "http": 200 },
  "1011": { "message": "Invalid credentials.",             "http": 401 },
  "1012": { "message": "Resource created successfully.",   "http": 201 },
  "1013": { "message": "Bad request.",                     "http": 400 },
  "1014": { "message": "Invalid or expired OTP.",          "http": 400 }
}
```

The `send()` helper maps `responseCode` → HTTP status so handlers never hardcode statuses. BigInt values in `responseData` are serialized to strings by `apiResponse.js` (Prisma `count` returns BigInt).

## Validation

zod v4 + `validateBody` middleware. Schema lives next to the route:

```js
import { z } from 'zod'
import { validateBody } from '../../../middleware/validate.js'

const createInvoiceSchema = z.object({
  number:    z.string().min(1),
  amount:    z.number().positive(),
  dueDate:   z.coerce.date(),
  lineItems: z.array(z.object({ name: z.string(), qty: z.number().int().min(1), price: z.number() })).optional(),
})

router.post('/', verifyToken, role('admin'), requireReadWrite(), validateBody(createInvoiceSchema), handler)
```

On failure: `1001 VALIDATION_ERROR` with the zod issues in `responseData.result`. Parsed (coerced) data is on `req.body` — handlers read clean types.

## Error Handling

Handlers throw domain errors; a central error middleware converts them:

```js
import { response } from '../helpers/apiResponse.js'

// in a service
throw new Error(response('NOT_FOUND', null))

// error middleware (routes/index.js)
app.use((err, req, res, next) => {
  if (err?.responseCode) return res.status(err.http).json(err)
  res.status(500).json(response('INTERNAL_ERROR', null))
})
```

All errors flow as the envelope — the frontend never parses raw Express errors.

## Pagination

`helpers/paginate.js` — accepts `{ page, limit }`, clamps (page >= 1, limit 1–100), returns `{ skip, take, meta }`:

```js
const { skip, take, meta } = paginate(req.query)
const [items, total] = await Promise.all([
  prisma.invoice.findMany({ skip, take, where }),
  prisma.invoice.count({ where }),
])
send(res, 'SUCCESS', { items, meta: { ...meta, total, totalPages: Math.ceil(total / take), hasNext, hasPrev } })
```

Frontend lists read `meta` for pagination controls.

## Auth Headers

```http
Authorization: Bearer <access-token>
```

`verifyToken` populates `req.user` (`{ id, role, accessLevel, ... }`). Role/level guards follow. Refresh happens transparently on the frontend when the token expires (HTTP 401 or envelope 1010).

## File Uploads

Multipart through `validatedUpload` (multer memory storage, 5 MB, allowlist + magic bytes):

```js
import { validatedUpload } from '../../../middleware/upload.js'

router.post('/avatar', verifyToken, validatedUpload.single('photo'), validateBody(avatarSchema), handler)
```

Access the file via `req.file`; the service uploads to S3/Cloudinary and stores the returned URL.

## Rate Limits

Preset limiters in `middleware/rateLimit.js`:

| Limiter | Window | Limit | Use |
|---------|--------|-------|-----|
| `loginLimiter` | 15 min | 5 | login (keyed per IP + userName) |
| `otpLimiter` | 1 h | 3 | OTP requests |
| `refreshLimiter` | 15 min | 20 | token refresh |
| `generalLimiter` | 1 min | 200 | everything else |

Redis-backed; degrade to in-memory sliding window if Redis drops. Exceeded → `1007 RATE_LIMITED` with `Retry-After`.

## Quick Checklist for a New Endpoint

1. Mount under `/api/v1/<actor>/<resource>` in `routes/index.js`.
2. Chain: rate limit (if sensitive) → `verifyToken` → `role(...)` → `requireReadWrite()` (mutations) → `validateBody(schema)`.
3. Return via `send(res, 'KEY', data)`; never raw JSON shapes.
4. Add frontend method in `api.js` matching the path; pages call `useDataFetch`.
