# Hooks

The frontend ships three hooks + the shared WS client. Product hooks extend these patterns.

## useAuth

**File:** `src/contexts/AuthContext.jsx` (exported from the context, requires `<AuthProvider>`)

```jsx
const { user, loading, login, logout, updateProfile, isAuthenticated, hasRole, isReadOnly } = useAuth()
```

| Value | Type | Purpose |
|-------|------|---------|
| `user` | object/null | current user (hydrated from localStorage, validated via `/me`) |
| `loading` | boolean | true until the mount-time `/me` check resolves |
| `login(userName, password)` | async | calls `api.common.login`, stores session, sets user |
| `logout()` | async | calls `api.common.logout`, clears session |
| `updateProfile(formData)` | async | calls `api.common.updateProfile`, merges into user |
| `isAuthenticated` | boolean | `!!user` |
| `hasRole(...roles)` | fn | `roles.includes(user?.role)` |
| `isReadOnly()` | fn | `user?.accessLevel === 'read_only'` |

Flow: `localStorage` hydration → `/me` validation on mount → automatic 401 recovery via `api.js`. Guards: `PrivateRoute` uses `hasRole`; edit controls use `isReadOnly`.

## useDataFetch

**File:** `src/hooks/useDataFetch.js`

```jsx
const { data, loading, error, refetch } = useDataFetch(
  () => api.admin.users.list({ page, limit }),
  [page, limit]
)
```

- `fetcher`: async fn returning the unwrapped `result` (no envelope handling needed).
- `deps`: array — changes trigger re-fetch.
- `refetch()`: manual re-run.
- Cancellation: in-flight result discarded on unmount or dep change (no state update races).

## useWebSocket

**File:** `src/hooks/useWebSocket.js`

```jsx
useWebSocket(`job:${jobId}`, (payload) => {
  if (payload.status === 'done') setDone(true)
}, { enabled: !!jobId })
```

- Subscribes to one channel for the component lifetime; handler kept fresh via ref (no socket teardown on handler change).
- `enabled`: gate subscriptions (e.g. wait for an id).
- Returns `{ isConnected }`.
- Cleanup unsubscribes on unmount.

## wsClient (shared client)

**File:** `src/server/ws.js`

```js
import { wsClient } from '../server/ws'

wsClient.onChannel('user:' + userId, (payload) => ...)   // auto-connects
wsClient.onStatus((state) => ...)                        // connecting | connected | reconnecting | closed
wsClient.subscribeChannel('job:' + jobId)
wsClient.unsubscribeChannel('job:' + jobId)
wsClient.disconnect()
```

- One socket for the whole app; channels tracked in a Set.
- URL: `wss?token=<access>&channels=<joined>` — token travels in the query string (browsers cannot set WS headers); latest rotated token used on reconnect.
- Reconnect: exponential backoff 500 ms → 30 s; intentional `disconnect()` stops it.

## Writing a Product Hook

Follow `useDataFetch` shape: refs for latest fetcher/handler, cancellation flag, stable `{ data, loading, error, refetch }` return. Keep fetch logic out of pages — compose `api.*` calls inside hooks.
