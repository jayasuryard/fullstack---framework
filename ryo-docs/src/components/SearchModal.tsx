import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { docEntries } from '@/App';
import { Search, FileText, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return docEntries.slice(0, 8);
    return docEntries.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const handleSelect = (slug: string) => {
    navigate(`/docs/${slug}`);
    onClose();
  };

  // Reset query and focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      // Small delay to ensure the DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Close on Escape only — Cmd+K is handled by Layout
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] sm:pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No results found for "<span className="font-medium text-neutral-700 dark:text-neutral-300">{query}</span>"
            </div>
          ) : (
            <>
              {!query && <p className="px-4 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">Recent pages</p>}
              <div className="stagger-children">
                {results.map(doc => (
                  <button
                    key={doc.slug}
                    onClick={() => handleSelect(doc.slug)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{doc.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate mt-0.5">{doc.description}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
