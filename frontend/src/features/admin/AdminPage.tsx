import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AdminStats } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data.stats as AdminStats;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const res = await api.get('/admin/user-analytics');
      return res.data.data.analytics;
    },
  });

  const roleData = analytics?.byRole?.map((r: any) => ({ name: r.role, value: r._count.id })) || [];
  const statusData = analytics?.byStatus?.map((s: any) => ({ name: s.status, value: s._count.id })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card"><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? 0}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Active Users</p><p className="text-3xl font-bold mt-1">{stats?.activeUsers ?? 0}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Files</p><p className="text-3xl font-bold mt-1">{stats?.totalFiles ?? 0}</p></div>
        <div className="card"><p className="text-sm text-gray-500">24h Logs</p><p className="text-3xl font-bold mt-1">{stats?.recentLogs ?? 0}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleData.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {statusData.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Users by Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
