# AI Architecture Overview

RyoFramework's AI system is built on a modular, provider-agnostic architecture that enables seamless integration with Large Language Models. The system is designed for extensibility, allowing new AI providers, capabilities, and agent types to be added with minimal code changes.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│            (React Frontend / API Consumers)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / SSE
┌─────────────────────▼───────────────────────────────────────┐
│                     Controller Layer                         │
│              routes/ai.js → controllers/aiController.js       │
│            POST /api/ai/chat  |  POST /api/ai/stream         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      Service Layer                           │
│                   ai/aiService.js                            │
│         generateResponse()  |  generateStreamingResponse()   │
│         codeReview()        |  generateSchema()              │
└──────┬──────────────────────────────┬───────────────────────┘
       │                              │
┌──────▼──────────┐    ┌──────────────▼───────────────────────┐
│ Prompt Manager  │    │         Provider Layer                 │
│ promptManager.js│    │          ai/provider.js                │
│ - System prompts│    │  ┌──────────────────────────────────┐ │
│ - Context building│   │  │      AIProvider Class           │ │
│ - Versioning    │    │  │  chat()  |  streamChat()         │ │
└─────────────────┘    │  │  mockResponse()                  │ │
                       │  └──────────────────────────────────┘ │
                       │         │                              │
                       │    ┌────▼────┐                        │
                       │    │  GROQ   │                        │
                       │    │  API    │                        │
                       │    └─────────┘                        │
                       └───────────────────────────────────────┘
