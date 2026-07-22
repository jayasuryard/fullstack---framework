import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { PageHeader, Card, Input, Button } from '@/design-system';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/me/password', passwords);
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your account settings" />

      <Card className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Profile</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Name</p>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email</p>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Role</p>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">{user?.role}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current password" type="password" value={passwords.currentPassword}
            onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
          <Input label="New password" type="password" value={passwords.newPassword}
            onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
          <Input label="Confirm new password" type="password" value={passwords.confirmPassword}
            onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
          <Button type="submit" loading={loading}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
