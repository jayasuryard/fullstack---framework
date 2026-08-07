# Development Phases

Building a SaaS product with this framework follows five phases. Each phase keeps the app working while layering on the next concern.

## Phase 1: Setup and Auth

- Provision PostgreSQL + Redis; copy `.env.example` and fill values.
- `npm run migrate:deploy`, `npm run create:superadmin`.
- Verify: `POST /api/v1/common/auth/login` returns token + user; refresh rotation works; lockout triggers after 5 failures.
- Frontend: `npm run dev`; login page logs in and lands on the dashboard.
- Exit criteria: register (or bootstrap) an admin, log in, log out, refresh survives page reload.

## Phase 2: Domain Module

- Pick your first domain (e.g. `invoice`, `course`, `project`).
- Follow the module loop: `gen:module` → `gen:model` → `gen:migration` → service → routes → `api.js` namespace → page → route in `App.jsx`.
- Enforce `role('admin')` and `requireReadWrite()` on mutating routes.
- Exit criteria: CRUD page that lists, creates, updates, deletes rows, with pagination meta.

## Phase 3: Realtime and Jobs

- Long-running work → `enqueueJob('domain:action', payload, { userId })`.
- Handler in `backend/workers/`; register in `worker.js`.
- Progress streaming: `emitToChannel('job:<jobId>', ...)`; UI: `useWebSocket('job:<jobId>', handler)`.
- Audit writes via `helpers/auditLogger.js` for sensitive mutations.
- Exit criteria: a job executes on the worker, progress shows live in the browser, failure retries 3 times.

## Phase 4: Files, Email, Polish

- Uploads: multer `validatedUpload` middleware (MIME + magic bytes, 5 MB) → S3/Cloudinary.
- Transactional email via `helpers/emailService.js` (SMTP; dev logs).
- Profile page: photo crop (`react-easy-crop`) + `profile/update` FormData flow.
- Exit criteria: avatar upload with preview, password reset email path works end to end.

## Phase 5: Deploy

- Push `deployment-dev` → dev blue-green on EC2.
- Tag `v*` → prod.
- Verify `/health/deep`, logs (pino JSON), rollback behavior.
- Set up monitoring + audit purge cron (default: 90 days at 03:00).

## Suggested Timeline

- Solo full-time: 2–4 weeks to a deployed MVP (auth + 1 module + jobs + deploy).
- Team of 2–3: 1–2 weeks.
