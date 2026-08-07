# Authentication

Full auth stack: JWT access tokens, opaque rotating refresh tokens, account lockout, Redis OTP password reset, session invalidation. No OAuth, no MFA, no signup endpoint — users are created by the super admin or seed scripts.

## Endpoints

All under `/api/v1/common/auth`.

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `login` | — | `{ userName, password }` | `{ token, refreshToken, user }` |
| POST | `refresh` | — | `{ refreshToken }` | new `{ token, refreshToken }` |
| GET | `me` | Bearer | — | user profile |
| POST | `logout` | Bearer | — | revokes refresh token |
| POST | `profile/update` | Bearer | FormData (name, phone, photo) | updated profile |
| POST | `forgot-password` | — | `{ userName, email }` | OTP sent |
| POST | `reset-password` | — | `{ otp, newPassword }` | password changed |

## Login Flow

1. Rate limiter `rl:login:` — 5 attempts / 15 min per IP + userName combo.
2. Lockout: after 5 consecutive failures `lockedUntil` is set 15 min ahead → `1008 ACCOUNT_LOCKED`.
3. Password check with `bcrypt.compare` against a `DUMMY_HASH` first — identical timing whether or not the user exists (prevents user enumeration).
4. Success: access JWT (24 h), opaque refresh token, `lastLoginAt` updated, failed counter reset.
5. Responses: success `1000`; bad credentials `1011 INVALID_CREDENTIALS`.

## Refresh Tokens — Opaque, Rotated

Refresh tokens are **NOT JWTs**. They are `randomBytes(48)` → base64url, stored as a sha256 **`tokenHash`** (unique indexed column) with a DB `expiredAt` (7 d).

- On `POST /refresh`: look up by hash → verify not revoked, not expired → issue new access token **and** a new refresh token; old row is revoked (rotation).
- Reuse of a rotated token fails → treated as compromise; the refresh chain is revoked.
- Single-use: each refresh consumes the presented token.

Why opaque: a deterministic JWT collided on the unique `tokenHash` on every second login and broke rotation. Opaque random bytes are unique per issuance.

## Token Invalidation

- `POST /logout`: revokes the presented refresh token.
- Force-logout all sessions: increment `tokenVersion` on the User row — every existing access JWT fails `verifyToken` (version compared at decode).

## Password Reset (OTP)

1. `forgot-password` → validates user, generates 6-digit OTP (`otp-generator`), stores in Redis with **10 min TTL** (`auth:reset:otp:<userId>`), tracks attempts (`auth:reset:attempts:<userId>`).
2. Email via `emailService` (dev mode: logs the OTP instead of sending).
3. `reset-password` → checks OTP, max 5 attempts, hashes new password (min 8 chars, zod `resetSchema`).
4. Errors: `1014 OTP_INVALID`, `1001 VALIDATION_ERROR`, `1004 NOT_FOUND`.

## Profile

- `GET /me` — current user from `req.user` (set by `verifyToken`).
- `POST /profile/update` — multipart FormData: name, phone, photo. Photo passes `validatedUpload` (allowlisted MIME + extension, magic-byte sniff, SVG rejected, 5 MB) and uploads to S3/Cloudinary; URL persisted on the user row.

## Middleware

```js
router.post('/profile/update',
  verifyToken,                 // Bearer → req.user
  validatedUpload.single('photo'),
  validateBody(updateProfileSchema),
  handler)
```

- `verifyToken`: parses Bearer, verifies signature + expiry + `tokenVersion`, checks user active and not soft-deleted, sets `req.user`.
- `validateBody(schema)`: zod parse → `1001` on failure.
- Schemas live in `modules/auth/routes/authRoutes.js`: `loginSchema`, `refreshSchema`, `forgotSchema`, `resetSchema` (OTP regex `^\d{6}$`, password min 8).

## Security Notes

- bcrypt with cost configured in `AuthService`; timing-safe compare via dummy hash.
- Refresh tokens carry device info (`ipAddress`, `deviceInfo`) on the row.
- Rate limits: `rl:login:` (5/15m), `rl:otp:` (3/1h), `rl:refresh:` (20/15m).
- Lockout applies per user row; `failedLoginAttempts` reset on success or unlock.