```

## GROQ API Integration

RyoFramework uses GROQ as its primary AI provider, leveraging the Groq LPU inference engine for high-speed AI responses.

### Chat Completion

The `AIProvider.chat()` method sends a non-streaming request to GROQ's chat completions endpoint:

```javascript
// ai/provider.js
export class AIProvider {
  async chat(messages, options = {}) {
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

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }
}
```

### Streaming

The streaming implementation uses Server-Sent Events (SSE) to deliver real-time token-by-token responses:

```javascript
export async function* streamChat(messages, options = {}) {
  const stream = await this.chat(messages, { ...options, stream: true });
  const reader = stream.getReader();
  const decoder = new TextDecoder();

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
}
```

The controller sets up SSE headers and streams chunks to the client:

```javascript
export async function streamChat(req, res, next) {
  const { prompt, context, type } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = aiService.generateStreamingResponse(prompt, context, type);
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}
```

### Configuration

GROQ is configured through environment variables:

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | GROQ API key |
| `GROQ_MODEL` | `llama3-70b-8192` | Model identifier |

## Prompt Management System

The prompt manager (`ai/promptManager.js`) provides centralized prompt management with typed system prompts.

### System Prompts

Prompts are organized by type, each serving a specific purpose:

| Prompt Type | Purpose | System Prompt Focus |
|---|---|---|
| `default` | General AI assistance | RyoFramework knowledge, SaaS development |
| `codeReview` | Code review | Security, performance, maintainability |
| `architecture` | Architecture guidance | Clean architecture, scalability |
| `database` | Database design | Prisma ORM, PostgreSQL, migrations |

```javascript
const systemPrompts = {
  default: `You are RyoAI, the AI assistant for RyoFramework...`,
  codeReview: `You are a senior code reviewer for RyoFramework projects...`,
  architecture: `You are a software architect for RyoFramework...`,
  database: `You are a database architect specializing in Prisma ORM...`,
};
```

### Context Building

The `buildChatMessages()` function assembles the full message array:

```javascript
export function buildChatMessages(prompt, context = null, type = 'default') {
  const messages = [{ role: 'system', content: getSystemPrompt(type) }];

  if (context) {
    messages.push({
      role: 'system',
      content: `Context:\n${JSON.stringify(context, null, 2)}`,
    });
  }

  messages.push({ role: 'user', content: prompt });
  return messages;
}
```

### Prompt Versioning Strategy

Prompt templates are versioned using a naming convention:

- `default_v1`, `default_v2` — Iterated general prompts
- `codeReview_v1` — Initial code review prompt
- `database_v2` — Updated with specific PostgreSQL optimizations

Migration of prompts is handled through the prompt manager, and the active version is selected via configuration.

## Conversation History

Conversations are persisted in PostgreSQL through the `Conversation` and `Message` models:

```prisma
model Conversation {
  id        String    @id @default(uuid())
  userId    String    @db.Uuid
  title     String    @default("New conversation")
  model     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String   @db.Uuid
  role           String   // user, assistant, system
  content        String
  tokens         Int?
  metadata       Json?
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations` | List user's conversations |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `POST` | `/api/conversations/:id/messages` | Add a message |
| `DELETE` | `/api/conversations/:id` | Delete a conversation |

## Provider Abstraction Layer

The `AIProvider` class (`ai/provider.js`) abstracts all AI provider interactions behind a clean interface:

```javascript
export class AIProvider {
  async chat(messages, options = {}) { /* ... */ }
  async *streamChat(messages, options = {}) { /* ... */ }
  mockResponse(messages) { /* ... */ }
}
```

### Adding a New Provider

To add a new provider (e.g., OpenAI, Anthropic):

1. Create a new provider class implementing the same interface:

```javascript
export class OpenAIProvider {
  async chat(messages, options = {}) {
    // OpenAI-specific implementation
  }
  async *streamChat(messages, options = {}) {
    // OpenAI-specific streaming
  }
}
```

2. Add a factory in `provider.js` to select the active provider based on configuration:

```javascript
export function createProvider() {
  switch (config.ai.provider) {
    case 'groq': return new AIProvider();
    case 'openai': return new OpenAIProvider();
    default: return new AIProvider();
  }
}
```

3. The rest of the system (services, controllers) remains unchanged.

### Mock Mode

When no API key is configured, the provider automatically returns mock responses for development:

```javascript
mockResponse(messages) {
  return {
    content: `[AI Mock] Received: "${lastMessage.slice(0, 100)}..."\n\nConfigure GROQ_API_KEY in your .env file.`,
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
}
```

## Token Usage and Cost Tracking

Usage data is returned by the provider and tracked at multiple levels:

### Response Format

```json
{
  "response": "Generated AI response...",
  "usage": {
    "prompt_tokens": 450,
    "completion_tokens": 120,
    "total_tokens": 570
  }
}
```

### Tracking Strategy

- **Per-request**: Usage is returned in every AI response
- **Message-level**: Token counts stored on the `Message` model
- **Usage records**: Aggregated in the `UsageRecord` model for billing
- **Cost calculation**: Cost = (prompt_tokens × prompt_rate) + (completion_tokens × completion_rate)

```javascript
// Example cost tracking middleware
async function trackUsage(userId, usage, feature) {
  await prisma.usageRecord.create({
    data: {
      userId,
      feature,
      quantity: usage.total_tokens,
    },
  });
}
```

## AI Service Functions

The `aiService.js` layer provides high-level business logic functions:

| Function | Description |
|---|---|
| `generateResponse(prompt, context, type)` | Send a prompt and get a complete response |
| `generateStreamingResponse(prompt, context, type)` | Stream tokens one by one |
| `codeReview(code, language)` | Review code for quality and security |
| `generateSchema(description)` | Generate Prisma schemas from requirements |

```javascript
export async function codeReview(code, language = 'javascript') {
  const prompt = `Review the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
  return generateResponse(prompt, null, 'codeReview');
}

export async function generateSchema(description) {
  const prompt = `Generate a Prisma schema for:\n\n${description}\n\nReturn only the schema code.`;
  return generateResponse(prompt, null, 'database');
}
```

## Controller Layer

The `aiController.js` handles HTTP concerns and delegates to services:

| Endpoint | Controller Method | Authentication |
|---|---|---|
| `POST /api/ai/chat` | `chat()` | Required |
| `POST /api/ai/stream` | `streamChat()` | Required |

Request body format for both endpoints:

```json
{
  "prompt": "Generate a user authentication schema",
  "context": { "project": "SaaS app", "tech": "Prisma" },
  "type": "database"
}
```

## API Routes

```javascript
// routes/ai.js
import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/chat', authenticate, aiController.chat);
router.post('/stream', authenticate, aiController.streamChat);
export default router;
```

## Future Enhancements

### RAG (Retrieval-Augmented Generation)

Planned integration with vector databases (pgvector on PostgreSQL) to enable:
- Semantic search over project documentation
- Codebase-aware AI responses
- Context injection from indexed knowledge bases

### MCP (Model Context Protocol)

Adoption of the Model Context Protocol for:
- Standardized AI tool integration
- Plugin ecosystem for AI capabilities
- Secure, sandboxed code execution

### Multi-AI Provider Support

Native support for multiple providers:
- OpenAI / GPT-4
- Anthropic / Claude
- Google / Gemini
- AWS Bedrock
- Azure OpenAI

Provider selection per request or per model capability.

### Agent Orchestration

Coordination of multiple AI agents for complex workflows:
- Task decomposition across specialized agents
- Parallel agent execution
- Agent communication via message bus
- Human-in-the-loop approval gates

### Streaming Improvements

- Backpressure handling for large responses
- Connection recovery for dropped streams
- Compression for streaming data
- Progress indicators and estimated completion times
