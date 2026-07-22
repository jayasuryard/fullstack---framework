import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="card text-center max-w-sm w-full">
        {status === 'processing' ? (
          <>
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Completing sign in...</h2>
            <p className="text-sm text-gray-500 mt-2">You will be redirected shortly</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">!</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Sign in failed</h2>
            <p className="text-sm text-gray-500 mt-2">{errorMessage || 'Something went wrong'}</p>
            <button onClick={() => navigate('/app/login')} className="btn-primary mt-4 w-full">
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
