/**
 * Main desktop layout shell (sidebar + outlet).
 * To use: wrap role-specific routes with <MainLayout /> and define YOUR_NAV_ITEMS below.
 */
import { useState } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Define your product's navigation items here.
// Shape: [{ label: string, path: string, icon: ReactNode, roles: string[] }]
const NAV_ITEMS = [
  // { label: 'Dashboard', path: '/dashboard', icon: null, roles: ['admin', 'superAdmin'] },
]

export const MainLayout = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(user?.role)
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-200 bg-white border-r flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <span className="font-bold text-lg">App Name</span>}
          <button onClick={() => setSidebarOpen(o => !o)} className="p-1 rounded hover:bg-gray-100">
            ☰
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="text-xs text-gray-500 mb-2 truncate">{user?.name} ({user?.role})</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded"
          >
            {sidebarOpen ? 'Sign out' : '→'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
