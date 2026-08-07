# AI / ML Integration Notes

This framework ships **no AI subsystem** — no LLM client, no provider SDK, no agent runtime, no `GROQ_API_KEY`-style env. That is deliberate: AI is product logic, not framework infrastructure. This page documents the seams you would build on.

## What Exists

| Seam | How to Use It for AI |
|------|---------------------|
| Background jobs | run LLM calls off the request path: `enqueueJob('ai:generate', { prompt }, { userId })` |
| Job progress + WS | stream token/progress deltas to the browser: `emitToChannel('job:' + jobId, ...)` + `useWebSocket` |
| Redis cache | cache completions (`getCache`/`setCache` in `config/redisConfig.js`) |
| Config dir | add `config/ai.js` next to `s3.js`/`cloudinary.js` for your provider client |
| Audit logging | `auditLogger.log({ action: 'ai.completion', ... })` for usage tracking |

## Suggested Integration Path

1. `npm install` your provider SDK (OpenAI, Anthropic, Groq, ...) as a backend dependency.
2. `config/ai.js` — instantiate the client from `AI_*` env vars.
3. `modules/ai/services/AiService.js` — prompt building, provider calls, caching, usage metadata.
4. `workers/aiGenerateHandler.js` — long calls run here; register in `worker.js`:
   ```js
   handlers['ai:generate'] = handleAiGenerate
   ```
5. Routes: `POST /api/v1/admin/ai/generate` → enqueue → return `{ jobId }`; client listens on `job:<jobId>`.
6. `api.js` namespace `api.ai.generate(...)`.

## Guardrails

- Rate limit AI routes (`generalLimiter` or a dedicated `aiLimiter`).
- Never put API keys in the client; keys live in backend env only.
- Validate prompts (size, content) with zod before enqueuing.
- Log every completion for cost/audit; cache identical requests.
- Async everything — LLM latency has no place in a request handler.

## If You Want a Chat Feature

Chat state is product data: add a `Conversation`/`Message` Prisma model pair above the marker, stream deltas over the existing WS hub (`user:<id>` channel or a `chat:<id>` channel), persist on completion. The framework provides the transport; you provide the schema and prompts.
