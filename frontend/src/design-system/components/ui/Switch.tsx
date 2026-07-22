import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/design-system/utils';

interface SwitchProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function Switch({ label, checked, onCheckedChange, disabled, id }: SwitchProps) {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        <SwitchPrimitive.Thumb className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0'
        )} />
      </SwitchPrimitive.Root>
      {label && <label htmlFor={switchId} className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">{label}</label>}
    </div>
  );
}
