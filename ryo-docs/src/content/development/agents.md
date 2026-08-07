# Agent Guide — this repository

Read the root `AGENTS.md` first. This file adds ryo-docs-specific guidance for agents working in this directory.

## Scope Rule

- `ryo-docs/` = documentation site for the framework.
- Read the real code in `backend/`, `frontend/`, and root `*.md` files freely for truth.
- Edit **only** inside `ryo-docs/`. Do not touch backend, frontend, workflows, or root docs.

## Truth Rule

Docs describe the code as it actually exists. Before writing about a feature, verify against source:

| Topic | Verify in |
|-------|-----------|
| Endpoints, envelope, codes | `backend/routes/index.js`, `backend/globals/response.json`, `backend/helpers/apiResponse.js` |
| Auth flow | `backend/modules/auth/services/AuthService.js`, `backend/middleware/verifyToken.js` |
| Rate limits | `backend/middleware/rateLimit.js` |
| Queue / WS | `backend/helpers/queue/jobQueue.js`, `backend/helpers/ws/hub.js` |
| Schema | `backend/prisma/schema.prisma`, `backend/prisma.config.ts` |
| Frontend patterns | `frontend/src/server/api.js`, `frontend/src/App.jsx`, `frontend/src/components/common/index.js` |

The codebase is the single source of truth. Outdated docs are bugs.

## Conventions

- No emojis in docs content.
- Markdown in `ryo-docs/src/content/` — every `.md` file auto-registers as a nav page (slug = path minus `content/` + `.md`; title = first `#` H1; description = first non-heading line).
- Use relative links between docs pages (e.g. `./backend/authentication`, `../deployment`).
- Code blocks must be runnable examples, not fiction.

## Build Verification

Any doc change must keep the site building:

```bash
cd ryo-docs && npm run build     # tsc -b && vite build
```

## History

This docs site previously described a fictional codebase (AI agents, GSAP/Radix design system, OAuth/MFA, PlanetScale, port 4000, `success`/`data` envelopes). That content was replaced with documentation of the real framework. Do not reintroduce fictional features; if a doc claims something, the code must back it up.
