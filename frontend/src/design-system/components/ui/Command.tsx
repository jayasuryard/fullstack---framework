import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/design-system/utils';
import { Search } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  groups?: { label: string; items: CommandItem[] }[];
}

export function CommandPalette({ open, onOpenChange, items, placeholder = 'Search...', groups }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = groups ? groups.flatMap((g) => g.items) : items;

  const filtered = allItems.filter(
    (item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.description?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].onSelect();
        onOpenChange(false);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIndex, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-800">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
          />
          <kbd className="hidden rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] text-neutral-400 sm:inline-block dark:border-neutral-700 dark:bg-neutral-800">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {groups ? (
            groups.map((group) => {
              const groupFiltered = group.items.filter(
                (i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.description?.toLowerCase().includes(query.toLowerCase())
              );
              if (!groupFiltered.length) return null;
              return (
                <div key={group.label}>
                  <p className="px-2 py-1.5 text-[11px] font-medium uppercase text-neutral-500 dark:text-neutral-400">{group.label}</p>
                  {groupFiltered.map((item) => {
                    const globalIdx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => { item.onSelect(); onOpenChange(false); }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-left',
                          globalIdx === selectedIndex ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'
                        )}
                      >
                        {item.icon && <span className="text-neutral-400">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.label}</p>
                          {item.description && <p className="truncate text-xs text-neutral-400">{item.description}</p>}
                        </div>
                        {item.shortcut && (
                          <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
                            {item.shortcut.join('+')}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { item.onSelect(); onOpenChange(false); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-left',
                  idx === selectedIndex ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                {item.icon && <span className="text-neutral-400">{item.icon}</span>}
                <div className="flex-1 min-w-0">
                  <p className="truncate">{item.label}</p>
                  {item.description && <p className="truncate text-xs text-neutral-400">{item.description}</p>}
                </div>
                {item.shortcut && (
                  <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
                    {item.shortcut.join('+')}
                  </kbd>
                )}
              </button>
            ))
          )}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No results found</p>}
        </div>
      </div>
    </>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
