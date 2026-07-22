# Authentication

RyoFramework uses a dual-token JWT authentication system with optional MFA, email verification, and OAuth social login.

## Token Strategy

| Token | Lifetime | Purpose |
|---|---|---|
| Access Token | 15 minutes (configurable via `JWT_EXPIRES_IN`) | API authorization — sent in `Authorization: Bearer` header |
| Refresh Token | 7 days (configurable via `REFRESH_TOKEN_EXPIRES_IN`) | Obtain new access tokens — rotation model (old token revoked on use) |

### Access Token Payload

```json
{
  "id": "uuid-of-user",
  "email": "user@example.com",
  "role": "MEMBER",
  "iat": 1721600000,
  "exp": 1721600900
}
```

### Refresh Token Rotation

Every time a refresh token is used, it is **revoked** and a **new refresh token** is issued. This limits the window of vulnerability if a refresh token is compromised.

### Token Generation (`src/utils/tokens.js`)

```js
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/tokens.js';

const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

const decoded = verifyAccessToken(token);
```

---

## Authentication Endpoints

All auth endpoints are prefixed with `/api/auth`.

### Register

```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Validation Rules:**
- `firstName` — required, 1-100 chars
- `lastName` — required, 1-100 chars
- `email` — valid email format
- `password` — 8-128 chars
- `confirmPassword` — must match `password`

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "MEMBER",
      "status": "PENDING",
      "avatar": null,
      "phone": null,
      "emailVerifiedAt": null,
      "twoFactorEnabled": false,
      "lastLoginAt": null,
      "createdAt": "2026-07-22T10:30:00.000Z",
      "updatedAt": "2026-07-22T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `409 Conflict` — Email already registered

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object without password/twoFactorSecret */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Side Effects:**
- Creates a `LoginAttempt` record (success or failure with IP/user-agent)
- Updates `lastLoginAt` timestamp
- Creates login `Activity` record
- Sets user status to `ACTIVE` if not already

**Errors:**
- `401` — Invalid email or password
- `403` — Account is suspended or banned

### Refresh Token

```
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Behavior:**
1. Verifies the refresh token signature
2. Checks token exists in DB, is not revoked, and has not expired
3. Verifies user exists and is ACTIVE
4. Revokes the old refresh token
5. Issues a new access token + new refresh token

**Errors:**
- `401` — Invalid or expired refresh token
- `401` — User not found or inactive

### Logout

```
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Behavior:**
- Revokes the provided refresh token
- Creates logout `Activity` record

### Get Current User

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* full user object without password */ }
  }
}
```

---

## Password Reset Flow

### Forgot Password

```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent",
  "data": null
}
```

**Behavior:**
- Always returns the same response (prevents email enumeration)
- If user exists: revokes all existing refresh tokens and sends reset email
- Reset link expires in 1 hour

### Reset Password

```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "received-token",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Behavior:**
- Verifies the reset token
- Updates password (bcrypt hashed, 12 rounds)
- Revokes all existing sessions (refresh tokens)

---

## Multi-Factor Authentication (MFA/OTP)

MFA endpoints are prefixed with `/api/mfa`.

### Generate MFA Secret

```
POST /api/mfa/generate
```

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true,
  "message": "MFA secret generated",
  "data": {
    "secret": "ABCDEF1234567890",
    "qrCode": "otpauth://totp/RyoFramework:jane@example.com?secret=ABCDEF1234567890&issuer=RyoFramework"
  }
}
```

The `qrCode` URL is compatible with authenticator apps (Google Authenticator, Authy, etc.).

### Enable MFA

```
POST /api/mfa/enable
```

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{ "code": "123456" }
```

**Behavior:** Verifies the code against the stored secret, then sets `twoFactorEnabled = true`.

### Disable MFA

```
POST /api/mfa/disable
```

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{ "code": "123456" }
```

**Behavior:** Verifies the code and clears `twoFactorSecret` and sets `twoFactorEnabled = false`.

### Send OTP

```
POST /api/mfa/send-otp
```

**Request Body:**
```json
{
  "purpose": "LOGIN"
}
```

