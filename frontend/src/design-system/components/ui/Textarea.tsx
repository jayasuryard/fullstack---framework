import React from 'react';
import { cn } from '@/design-system/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100',
            error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
