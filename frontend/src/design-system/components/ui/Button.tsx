import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/design-system/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
  outline: 'border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
  link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, loading, icon, iconRight, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
        {!loading && iconRight}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
