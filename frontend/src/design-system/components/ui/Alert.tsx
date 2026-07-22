import React from 'react';
import { cn } from '@/design-system/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const variants = {
  info: { bg: 'bg-info-50 border-info-200 dark:bg-info-950/30 dark:border-info-800', icon: Info, color: 'text-info-600 dark:text-info-400' },
  success: { bg: 'bg-success-50 border-success-200 dark:bg-success-950/30 dark:border-success-800', icon: CheckCircle2, color: 'text-success-600 dark:text-success-400' },
  warning: { bg: 'bg-warning-50 border-warning-200 dark:bg-warning-950/30 dark:border-warning-800', icon: AlertTriangle, color: 'text-warning-600 dark:text-warning-400' },
  danger: { bg: 'bg-danger-50 border-danger-200 dark:bg-danger-950/30 dark:border-danger-800', icon: AlertCircle, color: 'text-danger-600 dark:text-danger-400' },
};

interface AlertProps {
  variant?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({ variant = 'info', title, children, dismissible, onDismiss }: AlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn('relative flex gap-3 rounded-lg border p-4', config.bg)} role="alert">
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.color)} />
      <div className="flex-1">
        {title && <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</p>}
        <div className="text-sm text-neutral-600 dark:text-neutral-400">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
      )}
    </div>
  );
}
