import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { PaginatedResponse, Notification } from '@/types';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Notification>>('/notifications');
      return res.data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading notifications...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Notifications</h1>
        <button onClick={() => markAllRead.mutate()} className="btn-secondary text-sm">
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {data?.data?.length ? (
          data.data.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && markRead.mutate(notification.id)}
              className={`card cursor-pointer transition-colors ${
                !notification.read ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                </div>
                <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{formatDate(notification.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
