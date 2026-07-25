import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, Card, Button, Input, Badge, Avatar, EmptyState, Skeleton } from '@/design-system';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', website: '' });
  const [inviteEmails, setInviteEmails] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => { const res = await api.get('/organizations'); return res.data.data.organizations; },
  });

  const createOrg = useMutation({
    mutationFn: () => api.post('/organizations', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreate(false);
      setForm({ name: '', slug: '', website: '' });
      toast.success('Organization created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create'),
  });

  const inviteMember = useMutation({
    mutationFn: ({ orgId, email }: { orgId: string; email: string }) =>
      api.post(`/organizations/${orgId}/invite`, { email, role: 'MEMBER' }),
    onSuccess: (_data, vars) => {
      setInviteEmails((prev) => ({ ...prev, [vars.orgId]: '' }));
      toast.success('Invitation sent');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to invite'),
  });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Organizations" description="Manage your organizations and members"
        actions={<Button onClick={() => setShowCreate(!showCreate)} size="sm">
          {showCreate ? 'Cancel' : 'Create organization'}
        </Button>}
      />

      {showCreate && (
        <Card className="mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">New Organization</h2>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
          <Input placeholder="Website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
          <Button onClick={() => createOrg.mutate()} disabled={!form.name} size="sm">Create</Button>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {(data || []).map((org: any) => {
            const email = inviteEmails[org.id] ?? '';
            return (
              <Card key={org.id}>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{org.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{org.slug}</p>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <Input
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setInviteEmails((prev) => ({ ...prev, [org.id]: e.target.value }))}
                      className="w-48"
                    />
                    <Button
                      onClick={() => inviteMember.mutate({ orgId: org.id, email })}
                      disabled={!email}
                      loading={inviteMember.isPending}
                      variant="secondary"
                      size="sm"
                    >
                      Invite
                    </Button>
                  </div>
                </div>
                {org.members?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                      Members ({org.members.length})
                    </p>
                    <div className="space-y-2">
                      {org.members.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <Avatar initials={`${m.user?.firstName?.[0] || ''}${m.user?.lastName?.[0] || ''}`} size="sm" />
                          <span className="text-sm text-neutral-900 dark:text-neutral-100">
                            {m.user?.firstName} {m.user?.lastName}
                          </span>
                          <Badge variant="default">{m.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {(!data || data.length === 0) && (
            <EmptyState
              icon={<Building2 className="h-10 w-10" />}
              title="No organizations yet"
              description="Create your first organization to collaborate with your team."
              action={<Button size="sm" onClick={() => setShowCreate(true)}>Create organization</Button>}
            />
          )}
        </div>
      )}
    </div>
  );
}
