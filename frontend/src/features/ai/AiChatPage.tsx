import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button, Input, Card } from '@/design-system';
import { Plus, Send, MessageSquare } from 'lucide-react';

export default function AiChatPage() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => { const res = await api.get('/conversations'); return res.data.data.conversations; },
  });

  const { data: conversation, refetch: refetchConversation } = useQuery({
    queryKey: ['conversation', selectedConversation],
    queryFn: async () => { const res = await api.get(`/conversations/${selectedConversation}`); return res.data.data.conversation; },
    enabled: !!selectedConversation,
  });

  const createConv = useMutation({
    mutationFn: () => api.post('/conversations', { title: 'New conversation' }),
    onSuccess: (res) => { setSelectedConversation(res.data.data.conversation.id); queryClient.invalidateQueries({ queryKey: ['conversations'] }); },
  });

  const sendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;
    const msg = input;
    setInput('');
    setStreamingContent('');
    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ content: msg }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') { refetchConversation(); break; }
            try { const parsed = JSON.parse(data); setStreamingContent(prev => prev + parsed.content); } catch {}
          }
        }
      }
      refetchConversation();
    } catch {}
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation?.messages, streamingContent]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-64 flex-shrink-0 space-y-4">
        <Button onClick={() => createConv.mutate()} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New chat
        </Button>
        <div className="space-y-1">
          {(conversations || []).map((conv: any) => (
            <button key={conv.id} onClick={() => setSelectedConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedConversation === conv.id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <p className="truncate">{conv.title}</p>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 ml-6">{conv._count?.messages || 0} messages</p>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-auto space-y-4 p-4">
              {(conversation?.messages || []).map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">{formatDate(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    <p className="whitespace-pre-wrap">{streamingContent}</p>
                    <span className="inline-block w-2 h-4 bg-primary-600 animate-pulse ml-1" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." />
              <Button onClick={sendMessage} disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
              <p className="text-base font-medium">AI Chat</p>
              <p className="text-sm mt-1">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
