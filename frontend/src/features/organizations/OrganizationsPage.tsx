import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Organizations</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">Create organization</button>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">New Organization</h2>
          <div className="space-y-3">
            <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
            <input className="input-field" placeholder="Website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
            <button onClick={() => createOrg.mutate()} disabled={!form.name} className="btn-primary text-sm">Create</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(data || []).map((org: any) => (
          <div key={org.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{org.name}</h3>
                <p className="text-sm text-gray-500">{org.slug}</p>
              </div>
              <div className="flex gap-2 items-center">
                <input className="input-field text-sm w-48" placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <button onClick={() => inviteMember.mutate(org.id)} disabled={!inviteEmail} className="btn-secondary text-sm">Invite</button>
              </div>
            </div>
            {org.members?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Members</p>
                <div className="space-y-2">
                  {org.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">{getInitials(m.user.firstName, m.user.lastName)}</div>
                      <span className="text-sm">{m.user.firstName} {m.user.lastName}</span>
                      <span className="text-xs text-gray-400">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {(!data || data.length === 0) && <div className="card text-center py-8 text-gray-500">No organizations yet</div>}
      </div>
    </div>
  );
}
