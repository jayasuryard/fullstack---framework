import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DocEntry, docEntries } from '@/App';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

const groups = [
  { label: 'Getting Started', prefixes: ['introduction', 'installation', 'project-structure'] },
  { label: 'Architecture', prefixes: ['architecture', 'design', 'rules'] },
  { label: 'Frontend', prefixes: ['frontend'] },
  { label: 'Backend', prefixes: ['backend'] },
  { label: 'AI/ML', prefixes: ['ai'] },
  { label: 'Reference', prefixes: ['api', 'database', 'security', 'testing', 'deployment', 'faq', 'troubleshooting'] },
  { label: 'Development', prefixes: ['phases', 'memory', 'agents', 'contributing', 'roadmap', 'changelog', 'decisions'] },
];

function getOrderedDocs(): DocEntry[] {
  const ordered: DocEntry[] = [];
  for (const group of groups) {
    for (const prefix of group.prefixes) {
      const matching = docEntries.filter(d => d.slug === prefix || d.slug.startsWith(prefix + '/'));
      matching.sort((a, b) => a.slug.localeCompare(b.slug));
      ordered.push(...matching);
    }
  }
  // Add any docs not matched
  const matched = new Set(ordered.map(d => d.slug));
  for (const doc of docEntries) {
    if (!matched.has(doc.slug)) ordered.push(doc);
  }
  return ordered;
}

function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, '');
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ id, text, level });
    }
  }
  return headings;
}

function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  if (headings.length < 2) return null;
  return (
    <div className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">On this page</p>
        <nav className="space-y-1">
          {headings.map(h => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className="block text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1 hover:translate-x-0.5 transform"
              style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

interface DocPageProps {
  doc: DocEntry;
}

export default function DocPage({ doc }: DocPageProps) {
  const location = useLocation();
  const orderedDocs = useMemo(() => getOrderedDocs(), []);
  const currentIndex = orderedDocs.findIndex(d => d.slug === doc.slug);
  const prev = currentIndex > 0 ? orderedDocs[currentIndex - 1] : null;
  const next = currentIndex < orderedDocs.length - 1 ? orderedDocs[currentIndex + 1] : null;
  const headings = useMemo(() => extractHeadings(doc.content), [doc.content]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 gap-10">
      <div className="flex-1 min-w-0 max-w-3xl">
        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {doc.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <MarkdownRenderer content={doc.content} />
        </div>

        {/* Prev / Next */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-4">
            {prev ? (
              <Link
                to={`/docs/${prev.slug}`}
                className="flex-1 group flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all"
              >
                <ChevronLeft className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">Previous</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{prev.title}</p>
                </div>
              </Link>
            ) : <div className="flex-1" />}
            {next ? (
              <Link
                to={`/docs/${next.slug}`}
                className="flex-1 group flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all text-right"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">Next</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{next.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" />
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>

        {/* Back to top */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowUp className="h-3 w-3" />
            Back to top
          </button>
        </div>
      </div>

      {/* Table of contents */}
      <TableOfContents headings={headings} />
    </div>
  );
}
