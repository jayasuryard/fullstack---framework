import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, StatCard, Card } from '@/design-system';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Activity, Shield } from 'lucide-react';
import type { AdminStats } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await api.get('/admin/stats'); return res.data.data.stats as AdminStats; },
  });

  const { data: analytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => { const res = await api.get('/admin/user-analytics'); return res.data.data.analytics; },
  });

  const roleData = analytics?.byRole?.map((r: any) => ({ name: r.role, value: r._count.id })) || [];
  const statusData = analytics?.byStatus?.map((s: any) => ({ name: s.status, value: s._count.id })) || [];

  return (
    <div>
      <PageHeader title="Admin" description="System overview and analytics" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Active Users" value={stats?.activeUsers ?? 0} icon={<Shield className="h-4 w-4" />} />
        <StatCard title="Total Files" value={stats?.totalFiles ?? 0} icon={<FileText className="h-4 w-4" />} />
        <StatCard title="24h Logs" value={stats?.recentLogs ?? 0} icon={<Activity className="h-4 w-4" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleData.length > 0 && (
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Users by Role</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {statusData.length > 0 && (
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Users by Status</h2>
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
          </Card>
        )}
      </div>
    </div>
  );
}
