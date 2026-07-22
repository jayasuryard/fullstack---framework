import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class AIProvider {
  constructor() {
    this.apiKey = config.groq.apiKey;
    this.model = config.groq.model;
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      logger.warn('GROQ_API_KEY not configured, returning mock response');
      return this.mockResponse(messages);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens || 4096,
          stream: options.stream || false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI API request failed');
      }

      if (options.stream) {
        return response.body;
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      logger.error('AI provider error:', { message: error.message });
      throw error;
    }
  }

  async *streamChat(messages, options = {}) {
    const stream = await this.chat(messages, { ...options, stream: true });

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) yield content;
          } catch {
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  mockResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    return {
      content: `[AI Mock] Received: "${lastMessage.slice(0, 100)}..."\n\nConfigure GROQ_API_KEY in your .env file to enable real AI responses.`,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}

export const aiProvider = new AIProvider();
