import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/design-system/utils';
import { Button } from '@/design-system/components/ui/Button';
import { Card } from '@/design-system/components/ui/Card';
import { Avatar } from '@/design-system/components/ui/Avatar';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatProps {
  messages: Message[];
  onSend: (content: string) => void;
  streaming?: string;
  loading?: boolean;
  className?: string;
}

export function Chat({ messages, onSend, streaming, loading, className }: ChatProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  return (
    <Card className={cn('flex flex-col h-full', className)} padding="none">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <Avatar size="sm" initials="AI" className="shrink-0 mt-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" />
            )}
            <div className={cn(
              'max-w-[75%] rounded-xl px-4 py-2.5 text-sm',
              msg.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <Avatar size="sm" initials="U" className="shrink-0 mt-0.5 bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" />
            )}
          </div>
        ))}
        {streaming && (
          <div className="flex gap-3">
            <Avatar size="sm" initials="AI" className="shrink-0 mt-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" />
            <div className="rounded-xl px-4 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <p className="whitespace-pre-wrap">{streaming}</p>
              <span className="inline-block w-2 h-4 bg-primary-600 animate-pulse ml-0.5" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <Button type="submit" size="md" disabled={!input.trim() || loading} loading={loading} icon={<Send className="h-4 w-4" />} />
        </div>
      </form>
    </Card>
  );
}
