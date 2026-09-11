// src/pages/dashboard/DashboardPage.jsx
// Placeholder landing page for authenticated roles. Replace with real widgets.
import { useAuth } from '../../contexts/AuthContext'
import { Card, OrganizationSwitcher } from '../../components/common'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#0B0B16] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name || user?.email}
          </h1>
          <p className="text-sm text-white/50">
            Role: {user?.role} · Access: {user?.accessLevel}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Your app">Build your product on this scaffold</Card>
        <Card title="Auth ready">Login, refresh rotation, lockout, OTP reset all wired</Card>
        <Card title="Next step">Add a module: npm run gen:module &lt;name&gt;</Card>
      </div>
    </div>
  )
}
