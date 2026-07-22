import React from 'react';
import { cn } from '@/design-system/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconRight, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500',
              error ? 'border-danger-500 focus-visible:ring-danger-500' : 'border-neutral-200 dark:border-neutral-700',
              icon ? 'pl-9' : '',
              iconRight ? 'pr-9' : '',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {iconRight && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">{iconRight}</div>}
        </div>
        {error && <p id={`${inputId}-error`} className="text-xs text-danger-600 dark:text-danger-400" role="alert">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
