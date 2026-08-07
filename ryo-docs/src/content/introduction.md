# Introduction

A production-grade SaaS scaffold. Bootstrap a new SaaS product (CRM, ERP, LMS, HRMS, marketplace, ...) without starting from zero. Auth, background jobs, realtime events, deployment pipeline, and common infrastructure are built, tested, and production-ready.

## What You Get

- **Backend** — Express 5 API, Prisma 7 + PostgreSQL, JWT + opaque refresh-token auth, Redis-backed rate limiting, queue, WebSocket hub, audit logging, S3/Cloudinary uploads, SMTP email.
- **Frontend** — React 19 SPA (Vite 7, Tailwind 4), lazy-loaded routes, central API client with automatic token refresh, common UI primitives, 10 landing-page templates.
- **Ops** — Docker, PM2 (cluster API + worker fork), blue-green deploy to EC2 via GitHub Actions, container entrypoint runs migrations before boot.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js 22, Express 5 |
| Database ORM | Prisma 7 + `@prisma/adapter-pg` (pg.Pool) |
| Database | PostgreSQL |
| Cache / Queue / Realtime | Redis 5 |
| Auth | JWT (24h access + 7d refresh rotation), bcrypt |
| Files | multer → AWS S3 or Cloudinary |
| Email | nodemailer SMTP (SES-compatible), dev-mode logging |
| SMS / WhatsApp | Twilio (unwire if unused) |
| Payments | Razorpay (unwire if unused) |
| Jobs | Custom Redis BLPOP queue (3 retries + stuck-job recovery) + node-cron |
| Process manager | PM2 (cluster API + fork worker) |
| Realtime | WebSocket bridging Redis pub/sub |
| Frontend | React 19, React Router 7, Vite 7 (SWC) |
| Styling | Tailwind CSS 4 (Vite plugin, no config file) |
| State | React Context + useState (no Redux / Zustand / React Query) |
| HTTP client | Native `fetch` (no axios on the frontend) |
| Icons | Phosphor Icons + react-icons + lucide-react |
| Tests | `node:test` (backend), Vitest (frontend) |

**No TypeScript** on either side (exception: `frontend/src/components/designs/` templates are TSX). **No Prettier.** ESLint 9 flat config only.

## Repository Layout

```
.
├── ARCHITECTURE.md          # stack reference, naming, module loop, security checklist
├── AGENTS.md                # agent guide (this repo)
├── SOURCE-MAPPING.md        # every file: purpose, status, what to customize
├── backend/                 # Express API, worker, Prisma, jobs, scripts
├── frontend/                # React SPA + Express static host
└── ryo-docs/                # this documentation site
```

## Quick Start

```bash
# backend
cd backend
cp .env.example .env           # fill DATABASE_URL, JWT_SECRET, REDIS_*
npm install
npm run migrate:deploy         # or npm run gen:migration <name> during dev
npm run create:superadmin      # bootstrap admin user
npm run dev

# frontend
cd frontend
cp .env.example .env
npm install
npm run dev                    # Vite dev server, proxies /api + /ws to backend
```

## Module Creation Loop

```bash
npm run gen:module invoice                 # 1. scaffold backend module
npm run gen:model Invoice id:cuid name:String amount:Float createdAt:DateTime  # 2. model
npm run gen:migration add_invoice          # 3. migration
# 4. implement logic in modules/invoice/services/InvoiceService.js
# 5. wire routes in modules/invoice/routes/invoiceRoutes.js
#    (routes/index.js is auto-updated by gen:module)
# 6. add API namespace to frontend/src/server/api.js
# 7. build page in frontend/src/pages/invoice/InvoicePage.jsx
# 8. add route in frontend/src/App.jsx
npm run gen:postman "My App API"           # 9. Postman collection
```

## Conventions in One Line

Backend = plain JS (ESM, `"type": "module"`). Frontend = JSX (ESM). Every API response uses the standard envelope (`responseCode` / `responseMessage` / `responseData`). Every fetch goes through `frontend/src/server/api.js`. Every realtime event goes through the shared WS hub. New domain code extends the module pattern, never forks it.
