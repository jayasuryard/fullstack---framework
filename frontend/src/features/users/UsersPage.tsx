import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse, User } from '@/types';
import { PageHeader, Avatar, Badge, Table } from '@/design-system';

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>('/users');
      return res.data;
    },
  });

  const columns = [
    {
      key: 'user',
      header: 'User',
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar initials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`} size="sm" />
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user: User) => <Badge variant="primary">{user.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: User) => (
        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>{user.status}</Badge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (user: User) => <span className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(user.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Users" description={`${data?.pagination?.total ?? 0} total users`} />
      <Table columns={columns} data={data?.data || []} loading={isLoading} />
    </div>
  );
}
