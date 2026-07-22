import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/design-system/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw]',
};

export function Modal({ open, onOpenChange, title, description, children, trigger, size = 'md', className }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:border-neutral-800 dark:bg-neutral-900',
            sizes[size],
            className
          )}
        >
          {(title || description) && (
            <div className="mb-4 pr-8">
              {title && <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</DialogPrimitive.Title>}
              {description && <DialogPrimitive.Description className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</DialogPrimitive.Description>}
            </div>
          )}
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
