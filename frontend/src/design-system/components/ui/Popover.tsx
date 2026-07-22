import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/design-system/utils';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Popover({ trigger, children, open, onOpenChange, side = 'bottom', align = 'center', className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-neutral-700 dark:bg-neutral-900',
            className
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
