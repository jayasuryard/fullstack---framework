import React from 'react';
import { cn } from '@/design-system/utils';

const variants = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300',
  info: 'bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-300',
};

const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-0.5 text-xs', lg: 'px-3 py-1 text-sm' };

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
