import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/design-system/utils';

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  tabs: { value: string; label: string; icon?: React.ReactNode; content: React.ReactNode }[];
  className?: string;
}

export function Tabs({ value, onValueChange, tabs, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      <TabsPrimitive.List className="inline-flex h-9 items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm',
              'dark:text-neutral-400 dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-neutral-100'
            )}
          >
            {tab.icon}
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content key={tab.value} value={tab.value} className="mt-4 focus-visible:outline-none">
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
