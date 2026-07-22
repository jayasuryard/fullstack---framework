import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  value: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

export function Accordion({ items, type = 'single', defaultValue }: AccordionProps) {
  return (
    <AccordionPrimitive.Root type={type} defaultValue={defaultValue as any} className="space-y-1">
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.value} value={item.value} className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-neutral-100 dark:hover:bg-neutral-800/50">
              {item.title}
              <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="px-4 pb-3 text-sm text-neutral-600 dark:text-neutral-400 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            {item.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
