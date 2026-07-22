import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            const inline = !match;
            const codeString = String(children).replace(/\n$/, '');
            if (inline) {
              return <code className={className} {...props}>{children}</code>;
            }
            return (
              <div className="relative my-6 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 text-neutral-400 text-xs">
                  <span>{match?.[1] || 'code'}</span>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
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
            // Internal links - strip .md extension for client-side routing
            const cleanHref = (href || '').replace(/\.md$/, '');
            return <a href={cleanHref.startsWith('#') ? cleanHref : `/docs/${cleanHref}`}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
