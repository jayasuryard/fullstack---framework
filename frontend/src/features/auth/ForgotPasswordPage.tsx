import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button, Input, Card, AuthLayout } from '@/design-system';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link"
      backTo={{ label: 'Back to sign in', href: '/app/login' }}
    >
      {sent ? (
        <Card className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-950">
            <CheckCircle className="h-6 w-6 text-success-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Check your email</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
          </div>
          <Link to="/app/login" className="block">
            <Button variant="secondary" className="w-full">Back to sign in</Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Button type="submit" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        </Card>
      )}
      <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Remember your password?{' '}
        <Link to="/app/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
