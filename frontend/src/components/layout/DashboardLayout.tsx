import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell, Avatar } from '@/design-system';
import { cn } from '@/design-system';
import { LayoutDashboard, Users, Building2, Bot, CreditCard, Bell, Settings, Shield, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/app/users', icon: Users },
  { label: 'Organizations', path: '/app/organizations', icon: Building2 },
  { label: 'AI Chat', path: '/app/ai', icon: Bot },
  { label: 'Billing', path: '/app/billing', icon: CreditCard },
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Settings', path: '/app/settings', icon: Settings },
  { label: 'Admin', path: '/app/admin', icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/app/dashboard" className="text-xl font-bold text-primary-600">RF</Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const show = item.label === 'Admin' ? (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') : true;
          if (!show) return null;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              )}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Avatar initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const navbar = (
    <div className="flex items-center justify-end px-6 h-full gap-4">
      <Link to="/app/settings" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">Settings</Link>
      <button onClick={handleLogout} className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1">
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </div>
  );

  return <AppShell sidebar={sidebar} navbar={navbar}>{children}</AppShell>;
}
