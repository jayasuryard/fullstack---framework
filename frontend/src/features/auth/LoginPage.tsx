import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card } from '@/design-system';
import { AuthLayout } from '@/design-system';
import OAuthButtons from '@/design-system/components/auth/OAuthButtons';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account" backTo={{ label: 'Back to home', href: '/' }}>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
              <Link to="/app/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </form>
      </Card>
      <div className="mt-4">
        <OAuthButtons mode="signin" />
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Don&apos;t have an account?{' '}
        <Link to="/app/signup" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
