import React from 'react';
import { cn } from '@/design-system/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void };
  className?: string;
}

export function Table<T extends Record<string, any>>({ columns, data, loading, emptyMessage = 'No data', onRowClick, pagination, className }: TableProps<T>) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border border-neutral-200 dark:border-neutral-800', className)}>
        <div className="p-6 space-y-4">
          {[75, 55, 90, 65, 80].map((w, i) => (
            <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse dark:bg-neutral-800" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-neutral-200 dark:border-neutral-800', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-neutral-400">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  onClick={() => onRowClick?.(item)}
                  className={cn('transition-colors', onRowClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50' : '')}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                      {col.cell ? col.cell(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
