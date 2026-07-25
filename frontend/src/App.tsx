import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LandingLayout from '@/components/layout/LandingLayout';
import { Skeleton } from '@/design-system';

// Eagerly load auth pages (needed immediately on cold visit)
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import OAuthCallback from '@/features/auth/OAuthCallback';

// Lazy load everything else — code-split per route
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const OrganizationsPage = lazy(() => import('@/features/organizations/OrganizationsPage'));
const AdminPage = lazy(() => import('@/features/admin/AdminPage'));
const BillingPage = lazy(() => import('@/features/billing/BillingPage'));
const AiChatPage = lazy(() => import('@/features/ai/AiChatPage'));

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>;
  if (!user) return <Navigate to="/app/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>;
  if (!user) return <Navigate to="/app/login" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<Suspense fallback={null}><LandingPage /></Suspense>} />
        <Route path="pricing" element={<Suspense fallback={null}><LandingPage /></Suspense>} />
        <Route path="features" element={<Suspense fallback={null}><LandingPage /></Suspense>} />
        <Route path="docs" element={<Suspense fallback={null}><LandingPage /></Suspense>} />
      </Route>

      {/* Auth (eager — no extra chunk) */}
      <Route path="/app/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/app/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/app/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/app/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Protected app routes (lazy) */}
      <Route path="/app/dashboard" element={<ProtectedRoute><WithLayout><DashboardPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/users" element={<ProtectedRoute><WithLayout><UsersPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/organizations" element={<ProtectedRoute><WithLayout><OrganizationsPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><WithLayout><SettingsPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/notifications" element={<ProtectedRoute><WithLayout><NotificationsPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/billing" element={<ProtectedRoute><WithLayout><BillingPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/ai" element={<ProtectedRoute><WithLayout><AiChatPage /></WithLayout></ProtectedRoute>} />
      <Route path="/app/admin" element={<AdminRoute><WithLayout><AdminPage /></WithLayout></AdminRoute>} />

      {/* Fallbacks */}
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
