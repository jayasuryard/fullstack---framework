import React from 'react';
import { cn } from '@/design-system/utils';

interface AppShellProps {
  sidebar?: React.ReactNode;
  navbar?: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export function AppShell({ sidebar, navbar, children, sidebarCollapsed }: AppShellProps) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {sidebar && (
        <aside className={cn(
          'hidden lg:flex flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}>
          {sidebar}
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {navbar && (
          <header className="h-14 shrink-0 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
            {navbar}
          </header>
        )}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
