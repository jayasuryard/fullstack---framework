# Frontend Overview

React 19 SPA built with Vite 7 (SWC), Tailwind CSS 4, and React Router 7. Plain JavaScript/JSX — no TypeScript in app code (the only TSX lives in `src/components/designs/` templates).

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| React Router | 7 | client routing |
| Vite | 7 (SWC) | build + dev server |
| Tailwind CSS | 4 (Vite plugin) | styling, no config file |
| framer-motion | 12 | animations |
| Phosphor / lucide-react / react-icons | — | icons |
| react-calendar | 6 | date picker |
| react-easy-crop | 5 | avatar crop |
| recharts | 3 | dashboard charts |
| Vitest | 4 | tests |

## Core Principles

- **No axios, no React Query, no Redux/Zustand.** Native `fetch` + Context + useState.
- **Single API gateway**: every request goes through `src/server/api.js` — automatic auth headers, token refresh, envelope unwrapping, `FormData`/query/path-param handling.
- **Single WS client**: `src/server/ws.js` (`wsClient`) — one socket, channel subscriptions, reconnect with backoff.
- **Lazy pages**: route-level code splitting via `React.lazy` + `Suspense`; Vite `manualChunks` split vendor code (react, animation, icon libs).
- **Barrel imports**: UI primitives from `src/components/common/index.js`.

## App Shell

- `src/main.jsx` — entry, mounts `<AuthProvider>` + router.
- `src/App.jsx` — route table + `DefaultRedirect` (role → default route). Pages are lazy.
- `src/contexts/AuthContext.jsx` — global auth state: hydrates user from `localStorage`, validates via `GET /me` on mount, exposes `login`/`logout`/`updateProfile`/`hasRole`/`isReadOnly`.
- `src/components/PrivateRoute.jsx` — protected route wrapper; `allowedRoles` prop redirects unauthenticated → `/login`, wrong-role → role default.

## Routing Conventions

| Pattern | Meaning |
|---------|---------|
| `/login`, `/forgot-password`, `/reset-password` | public auth pages |
| `/admin/*`, `/superadmin/*` | role-scoped sections |
| `/public/*` | public content |
| `/designs`, `/designs/:id` | landing template gallery |
| `*` | 404 page |

## Data Flow

```
Page → useDataFetch(() => api.module.list(query), [deps])
     → api.js request() → fetch /api/v1/...
     → responseCode 1000/1012 → responseData.result → page
     → else → ApiError thrown (toast)
     → HTTP 401 or code 1010 → singleton refresh → retry once
```

## Realtime Flow

```
useWebSocket('job:' + jobId, handler)
  → wsClient.subscribeChannel → /ws?token=...&channels=...
  → { type: 'event', channel, payload } → handler(payload)
```

## Serving

- Dev: Vite dev server, proxies `/api` + `/ws` → `http://localhost:3000`.
- Prod: `frontend/server.js` (Express SPA host, port 8080, non-root) or `nginx.conf` static host. Both set cache headers (hashed assets immutable 1 y, HTML no-cache) and inject OG meta per subdomain.

## Scripts

```bash
npm run dev          # vite
npm run build        # vite build
npm run lint         # eslint .
npm run typecheck    # tsc --noEmit (designs TSX)
npm test             # vitest run
npm run preview      # vite preview
```
