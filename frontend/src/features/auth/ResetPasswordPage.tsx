import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button, Input, Card, AuthLayout } from '@/design-system';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is invalid or has expired">
        <Card className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-950">
            <AlertCircle className="h-6 w-6 text-danger-600" />
          </div>
          <p className="text-sm text-neutral-500">
            Request a new password reset link from the forgot password page.
          </p>
          <Link to="/app/forgot-password">
            <Button className="w-full">Request new link</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: passwords.password });
      toast.success('Password reset successfully');
      navigate('/app/login', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password below"
      backTo={{ label: 'Back to sign in', href: '/app/login' }}
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={passwords.password}
            onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
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
          <Button type="submit" loading={loading} className="w-full">
            Reset password
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
