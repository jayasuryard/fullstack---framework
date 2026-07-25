import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/design-system';
import { AppShell, Avatar } from '@/design-system';
import { cn } from '@/design-system';
import api from '@/lib/api';
import { LayoutDashboard, Users, Building2, Bot, CreditCard, Bell, Settings, Shield, LogOut, Sun, Moon } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/app/users', icon: Users },
  { label: 'Organizations', path: '/app/organizations', icon: Building2 },
  { label: 'AI Chat', path: '/app/ai', icon: Bot },
  { label: 'Billing', path: '/app/billing', icon: CreditCard },
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Settings', path: '/app/settings', icon: Settings },
  { label: 'Admin', path: '/app/admin', icon: Shield, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data.data.count as number;
    },
    refetchInterval: 30_000,
  });

  const unreadCount = unreadData ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-5 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-xs font-bold text-white">RF</div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">RyoFramework</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') return null;
          const active = location.pathname === item.path;
          const Icon = item.icon;
          const isNotif = item.path === '/app/notifications';
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-800 dark:text-neutral-50'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isNotif && unreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
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
    <div className="flex items-center justify-end px-6 h-full gap-3">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return <AppShell sidebar={sidebar} navbar={navbar}>{children}</AppShell>;
}
