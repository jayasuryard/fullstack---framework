import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader, Card, Button, EmptyState, Skeleton } from '@/design-system';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('All marked as read');
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const notifications: Notification[] = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        actions={
          unreadCount > 0 ? (
            <Button
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
              variant="secondary"
              size="sm"
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : isError ? (
        <Card className="text-center py-8">
          <p className="text-sm text-neutral-500">Failed to load notifications</p>
        </Card>
      ) : notifications.length ? (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              onClick={() => !notification.read && markRead.mutate(notification.id)}
              className={`cursor-pointer transition-colors ${
                !notification.read
                  ? 'border-primary-200 bg-primary-50/50 dark:border-primary-900 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
              }`}
              padding="md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {!notification.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                  )}
                  <div className={notification.read ? 'ml-5' : ''}>
                    <p className={`text-sm ${notification.read ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-900 dark:text-neutral-100 font-medium'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{notification.message}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0 mt-0.5">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="No notifications"
          description="You're all caught up. Notifications will appear here when there's activity."
        />
      )}
    </div>
  );
}
