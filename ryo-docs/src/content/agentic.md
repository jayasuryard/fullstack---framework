# Agentic Development

How AI coding agents (Claude Code, Cursor, Copilot, Codex, ...) work with this framework — and how to get reliable output from them.

## What Agentic Development Means Here

The framework has no AI runtime, no LLM SDK, no `GROQ_API_KEY`. What it does ship is a **contract for agents**: machine-readable guides, deterministic generators, strict conventions, and automated gates. An agent reads the contract, follows the module loop, and produces code that passes the same gates a human's code must pass.

```
agent reads  AGENTS.md + SOURCE-MAPPING.md + ARCHITECTURE.md
        │
        ▼
agent runs  generators (gen:module / gen:model / gen:migration)
        │
        ▼
agent writes  service → routes → api.js → page → App.jsx
        │
        ▼
gates catch  lint → unit tests → integration tests → typecheck → build
        │
        ▼
human reviews  diff + commit
```

## Why It Works

| Framework feature | What it gives the agent |
|-------------------|------------------------|
| `AGENTS.md` (root) | stack, conventions, module loop, auth pattern — one read to bootstrap |
| `SOURCE-MAPPING.md` | every file's purpose + what to customize; kills "where do I put this" |
| `ARCHITECTURE.md` | security checklist + naming rules the agent must follow |
| `gen:module` / `gen:model` / `gen:migration` | deterministic scaffolding; `gen:model` validates Prisma and rolls back on error |
| Envelope + middleware chains | one correct way to build endpoints; agents pattern-match instead of inventing |
| `api.js` gateway | agents extend one namespace; they never write `fetch` in pages |
| Lint + tests + typecheck + build | objective pass/fail; agents self-correct against them |
| Small dependency surface | fewer "should I install X?" decisions; the answer is usually no |

## The Agentic Module Loop

1. **Read**: `AGENTS.md`, `SOURCE-MAPPING.md`, `ARCHITECTURE.md`.
2. **Scaffold**: `npm run gen:module invoice` — creates `modules/invoice/{routes,services}/` + mounts the route.
3. **Model**: `npm run gen:model Invoice id:cuid name:String amount:Float createdAt:DateTime` — validated, appended above the marker.
4. **Migrate**: `npm run gen:migration add_invoice`.
5. **Service**: business logic in `InvoiceService.js` — Prisma/Redis/queue calls, envelope errors.
6. **Routes**: middleware chain `verifyToken → role → requireReadWrite → validateBody`.
7. **Frontend**: namespace in `api.js` → page in `src/pages/` → lazy route in `App.jsx`.
8. **Verify**: `npm run lint && npm test` (backend), `npm run lint && npm run typecheck && npm run build` (frontend).

## Prompts That Work

Be explicit about conventions — agents follow instructions literally. Scope, files, and gates in the prompt beat vague asks.

### 1. Scaffold a domain module

```text
Using the module loop in AGENTS.md, add a "customers" module to the backend:
1. Run gen:module customers and gen:model Customer id:cuid name:String
   email:String? phone:String? status:String createdAt:DateTime.
2. Run gen:migration add_customer.
3. Implement CustomerService: list (paginated via helpers/paginate.js),
   create, update, soft-delete (isDeleted). Use the envelope
   (helpers/apiResponse) for every response.
4. Guard routes with verifyToken, role('admin'), requireReadWrite() on
   mutations, and zod validateBody schemas.
5. Add a customers namespace to frontend/src/server/api.js and a lazy
   CustomersPage at /admin/customers with useDataFetch.
Do not add dependencies. Run lint and tests before finishing.
```

### 2. Add a background job with live progress

```text
Add a "report:generate" job that builds a CSV export:
1. enqueueJob('report:generate', { filters }, { userId }) from a new
   POST /api/v1/admin/reports/export endpoint.
2. Create backend/workers/reportGenerateHandler.js, register it in
   worker.js, emit progress via emitToChannel('job:' + jobId, ...).
3. Frontend: a Reports page that enqueues, then shows progress with
   useWebSocket('job:' + jobId, ...) until status 'done'.
Follow the AGENTS.md background-jobs section exactly. No new deps.
```

