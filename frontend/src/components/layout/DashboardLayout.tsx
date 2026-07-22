import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: '▦' },
  { label: 'Users', path: '/app/users', icon: '⊙' },
  { label: 'Organizations', path: '/app/organizations', icon: '◆' },
  { label: 'AI Chat', path: '/app/ai', icon: '✦' },
  { label: 'Billing', path: '/app/billing', icon: '₿' },
  { label: 'Notifications', path: '/app/notifications', icon: '◉' },
  { label: 'Settings', path: '/app/settings', icon: '⚙' },
  { label: 'Admin', path: '/app/admin', icon: '▲' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/app/dashboard" className="text-xl font-bold text-primary-600">RF</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const show = item.label === 'Admin' ? (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') : true;
            if (!show) return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="h-16 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex items-center justify-end px-6 gap-4 shrink-0">
          <Link to="/app/settings" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Settings</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Sign out
          </button>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
