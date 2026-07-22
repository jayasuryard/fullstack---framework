import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/design-system/components/ui/Button';

interface OAuthProvider {
  key: string;
  name: string;
  icon: string;
  color: string;
}

interface OAuthButtonsProps {
  mode?: 'signin' | 'signup';
}

export default function OAuthButtons({ mode }: OAuthButtonsProps) {
  const { data: providers } = useQuery({
    queryKey: ['oauth-providers'],
    queryFn: async () => {
      const res = await api.get('/auth/oauth/providers');
      return res.data.data.providers as OAuthProvider[];
    },
    staleTime: Infinity,
  });

  if (!providers?.length) return null;

  const handleOAuth = (key: string) => {
    window.location.href = `/api/auth/oauth/${key}`;
  };

  return (
    <div className="space-y-2">
      {providers.map((p) => (
        <Button
          key={p.key}
          variant="secondary"
          onClick={() => handleOAuth(p.key)}
          className="w-full"
        >
          <span className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.icon}
            </span>
            {mode === 'signup' ? `Sign up with ${p.name}` : `Continue with ${p.name}`}
          </span>
        </Button>
      ))}
    </div>
  );
}
