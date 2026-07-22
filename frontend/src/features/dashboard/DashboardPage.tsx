import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { DashboardData, AdminStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data.dashboard as DashboardData;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data.stats as AdminStats;
    },
    enabled: isAdmin,
  });

  const { data: userAnalytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const res = await api.get('/admin/user-analytics');
      return res.data.data.analytics;
    },
    enabled: isAdmin,
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;

  const roleChartData = userAnalytics?.byRole?.map((r: any) => ({
    name: r.role,
    value: r._count.id,
  })) || [];

  const statusChartData = userAnalytics?.byStatus?.map((s: any) => ({
    name: s.status,
    value: s._count.id,
  })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unread Notifications</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{dashboardData?.unreadNotifications ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recent Files</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{dashboardData?.recentFiles?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recent Activities</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{dashboardData?.recentActivities?.length ?? 0}</p>
        </div>
        {isAdmin && (
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{statsData?.totalUsers ?? 0}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {roleChartData.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Users by Role</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {statusChartData.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Users by Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusChartData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recent Activity</h2>
          {dashboardData?.recentActivities?.length ? (
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(activity.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recent Files</h2>
          {dashboardData?.recentFiles?.length ? (
            <div className="space-y-3">
              {dashboardData.recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{file.originalName}</div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(file.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No files uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}
