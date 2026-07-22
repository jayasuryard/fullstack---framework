# AI Memory System

The AI memory system manages conversational context, session persistence, and token efficiency for RyoFramework's AI features.

## Overview

The memory system enables AI conversations to maintain context across multiple interactions. It balances the need for rich context against token budget constraints.

```
┌─────────────────────────────────────────────────────────────┐
│                     Memory System                            │
├─────────────────────────────────────────────────────────────┤
│  Short-Term Memory (Current Conversation)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Message 1 (user) → Message 2 (assistant) → ...       │  │
│  │ Limited to budget (e.g., 4096 tokens)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Long-Term Memory (Across Sessions)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ User preferences, project context, learned patterns  │  │
│  │ Persisted in database                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Working Memory (Current Request)                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Injected context: code files, search results, docs   │  │
│  │ Attached per-request, not persisted                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Conversation Context Management

### Context Structure

Each AI conversation consists of:

1. **System Prompt**: Sets the AI's role and behavior (from promptManager.js)
2. **Context Object**: Optional project-specific context (code, schema, requirements)
3. **Message History**: Previous user and assistant messages
4. **Current Prompt**: The user's latest input

### Context Building

```javascript
// promptManager.js
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

### Context Types

| Context Type | Purpose | Example |
|---|---|---|
| `project` | Project-level context | Tech stack, architecture, coding standards |
| `file` | File-specific context | Current file content, related imports |
| `conversation` | Conversation history | Previous messages in the thread |
| `user` | User preferences | Preferred AI style, expertise level |

## Session Persistence

### Database Models

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

### Session Lifecycle

```
User sends prompt
  → Check for active conversation
  → If new: create Conversation
  → If existing: load previous messages  
  → Build message array (system + context + history + prompt)
  → Send to AI provider
  → Save user message + AI response as Message records
  → Update Conversation.updatedAt
```

### Conversation API

```javascript
// Create conversation
await prisma.conversation.create({
  data: { userId, title: 'Code Review' },
});

// Add messages
await prisma.message.create({
  data: { conversationId, role: 'user', content: prompt, tokens: promptTokens },
});
await prisma.message.create({
  data: { conversationId, role: 'assistant', content: response, tokens: responseTokens },
});

// Load conversation
const conversation = await prisma.conversation.findUnique({
  where: { id },
  include: { messages: { orderBy: { createdAt: 'asc' } } },
});
```

## Token Budget Management

### Budget Strategy

The memory system manages token usage to stay within model context limits while preserving useful context.

| Component | Token Budget | Priority |
|---|---|---|
| System prompt | ~200 tokens | Highest — always included |
| Context data | Variable | High — essential for accuracy |
| Recent messages (last 5) | ~2000 tokens | High — immediate context |
| Older messages | ~1000 tokens (summarized) | Medium — background context |
| Current prompt | Variable | Highest — current request |

### Token Counting

```javascript
// Simple token estimation
function estimateTokens(text) {
  // ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// More accurate: use model-specific tokenizer
// For production, use tiktoken or the AI provider's tokenizer
```

### Truncation Strategy

When the message history exceeds the token budget:

1. **Remove oldest messages first** (oldest context is least relevant)
2. **Summarize older messages** into a condensed context block
3. **Drop system prompt extras** if absolutely necessary (keep core prompt)
4. **Last resort**: Remove context data, keep only conversation history

```javascript
function truncateMessages(messages, maxTokens = 4096) {
  const systemMessages = messages.filter(m => m.role === 'system');
  const history = messages.filter(m => m.role !== 'system');

  let totalTokens = estimateTokens(JSON.stringify(systemMessages));
  let truncated = [...systemMessages];

  // Add most recent messages first (reverse chronological)
  for (const message of history.reverse()) {
    const messageTokens = estimateTokens(message.content);
    if (totalTokens + messageTokens > maxTokens) break;
    truncated.push(message);
    totalTokens += messageTokens;
  }

  return truncated;
}
```

## Memory Optimization

### Techniques

#### 1. Selective Context Injection

Instead of sending the full project context, extract and inject only relevant portions:

```javascript
function extractRelevantContext(prompt, fullContext) {
  // Extract only relevant parts based on prompt keywords
  if (prompt.includes('database') || prompt.includes('schema')) {
    return { schemas: fullContext.schemas };
  }
  if (prompt.includes('auth') || prompt.includes('login')) {
    return { auth: fullContext.auth };
  }
  return fullContext; // Fallback to full context
}
```

#### 2. Conversation Summarization

For long conversations, periodically summarize older messages:

```javascript
async function summarizeMessages(messages) {
  const summaryPrompt = `Summarize this conversation in 2-3 sentences:\n\n${
    messages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n')
  }`;

  const { content } = await generateResponse(summaryPrompt);
  return content;
}
```

#### 3. Token-Efficient Formatting

Optimize context representation for token efficiency:

```javascript
// Inefficient: verbose JSON
const context = {
  project: { name: "MyApp", language: "JavaScript", framework: "Express" }
};
// JSON.stringify → 67 tokens

// Efficient: compact format
const context = "Project: MyApp (JS, Express)";
// → ~8 tokens (85% reduction)
```

#### 4. Cache Frequent Contexts

Cache commonly used context (project info, user preferences) to avoid regenerating:

```javascript
const contextCache = new Map();

function getCachedContext(userId, type) {
  const key = `${userId}:${type}`;
  return contextCache.get(key);
}

function setCachedContext(userId, type, data) {
  const key = `${userId}:${type}`;
  contextCache.set(key, data);
  // Expire after 5 minutes
  setTimeout(() => contextCache.delete(key), 5 * 60 * 1000);
}
```

### Performance Recommendations

| Scenario | Strategy |
|---|---|
| Short conversation (< 10 messages) | Include full history |
| Long conversation (> 10 messages) | Keep last 5, summarize rest |
| Token budget exceeded | Remove oldest, then summarize |
| Context too large | Extract relevant subset only |
| Frequent same context | Cache with TTL |
| Large file context | Include filename + summary, full content on demand |

## Future Enhancements

### Planned Memory Features

- **Vector memory**: Store conversation embeddings in pgvector for semantic recall
- **Hierarchical memory**: Short-term (detailed) → Medium-term (summarized) → Long-term (key facts)
- **User memory profile**: Learn and persist user preferences, common patterns, coding style
- **Memory compression**: Automatic compression of old context into efficient representations
- **Cross-session memory**: Recall relevant information from past conversations
- **Memory pruning**: Automatic cleanup of stale or irrelevant memory
