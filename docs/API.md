# API Documentation

## Base URL
`http://localhost:4000/api`

## Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/signup` | Register |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Forgot password |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Get current user |

### User Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | User | Get profile |
| PATCH | `/users/me` | User | Update profile |
| POST | `/users/me/password` | User | Change password |
| GET | `/users` | Admin | List users |
| GET | `/users/:id` | Admin | Get user |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Super | Delete user |

### Notification Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count |
| POST | `/notifications/mark-all-read` | Mark all read |
| PATCH | `/notifications/:id/read` | Mark one read |
| DELETE | `/notifications/:id` | Delete notification |

### File Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files/upload` | Upload file |
| GET | `/files` | List files |
| DELETE | `/files/:id` | Delete file |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard stats |
| GET | `/admin/user-analytics` | User analytics |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | User dashboard |
| GET | `/settings` | List settings |
| GET | `/settings/:key` | Get setting |
| PUT | `/settings/:key` | Update setting |
| GET | `/audit-logs` | List audit logs |
| GET | `/activities` | List activities |
| GET | `/search?q=query` | Global search |
| POST | `/ai/chat` | AI chat |
| POST | `/ai/stream` | AI stream |

## Response Format
Success:
```json
{ "success": true, "message": "...", "data": {} }
```

Error:
```json
{ "success": false, "message": "...", "details": [] }
```

Paginated:
```json
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }
```
