import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import { PageHeader, Avatar, Badge, Table, EmptyState } from '@/design-system';

export default function UsersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await api.get(`/users?page=${page}&limit=20`);
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const columns = [
    {
      key: 'user',
      header: 'User',
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar initials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`} size="sm" />
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user.firstName} {user.lastName}
            </p>
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
        <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'danger' : 'warning'}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (user: User) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(user.createdAt)}</span>
      ),
    },
  ];

  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  if (isError) {
    return (
      <div>
        <PageHeader title="Users" description="Manage your users" />
        <EmptyState title="Failed to load users" description="There was an error loading users. Please try again." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" description={`${total} total user${total !== 1 ? 's' : ''}`} />
      <Table
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="No users found"
        pagination={totalPages > 1 ? { page, totalPages, onPageChange: setPage } : undefined}
      />
    </div>
  );
}
