import React from 'react';
import { cn } from '@/design-system/utils';
import { Card } from '@/design-system/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
        {icon && <div className="text-neutral-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{value}</p>
        {trend && (
          <span className={cn('text-sm font-medium', trend.positive ? 'text-success-600' : 'text-danger-600')}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {description && <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
    </Card>
  );
}
