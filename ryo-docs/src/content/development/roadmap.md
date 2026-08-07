# Roadmap

Current state and planned direction.

## Done

- Authentication: JWT access + opaque rotating refresh, lockout, OTP reset, session kill switch
- Rate limiting: Redis-backed hybrid store, per-limiter presets, prod boot guard
- Realtime: shared WS hub, job progress channels, `wsClient` + `useWebSocket`
- Jobs: BLPOP queue with retries + stuck-job recovery
- Uploads: allowlist + magic bytes + SVG rejection, 5 MB
- Frontend: lazy routes, manualChunks, common kit, 10 landing templates
- Deploy: blue-green dev + prod pipelines
- Tests: backend unit + integration (Docker), frontend vitest

## In Progress

- Integration test coverage expansion (queue failure paths, WS channel ownership)
- Docs site parity with the codebase (this rewrite)

## Planned

- **Multi-tenancy**: harden subdomain detection into request-scoped tenant context with enforced scoping in services (framework provides detection today).
- **Module templates**: richer `gen:module` output (CRUD page + api.js namespace generated, not stubbed).
- **Billing + payments**: Razorpay integration module (unwired today).
- **Monitoring**: metrics endpoint, structured log ingestion, alerting on `/health/deep` failures.
- **Files**: signed-URL uploads (direct-to-S3) as an alternative to proxy uploads.
- **Realtime presence**: user presence channel over the existing hub.

## Long Term

- OAuth/SSO provider module (OIDC) — currently out of scope by design.
- MFA (TOTP) as an opt-in module.
- Admin panel generation from Prisma models.
- Publish the module pattern as a CLI (`saas-framework new <app>`).

## Guiding Principles

- Keep the dependency surface small; prefer framework code over new libraries.
- Security defaults on: auth chains, rate limits, upload validation, boot guards.
- Docs must track code — stale docs are treated as bugs.
