import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader, Card, Button, Input, Badge, Avatar } from '@/design-system';
import toast from 'react-hot-toast';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', website: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  const { data } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => { const res = await api.get('/organizations'); return res.data.data.organizations; },
  });

  const createOrg = useMutation({
    mutationFn: () => api.post('/organizations', form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['organizations'] }); setShowCreate(false); setForm({ name: '', slug: '', website: '' }); toast.success('Organization created'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const inviteMember = useMutation({
    mutationFn: (orgId: string) => api.post(`/organizations/${orgId}/invite`, { email: inviteEmail, role: 'MEMBER' }),
    onSuccess: () => { setInviteEmail(''); toast.success('Invitation sent'); },
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

      <div className="space-y-4">
        {(data || []).map((org: any) => (
          <Card key={org.id}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{org.name}</h3>
                <p className="text-xs text-neutral-500">{org.slug}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-48" />
                <Button onClick={() => inviteMember.mutate(org.id)} disabled={!inviteEmail} variant="secondary" size="sm">Invite</Button>
              </div>
            </div>
            {org.members?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Members</p>
                <div className="space-y-2">
                  {org.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <Avatar initials={`${m.user.firstName?.[0] || ''}${m.user.lastName?.[0] || ''}`} size="sm" />
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">{m.user.firstName} {m.user.lastName}</span>
                      <Badge variant="default">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
        {(!data || data.length === 0) && (
          <Card className="text-center py-8 text-neutral-500">No organizations yet</Card>
        )}
      </div>
    </div>
  );
}
