import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Info, AlertTriangle, Lightbulb, AlertOctagon } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex h-7 items-center gap-1 rounded-md bg-white/10 px-2 text-xs text-neutral-400 hover:bg-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
    >
      {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
    </button>
  );
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip' | 'danger'; children: React.ReactNode }) {
  const styles = {
    info: { icon: Info, className: 'callout-info', label: 'Info' },
    warning: { icon: AlertTriangle, className: 'callout-warning', label: 'Warning' },
    tip: { icon: Lightbulb, className: 'callout-tip', label: 'Tip' },
    danger: { icon: AlertOctagon, className: 'callout-danger', label: 'Danger' },
  };
  const { icon: Icon, className, label } = styles[type];
  return (
    <div className={`callout ${className}`}>
      <div className="flex items-center gap-2 font-semibold mb-1.5">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match;

            if (isInline) {
              return <code className={className} {...props}>{children}</code>;
            }

            return (
              <div className="relative my-6 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    </div>
                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 ml-2">{match?.[1] || 'code'}</span>
                  </div>
                  <CopyButton text={codeString} />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '13px',
                    background: 'transparent',
                    padding: '1rem 1.25rem',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
          a({ href, children }) {
            const isExternal = href?.startsWith('http');
            if (isExternal) {
              return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
            }
            const cleanHref = (href || '').replace(/\.md$/, '');
            return <a href={cleanHref.startsWith('#') ? cleanHref : `/docs/${cleanHref}`}>{children}</a>;
          },
          blockquote({ children }) {
            const text = typeof children === 'object' && children !== null ? String(children) : '';
            const match = text.match(/\[!(info|warning|tip|danger)\]/);
            if (match) {
              const type = match[1] as 'info' | 'warning' | 'tip' | 'danger';
              const cleaned = String(children).replace(/> \[!(info|warning|tip|danger)\]\s*>?\s*/g, '').trim();
              return <Callout type={type}>{cleaned}</Callout>;
            }
            return <blockquote>{children}</blockquote>;
          },
          table({ children }) {
            return (
              <div className="my-6 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <table className="w-full">{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
