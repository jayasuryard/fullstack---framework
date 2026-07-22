import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/design-system/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ content, children, side = 'top', delay }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 overflow-hidden rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-sm animate-in fade-in-0 zoom-in-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-white dark:fill-neutral-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
