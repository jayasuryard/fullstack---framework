# API Reference

All endpoints live under `/api/v1`. Every response uses the standard envelope. Auth endpoints are under `/api/v1/common/auth`; product modules mount under their own prefix (e.g. `/api/v1/admin/users`).

## Base URL

```
http://localhost:3000/api/v1   (development)
https://your-domain.com/api/v1  (production)
```

Frontend never calls these URLs directly — all requests go through `frontend/src/server/api.js`.

## Response Envelope

```json
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": { "result": { } }
}
```

| Field | Meaning |
|-------|---------|
| `responseCode` | numeric code from `backend/globals/response.json` |
| `responseMessage` | human-readable message |
| `responseData.result` | payload (object, array, or null) |

## Response Codes

| Code | Key | Meaning | HTTP |
|------|-----|---------|------|
| 1000 | `SUCCESS` | success | 200 |
| 1001 | `VALIDATION_ERROR` | zod validation failed | 400 |
| 1002 | `UNAUTHORIZED` | missing/invalid auth | 401 |
| 1003 | `FORBIDDEN` | authenticated but not allowed | 403 |
| 1004 | `NOT_FOUND` | resource not found | 404 |
| 1005 | `CONFLICT` | duplicate / state conflict | 409 |
| 1006 | `INTERNAL_ERROR` | server error | 500 |
| 1007 | `RATE_LIMITED` | rate limit exceeded | 429 |
| 1008 | `ACCOUNT_LOCKED` | too many failed attempts | 423 |
| 1010 | `TOKEN_EXPIRED` | access token expired | 200* |
| 1011 | `INVALID_CREDENTIALS` | wrong username/password | 401 |
| 1012 | `CREATED` | resource created | 201 |
| 1013 | `BAD_REQUEST` | malformed request | 400 |
| 1014 | `OTP_INVALID` | wrong/expired reset OTP | 400 |

\* `TOKEN_EXPIRED` is sent with HTTP 200 + `responseCode 1010`; the frontend client detects it and refreshes automatically.

## Authentication Endpoints

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/common/auth/login` | — | `{ userName, password }` | `{ token, refreshToken, user }` |
| POST | `/common/auth/refresh` | — | `{ refreshToken }` | new `{ token, refreshToken }` |
| GET | `/common/auth/me` | Bearer | — | user profile |
| POST | `/common/auth/logout` | Bearer | — | revokes refresh token |
| POST | `/common/auth/profile/update` | Bearer | FormData (name, phone, photo) | updated profile |
| POST | `/common/auth/forgot-password` | — | `{ userName, email }` | OTP sent |
| POST | `/common/auth/reset-password` | — | `{ otp, newPassword }` | password changed |

### Example — login

```bash
curl -X POST http://localhost:3000/api/v1/common/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"admin","password":"secret"}'
```

```json
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": {
    "result": {
      "token": "eyJhbGciOi...",
      "refreshToken": "opaque-48-random-bytes-base64url",
      "user": { "id": "cuid", "userName": "admin", "role": "admin", "accessLevel": "read_write" }
    }
  }
}
```

## Authenticated Requests

```
Authorization: Bearer <access-token>
```

Protected endpoints: `verifyToken` then optional `role('admin')` then optional `requireReadWrite()`.

## Pagination

List endpoints accept `?page=1&limit=10` and return meta:

```json
{
  "responseCode": 1000,
  "responseData": {
    "result": {
      "items": [],
      "meta": {
        "page": 1,
        "limit": 10,
        "total": 42,
        "totalPages": 5,
        "hasNext": true,
        "hasPrev": false
      }
    }
  }
}
```

Backend helper: `helpers/paginate.js` (clamps page >= 1 and limit 1–100).

## Errors

Non-success responses carry the same envelope with a message:

```json
{
  "responseCode": 1003,
  "responseMessage": "Forbidden. You do not have permission to access this resource.",
  "responseData": { "result": null }
}
```

Frontend: `api.js` throws `ApiError` with `status`, `url`, and `payload` for any code other than 1000/1012. Catch and show `err.message` or the code.
