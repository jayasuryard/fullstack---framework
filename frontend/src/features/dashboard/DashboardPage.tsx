import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data.dashboard as DashboardData;
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unread Notifications</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{data?.unreadNotifications ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recent Files</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{data?.recentFiles?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recent Activities</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{data?.recentActivities?.length ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Recent Activity</h2>
          {data?.recentActivities?.length ? (
            <div className="space-y-3">
              {data.recentActivities.map((activity) => (
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
          {data?.recentFiles?.length ? (
            <div className="space-y-3">
              {data.recentFiles.map((file) => (
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
