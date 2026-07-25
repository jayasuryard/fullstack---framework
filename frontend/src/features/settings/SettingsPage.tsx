import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/design-system';
import api from '@/lib/api';
import { PageHeader, Card, Input, Button } from '@/design-system';
import toast from 'react-hot-toast';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeOption = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const { user, loadProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<Record<string, { email: boolean; inApp: boolean }>>({});
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    api.get('/notification-preferences').then((res) => {
      const prefs: Record<string, { email: boolean; inApp: boolean }> = {};
      for (const p of res.data.data?.preferences ?? []) {
        prefs[p.type] = { email: p.email, inApp: p.inApp };
      }
      setNotifPrefs(prefs);
    }).catch(() => {});
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.patch('/users/me', profile);
      await loadProfile();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/users/me/password', passwords);
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifSave = async () => {
    setNotifLoading(true);
    try {
      const preferences = Object.entries(notifPrefs).map(([type, vals]) => ({ type, ...vals, push: false }));
      await api.put('/notification-preferences', { preferences });
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setNotifLoading(false);
    }
  };

  const notifTypes = ['general', 'billing', 'security', 'updates'];

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      {/* Profile */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Profile</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Update your personal information</p>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              required
            />
            <Input
              label="Last name"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
            <p className="flex h-9 items-center px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-500 dark:text-neutral-400">
              {user?.email}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed here</p>
          </div>
          <Input
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
          <div className="flex items-center gap-4">
            <Button type="submit" loading={profileLoading} size="sm">Save profile</Button>
            <div>
              <span className="text-xs text-neutral-500">Role: </span>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{user?.role}</span>
            </div>
          </div>
        </form>
      </Card>

      {/* Theme */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Appearance</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Choose how the interface looks</p>
        </div>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-600'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Notification preferences</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Control how you receive notifications</p>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          <div className="grid grid-cols-3 pb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Type</span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">Email</span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">In-app</span>
          </div>
          {notifTypes.map((type) => (
            <div key={type} className="grid grid-cols-3 items-center py-3">
              <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">{type}</span>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={notifPrefs[type]?.email ?? true}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, [type]: { ...p[type], email: e.target.checked } }))}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={notifPrefs[type]?.inApp ?? true}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, [type]: { ...p[type], inApp: e.target.checked } }))}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleNotifSave} loading={notifLoading} variant="secondary" size="sm">
          Save preferences
        </Button>
      </Card>

      {/* Change Password */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Change password</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Update your account password</p>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            required
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
          <Button type="submit" loading={pwLoading} size="sm">Update password</Button>
        </form>
      </Card>
    </div>
  );
}
