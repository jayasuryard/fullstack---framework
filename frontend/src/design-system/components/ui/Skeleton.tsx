import React from 'react';
import { cn } from '@/design-system/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800', className)}
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';
