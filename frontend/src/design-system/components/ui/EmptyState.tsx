import React from 'react';
import { cn } from '@/design-system/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 text-neutral-300 dark:text-neutral-600">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