### 3. Realtime updates on a resource

```text
When an invoice is marked paid, push a realtime event to its owner:
1. In InvoiceService, after the status update, call
   emitToChannel('user:' + userId, { event: 'invoice-paid', invoiceId }).
2. Document the event payload in the docs page
   ryo-docs/src/content/backend/modules.md.
3. Frontend: show a toast when the event arrives using useWebSocket.
Keep the existing WS hub usage; do not open new WebSocket connections.
```

### 4. Fix an auth bug

```text
Users report that refresh tokens stop working after two logins. Investigate
backend/modules/auth/services/AuthService.js and helpers/generateToken.js.
Check the refresh rotation and tokenHash handling (see ADR-002 in
ryo-docs/src/content/development/decisions.md). Fix the root cause, add a
unit test in backend/tests/, and run the integration suite
(RUN_INTEGRATION=1 npm run test:integration) with the Docker services.
Do not change the schema unless required; if required, add a migration.
```

### 5. Write tests for a module

```text
Write node:test unit tests for backend/modules/invoices/services/InvoiceService.js:
- pagination math (use helpers/paginate.js)
- validation rejection paths (validateBody with zod)
- envelope shape of every method (responseCode/responseMessage/responseData)
Mock prisma with simple stubs. Follow the style of existing tests in
backend/tests/. Run npm test and make sure everything passes.
```

### 6. Audit pass before a release

```text
Review the diff between this branch and main as a senior reviewer.
Checklist: auth middleware chains, envelope usage, zod validation on every
mutation, rate limiters on auth-ish endpoints, no fetch outside api.js,
no new dependencies, migrations committed, docs in sync
(ryo-docs/src/content). Report findings as path:line: problem: fix.
Make no changes; output the review only.
```

### 7. Extend the docs

```text
Add a page ryo-docs/src/content/backend/queue.md documenting the job queue:
enqueueJob signature, worker handler shape, progress events, retry and
stuck-job behavior. Verify every claim against backend/helpers/queue/ and
backend/worker.js. No emojis. Then run npm run build in ryo-docs.
```

## Ground Rules for Agent Prompts

- **Name the generators** — tell the agent to run `gen:module`/`gen:model`, not "create files like the others".
- **Name the gates** — lint, unit, integration, typecheck, build. Agents verify when told to.
- **Ban dependencies** — "no new dependencies" kills the axios/Redux/BullMQ temptation.
- **Point to the contract** — cite `AGENTS.md` sections or docs pages instead of restating conventions.
- **Scope the files** — the framework's own `AGENTS.md` already tells agents to edit only what the task needs.
- **Ask for receipts** — have the agent report changed files + gate output, so the diff is auditable.

## Common Agent Failures and How to Prevent Them

| Failure | Prevention |
|---------|-----------|
| Invents new deps or stacks (axios, BullMQ, TS on backend) | "No new dependencies" + point to rules.md |
| Raw `fetch` in pages | "All calls through frontend/src/server/api.js" |
| Broken refresh/auth handling | Point to `api.js` singleton refresh + ADR-002 |
| Schema edits without migrations | "Run gen:migration for every schema change" |
| Docs drift (fictional features) | "Verify claims against source; update ryo-docs" |
| Unscoped edits | "Edit only files in <list>; report what changed" |

## Verified Agent Workflow (SOP)

```text
Role: senior engineer on the SaaS Framework.
Read AGENTS.md, SOURCE-MAPPING.md, ARCHITECTURE.md first.
Task: <one feature, scoped>
Constraints:
- Follow the module loop; use the generator scripts.
- No new dependencies; match existing conventions exactly.
- All backend responses use the envelope; all routes use the middleware chain.
- All frontend calls go through api.js; realtime through wsClient.
- Update ryo-docs if behavior changes; no emojis.
Done = all gates pass. Report: files changed, gates run, results.
```

Copy that as the system prompt for a fresh agent session and fill in the task.
