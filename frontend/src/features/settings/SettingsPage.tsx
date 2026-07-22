import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Settings</h1>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
          <div>
            <label className="label">Role</label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input type="password" className="input-field" value={passwords.currentPassword}
              onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" className="input-field" value={passwords.newPassword}
              onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input type="password" className="input-field" value={passwords.confirmPassword}
              onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
