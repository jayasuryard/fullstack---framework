import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card } from '@/design-system';
import { AuthLayout } from '@/design-system';
import OAuthButtons from '@/design-system/components/auth/OAuthButtons';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <AuthLayout title="Create Account" subtitle="Get started with RyoFramework" backTo={{ label: 'Back to home', href: '/' }}>
      <div className="mb-4">
        <OAuthButtons mode="signup" />
      </div>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">or sign up with email</span>
        </div>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={update('firstName')} required />
            <Input label="Last name" value={form.lastName} onChange={update('lastName')} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={update('email')} required />
          <Input label="Password" type="password" value={form.password} onChange={update('password')} required minLength={8} />
          <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required />
          <Button type="submit" loading={loading} className="w-full">Create account</Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account?{' '}
        <Link to="/app/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
