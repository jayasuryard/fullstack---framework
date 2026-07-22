import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Spinner } from '@/design-system';
import { AlertCircle } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadProfile } = useAuth();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (token && refreshToken) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      loadProfile().then(() => {
        navigate('/app/dashboard', { replace: true });
      });
    } else {
      setStatus('error');
      setErrorMessage('Authentication failed. No tokens received.');
    }
  }, [searchParams, navigate, loadProfile]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <Card className="text-center max-w-sm w-full">
        {status === 'processing' ? (
          <>
            <Spinner size="lg" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mt-4">Completing sign in...</h2>
            <p className="text-sm text-neutral-500 mt-2">You will be redirected shortly</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/30">
              <AlertCircle className="h-5 w-5 text-danger-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Sign in failed</h2>
            <p className="text-sm text-neutral-500 mt-2">{errorMessage || 'Something went wrong'}</p>
            <Button onClick={() => navigate('/app/login')} className="mt-4 w-full">
              Back to sign in
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
