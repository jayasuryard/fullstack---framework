/**
 * Application root — router + providers.
 *
 * How to add routes:
 *   1. Import your page component.
 *   2. Add a <Route> inside the matching role block below.
 *   3. Protect it with <PrivateRoute allowedRoles={[...]}>.
 *
 * Route convention (mirrors backend):
 *   /login               — unauthenticated
 *   /public/*            — unauthenticated public pages
 *   /admin/*             — admin role
 *   /superadmin/*        — superAdmin role
 *   /<role>/*            — other roles
 *   /dashboard           — redirects to role default after login
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { Loading } from './components/common'

// ── Page imports — add yours here ────────────────────────────────────────────
// import LoginPage from './pages/LoginPage'
// import DashboardPage from './pages/dashboard/DashboardPage'
import { lazy, Suspense } from 'react'
const DesignGallery = lazy(() => import('./components/designs/Gallery'))

// ── Role-default route helper (implement per product) ─────────────────────────
// Replace the placeholder text below with real redirects once you have routes.
function DefaultRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) {
    // Uncomment once you have a /login route:
    // return <Navigate to="/login" replace />
    return <div style={{ padding: 32 }}>Please add a /login route in App.jsx.</div>
  }
  // Map roles to their default landing page:
  // const roleRoutes = { admin: '/admin/dashboard', superAdmin: '/superadmin/dashboard' }
  // return <Navigate to={roleRoutes[user.role] || '/dashboard'} replace />
  return <div style={{ padding: 32 }}>Logged in as {user.name}. Add your routes in App.jsx.</div>
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────────── */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/public/*" element={<PublicPage />} /> */}

      {/* ── Design Gallery — browse all 10 landing page templates ───────────── */}
      <Route path="/designs" element={
        <Suspense fallback={<div style={{ padding: 32, color: '#fff', background: '#0D0D16', minHeight: '100vh' }}>Loading design gallery…</div>}>
          <DesignGallery />
        </Suspense>
      } />
      <Route path="/designs/:id" element={
        <Suspense fallback={<div style={{ padding: 32, color: '#fff', background: '#000', minHeight: '100vh' }}>Loading template…</div>}>
          <DesignGallery />
        </Suspense>
      } />

      {/* ── Protected — add role-specific routes inside PrivateRoute ─────────── */}
      {/* Example:
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin', 'superAdmin']}>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      */}

      {/* ── Fallback ─────────────────────────────────────────────────────────── */}
      <Route path="/" element={<DefaultRedirect />} />
      {/* Do NOT redirect * back to / — that creates an infinite loop when /login
          has no route yet. Render a plain 404 instead. */}
      <Route path="*" element={<div style={{ padding: 32 }}>404 — Page not found</div>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Add other Context providers here (e.g. ThemeProvider, TenantProvider) */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
