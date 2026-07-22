import React from 'react';
import { cn } from '@/design-system/utils';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg',
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: keyof typeof sizes;
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, initials, size = 'md', fallback, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 font-medium overflow-hidden dark:bg-neutral-800 dark:text-neutral-300', sizes[size], className)}
        {...props}
      >
        {src && !error ? (
          <img src={src} alt={alt || ''} className="h-full w-full object-cover" onError={() => setError(true)} />
        ) : (
          <span className="select-none">{initials || fallback || '?'}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
