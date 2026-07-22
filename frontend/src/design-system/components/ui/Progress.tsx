import { cn } from '@/design-system/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

const sizes = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
const variants = {
  default: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600',
};

export function Progress({ value, max = 100, size = 'md', variant = 'default', showLabel, className }: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn('w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-neutral-500 dark:text-neutral-400">{Math.round(pct)}%</p>}
    </div>
  );
}
