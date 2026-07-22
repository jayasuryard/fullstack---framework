import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import OAuthButtons from '@/components/shared/OAuthButtons';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
            &larr; Back to home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Get started with RyoFramework</p>
        </div>
        <div className="mb-4">
          <OAuthButtons mode="signup" />
        </div>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">or sign up with email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input className="input-field" value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div>
              <label className="label">Last name</label>
              <input className="input-field" value={form.lastName} onChange={update('lastName')} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input-field" value={form.password} onChange={update('password')} required minLength={8} />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className="input-field" value={form.confirmPassword} onChange={update('confirmPassword')} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/app/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
