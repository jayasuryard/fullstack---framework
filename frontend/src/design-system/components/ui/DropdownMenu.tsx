import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/design-system/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-[12rem] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export function DropdownMenuItem({ children, className, ...props }: DropdownMenuPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-neutral-100 dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-800',
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator() {
  return <DropdownMenuPrimitive.Separator className="my-1.5 h-px bg-neutral-200 dark:bg-neutral-800" />;
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">{children}</span>;
}
