import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/design-system/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backTo?: { label: string; href: string };
  className?: string;
}

export function AuthLayout({ children, title, subtitle, backTo, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className={cn('w-full max-w-sm', className)}>
        <div className="text-center mb-8">
          {backTo && (
            <Link to={backTo.href} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-4 transition-colors">
              &larr; {backTo.label}
            </Link>
          )}
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
