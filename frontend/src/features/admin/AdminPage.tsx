import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, StatCard, Card, Skeleton, EmptyState } from '@/design-system';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Activity, Shield, AlertTriangle } from 'lucide-react';
import type { AdminStats } from '@/types';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await api.get('/admin/stats'); return res.data.data.stats as AdminStats; },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => { const res = await api.get('/admin/user-analytics'); return res.data.data.analytics; },
  });

  const roleData = analytics?.byRole?.map((r: any) => ({ name: r.role, value: r._count.id })) ?? [];
  const statusData = analytics?.byStatus?.map((s: any) => ({ name: s.status, value: s._count.id })) ?? [];

  if (statsError) {
    return (
      <div>
        <PageHeader title="Admin" description="System overview and analytics" />
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10 text-danger-400" />}
          title="Failed to load admin data"
          description="You may not have permission to view this page, or there was a server error."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Admin" description="System overview and analytics" />

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard title="Active Users" value={stats?.activeUsers ?? 0} icon={<Shield className="h-4 w-4" />} />
          <StatCard title="Total Files" value={stats?.totalFiles ?? 0} icon={<FileText className="h-4 w-4" />} />
          <StatCard title="Logs (24h)" value={stats?.recentLogs ?? 0} icon={<Activity className="h-4 w-4" />} />
        </div>
      )}

      {analyticsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roleData.length > 0 && (
            <Card className="space-y-4">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Users by Role</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-neutral-500" />
                    <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-neutral-500" />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }}
                      cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                    />
                    <Bar dataKey="value" name="Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
          {roleData.length === 0 && statusData.length === 0 && (
            <div className="col-span-2">
              <EmptyState title="No analytics data" description="User analytics will appear here once users are active in the system." />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