Purpose can be `LOGIN`, `MFA`, `PASSWORD_RESET`, or `EMAIL_VERIFICATION`.

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent",
  "data": null
}
```

**Behavior:** Generates a 6-digit OTP, stores in `OtpCode` table (10-minute expiry), and sends via email.

### Verify OTP

```
POST /api/mfa/verify-otp
```

**Headers:** `Authorization: Bearer <accessToken>`
**Request Body:**
```json
{
  "code": "123456",
  "purpose": "MFA"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP verified",
  "data": null
}
```

---

## Email Verification

Endpoints prefixed with `/api/email-verification`.

### Send Verification Email

```
POST /api/email-verification/send
```

**Headers:** `Authorization: Bearer <accessToken>`

**Behavior:**
- Generates a verification token (24-hour expiry)
- Creates `EmailVerificationToken` record
- Sends email with verification link

### Verify Email

```
POST /api/email-verification/verify
```

**Request Body:**
```json
{
  "token": "received-token"
}
```

**Behavior:**
- Validates the token (exists, not used, not expired)
- Sets `emailVerifiedAt` timestamp on `User`
- Marks token as used

---

## OAuth / Social Login

OAuth endpoints are prefixed with `/api/auth/oauth`.

### Supported Providers

| Provider | Strategy | Field on User | Props Needed |
|---|---|---|---|
| Google | `passport-google-oauth20` | `googleId` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Facebook | `passport-facebook` | `facebookId` | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` |
| Apple | `passport-apple` | `appleId` | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_PATH` |
| Microsoft | `passport-microsoft` | `microsoftId` | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT` |
| X/Twitter | `passport-twitter` | `twitterId` | `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET` |

### Provider Configuration (`src/config/passport.js`)

Each provider is defined with its strategy, scope, options, and enabled status:

```js
export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'G',
    color: '#4285F4',
    enabled: !!(config.oauth.google.clientId && config.oauth.google.clientSecret),
    strategy: GoogleStrategy,
    scope: ['profile', 'email'],
    options: {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: `${config.oauth.baseCallbackUrl}/google/callback`,
    },
  },
  // ... facebook, apple, microsoft, twitter
};
```

Providers are only registered when their credentials are present in the environment, making them automatically enabled/disabled.

### OAuth Flow

```
1. GET /api/auth/oauth/providers
   --> Returns list of enabled providers

2. GET /api/auth/oauth/:provider
   --> Redirects user to provider's consent screen

3. User authenticates on provider's site

4. GET /api/auth/oauth/:provider/callback
   --> Passport handles token exchange
   --> oauthService.findOrCreateUser(provider, profile)
   --> Redirects to frontend with tokens:
       /oauth/callback?token=accessToken&refreshToken=refreshToken
```

### List Providers

```
GET /api/auth/oauth/providers
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "providers": [
      { "key": "google", "name": "Google", "icon": "G", "color": "#4285F4" },
      { "key": "github", "name": "GitHub", "icon": "GH", "color": "#333" }
    ]
  }
}
```

### Initiate OAuth

```
GET /api/auth/oauth/:provider
```

Redirects to the provider's OAuth consent screen (e.g., Google, Facebook).

### OAuth Callback

```
GET /api/auth/oauth/:provider/callback
```

On success, redirects to `FRONTEND_URL/oauth/callback?token=<accessToken>&refreshToken=<refreshToken>`.
On failure, redirects to `FRONTEND_URL/oauth/callback?error=<errorMessage>`.

### findOrCreateUser Behavior (`src/services/oauthService.js`)

When a user authenticates via OAuth:

1. **Normalize Profile** — Extract email, name, avatar from provider-specific profile format
2. **Lookup Existing User** — Find by email OR provider ID (e.g., `googleId`)
3. **Existing User:**
   - Link provider ID if not already linked
   - Set `emailVerifiedAt` if not already verified
   - Update avatar if not set
   - Update `lastLoginAt`
   - Create `OAUTH_LOGIN` activity
   - Generate tokens
4. **New User:**
   - Create with role `MEMBER`, status `ACTIVE`, email verified
   - Set provider-specific ID field (e.g., `googleId`)
   - Create `OAUTH_SIGNUP` activity
   - Generate tokens
5. **Error if no email** — Provider must return email

---

## Session Management

Sessions are tracked via the `Session` model but the primary session mechanism is refresh token rotation:

- Each login/signup creates a `RefreshToken` record with a 7-day expiry
- On token refresh, the old token is revoked and a new one issued
- On logout, the refresh token is revoked
- Password reset revokes all refresh tokens

### Login Attempt Tracking

Every login attempt (success or failure) is recorded in `LoginAttempt`:

```
LoginAttempt {
  id, userId, ipAddress, userAgent, success, reason, createdAt
}
```

This enables account monitoring, brute-force detection, and login history for users.

---

## Middleware: authenticate()

The `authenticate` middleware at `src/middleware/auth.js`:

```js
import { authenticate } from '../middleware/auth.js';

router.get('/profile', authenticate, controller.getProfile);
```

It:
1. Extracts the Bearer token from the `Authorization` header
2. Verifies the JWT signature and expiry via `verifyAccessToken()`
3. Looks up the user in the database (confirms ACTIVE status)
4. Attaches `req.user = { id, email, firstName, lastName, role, status }`

On failure, returns `401 Unauthorized` with error message.
