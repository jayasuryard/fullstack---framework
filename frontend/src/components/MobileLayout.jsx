/**
 * Mobile layout shell (bottom nav + outlet).
 * Source: Product/frontend/src/components/MobileLayout.jsx (structural pattern extracted)
 * Generalization: product-specific nav items removed — define YOUR_MOBILE_NAV_ITEMS below.
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Define your product's mobile nav items here (keep to 4-5 max).
// Shape: [{ label: string, path: string, icon: ReactNode, roles: string[] }]
const MOBILE_NAV_ITEMS = [
  // { label: 'Home', path: '/dashboard', icon: null, roles: ['admin'] },
]

export const MobileLayout = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const visibleItems = MOBILE_NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(user?.role)
  )

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
