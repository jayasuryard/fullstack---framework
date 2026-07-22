import React from 'react';
import { cn } from '@/design-system/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

const variants = {
  default: 'border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
  elevated: 'border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-lg dark:shadow-black/20',
  outlined: 'border-2 border-neutral-100 bg-transparent dark:border-neutral-800',
  glass: 'border border-white/20 bg-white/70 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('rounded-xl', variants[variant], paddings[padding], className)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
