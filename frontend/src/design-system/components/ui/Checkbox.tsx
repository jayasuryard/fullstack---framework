import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/design-system/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({ label, checked, onCheckedChange, disabled, id }: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        id={checkboxId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded border border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 dark:border-neutral-600',
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && <label htmlFor={checkboxId} className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">{label}</label>}
    </div>
  );
}
