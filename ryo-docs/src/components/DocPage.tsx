import { DocEntry } from '@/App';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface DocPageProps {
  doc: DocEntry;
}

export default function DocPage({ doc }: DocPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <MarkdownRenderer content={doc.content} />
    </div>
  );
}
