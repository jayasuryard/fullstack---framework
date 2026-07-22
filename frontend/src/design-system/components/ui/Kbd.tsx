import React from 'react';
import { cn } from '@/design-system/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys: string[];
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ keys, className, ...props }, ref) => {
  return (
    <kbd ref={ref} className={cn('inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', className)} {...props}>
      {keys.map((key, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-0.5">+</span>}
          <span className="uppercase">{key}</span>
        </span>
      ))}
    </kbd>
  );
});
Kbd.displayName = 'Kbd';
