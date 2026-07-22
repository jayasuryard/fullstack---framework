# Frontend Overview

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | 6.26 | Client-side routing |
| TanStack Query | 5.56 | Server state management |
| Axios | 1.7 | HTTP client |
| GSAP | 3.12 | Animations |
| Lenis | 1.1 | Smooth scrolling |
| Radix UI | latest | Headless primitives (dialog, select, switch, tabs, accordion, tooltip, etc.) |
| Lucide React | 0.446 | Icon library |
| React Hook Form | 7.53 | Form state management |
| Zod | 3.23 | Schema validation |
| Recharts | 2.12 | Charts |
| react-hot-toast | 2.4 | Toast notifications |

## Folder Structure

```
src/
├── App.tsx                      # Root component with route definitions
├── main.tsx                     # Entry point with providers
├── components/
│   ├── layout/                  # App-level layouts
│   │   ├── DashboardLayout.tsx   # Sidebar + navbar app shell
│   │   └── LandingLayout.tsx     # Public marketing layout
│   ├── shared/                  # Shared page-specific components
│   └── ui/                      # (legacy, components migrated to design-system)
├── design-system/
│   ├── index.ts                 # Public barrel export
│   ├── utils.ts                 # cn() utility
│   ├── tokens/                  # Design tokens (JS modules)
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   ├── radius.js
│   │   └── shadows.js
│   ├── components/
│   │   ├── ui/                  # 27 primitive components
│   │   ├── layout/              # AppShell, Container, PageHeader
│   │   ├── forms/               # FormField
│   │   ├── data-display/        # StatCard
│   │   ├── auth/                # AuthLayout, OAuthButtons
│   │   └── ai/                  # Chat
│   ├── providers/
│   │   └── ThemeProvider.tsx     # Light/dark/system mode
│   ├── hooks/                   # useBreakpoint, useClipboard, etc.
│   └── animations/              # GSAP helpers + Lenis hooks
├── features/                    # Feature modules (domain-specific)
│   ├── landing/                 # Marketing pages
│   ├── auth/                    # Login, signup, OAuth callback
│   ├── dashboard/               # Dashboard page
│   ├── users/                   # User management
│   ├── organizations/           # Organization management
│   ├── settings/                # User/app settings
│   ├── notifications/           # Notifications list
│   ├── admin/                   # Admin panel
│   ├── billing/                 # Subscription & billing
│   ├── ai/                      # AI chat
│   └── files/                   # File management
├── hooks/                       # Global hooks
│   └── useAuth.tsx              # Auth context & provider
├── lib/                         # Core utilities
│   ├── api.ts                   # Axios instance + interceptors
│   ├── auth.ts                  # Auth API functions
│   └── utils.ts                 # formatBytes, formatDate, getInitials
├── types/                       # TypeScript type definitions
│   └── index.ts
└── styles/
    └── globals.css              # Tailwind directives + base styles
```

## Routing Architecture

Routing is built with **React Router v6** using a flat `<Routes>` structure with nested layouts.

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/app/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/app/login" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')
    return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="pricing" element={<LandingPage />} />
        <Route path="features" element={<LandingPage />} />
        <Route path="docs" element={<LandingPage />} />
      </Route>

      {/* Auth routes (public redirect) */}
      <Route path="/app/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/app/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected dashboard routes */}
      <Route path="/app/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/users" element={<ProtectedRoute><DashboardLayout><UsersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/organizations" element={<ProtectedRoute><DashboardLayout><OrganizationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/notifications" element={<ProtectedRoute><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/billing" element={<ProtectedRoute><DashboardLayout><BillingPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/ai" element={<ProtectedRoute><DashboardLayout><AiChatPage /></DashboardLayout></ProtectedRoute>} />

      {/* Admin route */}
      <Route path="/app/admin" element={<AdminRoute><DashboardLayout><AdminPage /></DashboardLayout></AdminRoute>} />

      {/* OAuth callback */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Default redirects */}
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

### Route Guards

| Guard | Behavior |
|-------|----------|
| `ProtectedRoute` | Redirects unauthenticated users to `/app/login` |
| `PublicRoute` | Redirects authenticated users to `/app/dashboard` |
| `AdminRoute` | Checks for `ADMIN` or `SUPER_ADMIN` role; redirects others to dashboard |

## State Management

### Server State: TanStack Query

All server data is managed through **TanStack Query** v5 with a globally configured client:

```tsx
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
});
```

Example usage in a feature:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

function UsersList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data.data),
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

### Auth State: Context

Authentication state is managed via React Context in `useAuth.tsx`:

```tsx
const { user, loading, login, signup, logout, loadProfile } = useAuth();
```

## API Layer

The API layer is built on **Axios** with an instance configured at `src/lib/api.ts`:

```tsx
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

Key behaviors:
- **401 interceptor** automatically attempts a token refresh using the stored refresh token
- If refresh fails, tokens are cleared and the user is redirected to `/login`
- The base URL is proxied through Vite's dev server to `http://localhost:4000`

Auth library functions (`src/lib/auth.ts`):

```tsx
import api from './api';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const data = res.data.data;
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
}

export async function signup(data: SignupData) { /* similar pattern */ }
export async function logout() { /* clears tokens */ }
export async function getProfile() { /* GET /auth/me */ }
export function isAuthenticated() { return !!localStorage.getItem('accessToken'); }
```

## Provider Hierarchy

The order of providers in `src/main.tsx` is significant and must be maintained:

```tsx
<BrowserRouter>
  <ThemeProvider>           {/* Theme context for light/dark/system */}
    <QueryClientProvider>   {/* TanStack Query for server state */}
      <AuthProvider>        {/* Auth context (user, login, logout) */}
        <App />
        <ToastProvider />   {/* react-hot-toast */}
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
</BrowserRouter>
```

## Design System Philosophy

The design system is built on three layers:

1. **Tokens** — Raw design values (colors, typography, spacing, radius, shadows) defined as JS modules
2. **Primitives** — Accessible, unstyled Radix UI components wrapped with design system styling
3. **Compositions** — Higher-level patterns (AppShell, PageHeader, FormField) that compose primitives

Key principles:
- All components use the `cn()` utility for class merging
- Dark mode is handled via Tailwind's `dark:` variant with `class` strategy
- Components accept standard HTML attributes and forward refs via `forwardRef`
- Every component has full TypeScript generics where applicable
- Accessibility is ensured through Radix UI primitives (ARIA attributes, keyboard navigation, focus management)
- Animations use `tailwindcss-animate` for mount/unmount transitions
