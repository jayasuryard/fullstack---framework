import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LandingLayout from '@/components/layout/LandingLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import UsersPage from '@/features/users/UsersPage';
import SettingsPage from '@/features/settings/SettingsPage';
import NotificationsPage from '@/features/notifications/NotificationsPage';
import OrganizationsPage from '@/features/organizations/OrganizationsPage';
import AdminPage from '@/features/admin/AdminPage';
import BillingPage from '@/features/billing/BillingPage';
import AiChatPage from '@/features/ai/AiChatPage';
import OAuthCallback from '@/features/auth/OAuthCallback';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/app/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/app/login" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="pricing" element={<LandingPage />} />
        <Route path="features" element={<LandingPage />} />
        <Route path="docs" element={<LandingPage />} />
      </Route>
      <Route path="/app/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/app/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/app/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/users" element={<ProtectedRoute><DashboardLayout><UsersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/organizations" element={<ProtectedRoute><DashboardLayout><OrganizationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/notifications" element={<ProtectedRoute><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/billing" element={<ProtectedRoute><DashboardLayout><BillingPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/ai" element={<ProtectedRoute><DashboardLayout><AiChatPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/admin" element={<AdminRoute><DashboardLayout><AdminPage /></DashboardLayout></AdminRoute>} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
