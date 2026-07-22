# RyoFramework

**AI-First Production SaaS Framework**

Build production-ready SaaS applications in days instead of months.

## Architecture

```
├── backend/         # Express.js API (JavaScript)
├── frontend/        # React + Vite + Tailwind (TypeScript)
├── ai/              # AI agent definitions
├── infrastructure/  # Docker, CI/CD, deployment
├── docs/            # Documentation
├── docker-compose.yml
└── README.md
```

## Quick Start

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install

# Set up environment
cp backend/.env.example backend/.env

# Start database
docker compose up -d postgres

# Run migrations
cd backend && npx prisma db push

# Seed data
cd backend && node prisma/seed.js

# Start development
cd backend && npm run dev    # API on :4000
cd frontend && npm run dev   # UI on :5173
```

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@ryoforge.com | admin123 | SUPER_ADMIN |
| user@ryoforge.com | user123 | MEMBER |

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, TypeScript, TanStack Query
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL
- **Auth**: JWT, Refresh Tokens, RBAC
- **AI**: GROQ API
- **Deployment**: Docker, Docker Compose

## Documentation

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)

## License

MIT
