import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/design-system/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };
const sideClasses = {
  left: 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
};

export function Drawer({ open, onOpenChange, title, children, trigger, side = 'right', size = 'md' }: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-0 z-50 h-full w-full border-l bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 dark:bg-neutral-900',
            widths[size],
            sideClasses[side],
            side === 'left' ? 'border-r' : 'border-l dark:border-neutral-800'
          )}
        >
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
              <DialogPrimitive.Close className="rounded-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
