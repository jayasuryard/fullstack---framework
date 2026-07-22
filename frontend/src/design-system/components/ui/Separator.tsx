import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/design-system/utils';

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {}

export const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-neutral-200 dark:bg-neutral-800',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';
