import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { docEntries } from '@/App';
import SearchModal from '@/components/SearchModal';
import { Menu, X, Moon, Sun, Github, ChevronRight, Search, Command } from 'lucide-react';

const groups = [
  { label: 'Getting Started', emoji: '🚀', prefixes: ['introduction', 'installation', 'project-structure'] },
  { label: 'Architecture', emoji: '🏗️', prefixes: ['architecture', 'design', 'rules'] },
  { label: 'Frontend', emoji: '🎨', prefixes: ['frontend'] },
  { label: 'Backend', emoji: '⚙️', prefixes: ['backend'] },
  { label: 'AI', emoji: '🤖', prefixes: ['ai'] },
  { label: 'Reference', emoji: '📚', prefixes: ['api', 'database', 'security', 'testing', 'deployment', 'faq', 'troubleshooting'] },
  { label: 'Development', emoji: '🛠️', prefixes: ['phases', 'memory', 'agents', 'contributing', 'roadmap', 'changelog', 'decisions'] },
];

function getGroupForDoc(slug: string): string {
  for (const group of groups) {
    for (const prefix of group.prefixes) {
      if (slug === prefix || slug.startsWith(prefix + '/')) return group.label;
    }
  }
  return 'Other';
}

function Sidebar({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = groups.map(group => ({
    ...group,
    docs: docEntries.filter(d => getGroupForDoc(d.slug) === group.label),
  }));

  useEffect(() => {
    const current = docEntries.find(d => location.pathname.includes(d.slug));
    if (current) {
      const groupLabel = getGroupForDoc(current.slug);
      setExpanded(prev => ({ ...prev, [groupLabel]: true }));
      // Expand all parent groups on mobile close
      if (!open) return;
    }
  }, [location.pathname, open]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 flex flex-col bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-r border-neutral-200/80 dark:border-neutral-800/80 transform transition-all duration-300 ease-out lg:relative lg:translate-x-0',
        open ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              RF
            </div>
            <div>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 block leading-tight">RyoFramework</span>
              <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Docs</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search trigger */}
        <div className="px-4 py-3">
          <button
            onClick={onSearch}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
          >
            <Search className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
            <span className="flex-1 text-left">Search docs...</span>
            <div className="hidden sm:flex items-center gap-0.5">
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-400"><Command className="h-2.5 w-2.5 inline" /></kbd>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-400">K</kbd>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-thin">
          {grouped.map(group => {
            if (!group.docs.length) return null;
            const isExpanded = expanded[group.label] ?? false;
            const hasActive = group.docs.some(d => location.pathname.includes(d.slug));

            return (
              <div key={group.label}>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [group.label]: !isExpanded }))}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                    hasActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <span className="text-sm">{group.emoji}</span>
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronRight className={cn('h-3 w-3 transition-transform duration-200', isExpanded && 'rotate-90')} />
                </button>
                <div className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}>
                  <div className="ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-800 space-y-0.5 py-1">
                    {group.docs.map(doc => {
                      const active = location.pathname.includes(doc.slug);
                      return (
                        <Link
                          key={doc.slug}
                          to={`/docs/${doc.slug}`}
                          onClick={onClose}
                          className={cn(
                            'flex items-center px-3 py-1.5 rounded-lg text-[13px] transition-all',
                            active
                              ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950/50 dark:text-primary-300 sidebar-active'
                              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50'
                          )}
                        >
                          <span className="truncate">{doc.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Navbar({ onMenuToggle, onSearch }: { onMenuToggle: () => void; onSearch: () => void }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Find current doc for breadcrumb
  const currentDoc = docEntries.find(d => location.pathname.includes(d.slug));
  const currentGroup = currentDoc ? getGroupForDoc(currentDoc.slug) : '';

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200/60 dark:border-neutral-800/60 glass-strong flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        {currentDoc && (
          <nav className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Docs</Link>
            <span>/</span>
            <span className="text-neutral-400 dark:text-neutral-500">{currentGroup}</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-[200px]">{currentDoc.title}</span>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onSearch}
          className="flex items-center gap-2 h-8 px-3 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 text-sm transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
            <Command className="h-2 w-2" />K
          </kbd>
        </button>
        <button
          onClick={() => setDark(!dark)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
          title={dark ? 'Switch to light' : 'Switch to dark'}
        >
          <div className="relative h-4 w-4">
            <Sun className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', dark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100')} />
            <Moon className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0')} />
          </div>
        </button>
        <a
          href="https://github.com/ryoforge/ryoframework"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
          title="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSearch={() => setSearchOpen(true)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
