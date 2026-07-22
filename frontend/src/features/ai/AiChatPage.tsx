import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

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
    onSuccess: (res) => {
      setSelectedConversation(res.data.data.conversation.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
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
      <div className="w-64 flex-shrink-0">
        <button onClick={() => createConv.mutate()} className="btn-primary w-full mb-4 text-sm">New chat</button>
        <div className="space-y-1">
          {(conversations || []).map((conv: any) => (
            <button key={conv.id} onClick={() => setSelectedConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedConversation === conv.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
              <p className="truncate">{conv.title}</p>
              <p className="text-xs text-gray-400">{conv._count?.messages || 0} messages</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col card">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-auto space-y-4 p-4">
              {(conversation?.messages || []).map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">{formatDate(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <p className="whitespace-pre-wrap">{streamingContent}</p>
                    <span className="inline-block w-2 h-4 bg-primary-600 animate-pulse ml-1" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t pt-4 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="input-field flex-1" />
              <button onClick={sendMessage} className="btn-primary" disabled={!input.trim()}>Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">AI Chat</p>
              <p className="text-sm">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
