/// <reference types="vite/client" />
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DocPage from '@/components/DocPage';
import Hero from '@/components/Hero';

const docs = import.meta.glob('./content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)/m);
  return match ? match[1] : '';
}

function extractDescription(markdown: string): string {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      return trimmed.slice(0, 160);
    }
  }
  return '';
}

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  content: string;
  path: string;
}

function buildDocTree(): DocEntry[] {
  return Object.entries(docs).map(([filepath, content]) => {
    const slug = filepath
      .replace('./content/', '')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '')
      .replace(/\/_index$/, '/');
    const title = extractTitle(content);
    const description = extractDescription(content);
    return { slug, title, content, description, path: filepath };
  });
}

export const docEntries = buildDocTree();

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/docs" element={<Layout />}>
        {docEntries.map((doc) => (
          <Route key={doc.slug} path={doc.slug} element={<DocPage doc={doc} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
