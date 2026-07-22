import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/design-system/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ label, error, placeholder, value, onValueChange, children, disabled }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-neutral-950 dark:text-neutral-100',
            error ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder || 'Select...'} />
          <SelectPrimitive.Icon><ChevronDown className="h-4 w-4 text-neutral-400" /></SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg animate-in fade-in-80 dark:border-neutral-700 dark:bg-neutral-900">
            <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
}

export function SelectItem({ value, children, className, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm text-neutral-700 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-900 dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-800 dark:data-[highlighted]:text-neutral-100',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2"><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
