import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const providerIcons: Record<string, string> = {
  google: 'G',
  facebook: 'F',
  apple: 'A',
  microsoft: 'M',
  twitter: 'X',
};

const providerColors: Record<string, string> = {
  google: 'hover:bg-gray-50 border-gray-300 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
  facebook: 'hover:bg-blue-50 border-blue-300 text-blue-700 dark:border-blue-600 dark:hover:bg-blue-950 dark:text-blue-300',
  apple: 'hover:bg-gray-50 border-gray-300 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
  microsoft: 'hover:bg-blue-50 border-blue-300 text-blue-700 dark:border-blue-600 dark:hover:bg-blue-950 dark:text-blue-300',
  twitter: 'hover:bg-gray-50 border-gray-300 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
};

export default function OAuthButtons({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const { data, isLoading } = useQuery({
    queryKey: ['oauth-providers'],
    queryFn: async () => {
      const res = await api.get('/auth/oauth/providers');
      return res.data.data.providers as { key: string; name: string; icon: string; color: string }[];
    },
  });

  const handleOAuth = (provider: string) => {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/oauth/${provider}`;
  };

  if (isLoading || !data?.length) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            {mode === 'signin' ? 'or continue with' : 'or sign up with'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((provider) => (
          <button
            key={provider.key}
            onClick={() => handleOAuth(provider.key)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${providerColors[provider.key] || 'hover:bg-gray-50 border-gray-300 text-gray-700 dark:border-gray-600'}`}
          >
            <span className="text-base font-bold">{providerIcons[provider.key] || provider.icon}</span>
            <span className="hidden sm:inline">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
