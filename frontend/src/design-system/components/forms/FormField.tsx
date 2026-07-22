import React from 'react';
import { cn } from '@/design-system/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger-600 dark:text-danger-400" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
    </div>
  );
}
