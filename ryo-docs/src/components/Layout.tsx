import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { docEntries } from '@/App';
import { Menu, X, Moon, Sun, Github, ChevronRight } from 'lucide-react';

const groups = [
  { label: 'Getting Started', prefixes: ['introduction', 'installation', 'project-structure'] },
  { label: 'Architecture', prefixes: ['architecture', 'design', 'rules'] },
  { label: 'Frontend', prefixes: ['frontend'] },
  { label: 'Backend', prefixes: ['backend'] },
  { label: 'AI', prefixes: ['ai'] },
  { label: 'Reference', prefixes: ['api', 'database', 'security', 'testing', 'deployment', 'faq', 'troubleshooting'] },
  { label: 'Development', prefixes: ['phases', 'memory', 'agents', 'contributing', 'roadmap', 'changelog', 'decisions'] },
];

function getGroupForDoc(slug: string): string {
  for (const group of groups) {
    for (const prefix of group.prefixes) {
      if (slug === prefix || slug.startsWith(prefix + '/')) return group.label;
    }
  }
  return 'Other';
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    }
  }, [location.pathname]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 lg:relative lg:translate-x-0 overflow-y-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-xs font-bold text-white">RF</div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">RyoFramework</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3 space-y-1">
          {grouped.map(group => {
            if (!group.docs.length) return null;
            const isExpanded = expanded[group.label] ?? true;
            return (
              <div key={group.label}>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [group.label]: !isExpanded }))}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  {group.label}
                  <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
                </button>
                {isExpanded && (
                  <div className="ml-1 space-y-0.5">
                    {group.docs.map(doc => {
                      const active = location.pathname.includes(doc.slug);
                      return (
                        <Link
                          key={doc.slug}
                          to={`/docs/${doc.slug}`}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                            active
                              ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300'
                              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                          )}
                        >
                          <span className="truncate">{doc.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuToggle} className="lg:hidden text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDark(!dark)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800"
          title="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <a
          href="https://github.com/ryoforge/ryoframework"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800"
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
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
