import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader, Card, Button } from '@/design-system';
import toast from 'react-hot-toast';
import type { PaginatedResponse, Notification } from '@/types';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Notification>>('/notifications');
      return res.data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Stay updated with the latest activity"
        actions={<Button onClick={() => markAllRead.mutate()} variant="secondary" size="sm">Mark all read</Button>}
      />
      <div className="space-y-2">
        {data?.data?.length ? (
          data.data.map((notification) => (
            <Card
              key={notification.id}
              onClick={() => !notification.read && markRead.mutate(notification.id)}
              className={`cursor-pointer transition-colors ${!notification.read ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/30' : ''}`}
              padding="md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {!notification.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" />}
                  <div>
                    <p className={`text-sm ${notification.read ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-900 dark:text-neutral-100 font-medium'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{notification.message}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 ml-4 whitespace-nowrap shrink-0">{formatDate(notification.createdAt)}</span>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">No notifications</p>
          </Card>
        )}
      </div>
    </div>
  );
}
