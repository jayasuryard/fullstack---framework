# Frequently Asked Questions

## General

### What is RyoFramework?

RyoFramework is an AI-first production SaaS framework that helps developers build full-stack SaaS applications quickly. It provides a pre-built backend (Express.js, Prisma, PostgreSQL), frontend (React, Vite, Tailwind, TypeScript), and integrated AI capabilities powered by GROQ.

### Who is RyoFramework for?

Solo developers, startups, and small teams who want to launch SaaS products rapidly without rebuilding common infrastructure (auth, billing, teams, AI integration) from scratch.

### Is RyoFramework free?

Yes, RyoFramework is open source under the MIT license. You can use it for free in personal and commercial projects. There are no licensing fees or usage restrictions.

### What can I build with RyoFramework?

Any SaaS application: project management tools, analytics dashboards, AI-powered content platforms, team collaboration apps, customer portals, billing systems, and more.

### How is RyoFramework different from other SaaS starters?

RyoFramework is **AI-first** — it includes built-in AI capabilities (GROQ integration, prompt management, streaming, conversation history) that most SaaS starters lack. It also uses JavaScript (not TypeScript) for the backend, making it more accessible to a wider range of developers.

---

## Tech Stack

### Why does the backend use JavaScript instead of TypeScript?

JavaScript reduces the barrier to entry for developers who may not be familiar with TypeScript, speeds up development iteration, and keeps the codebase simpler for a framework that prioritizes rapid SaaS building. The frontend uses TypeScript for better component-level type safety.

### Why Prisma ORM instead of Drizzle or TypeORM?

Prisma offers the best developer experience with its declarative schema, auto-generated client, type-safe queries (even in JavaScript via IntelliSense), and excellent migration tooling. It handles complex relations and nested queries better than alternatives.

### Why PostgreSQL and not MySQL or SQLite?

PostgreSQL offers superior JSON support, advanced indexing (including full-text search), better concurrency handling, and a richer extension ecosystem (including pgvector for future AI embeddings). It's the industry standard for production SaaS applications.

### Why Radix UI for primitives?

Radix UI provides accessible, unstyled headless components that work seamlessly with Tailwind CSS. Unlike full component libraries (MUI, Ant Design), Radix gives full control over styling while handling accessibility, keyboard navigation, and focus management.

### Why Passport.js for OAuth?

Passport.js is the most mature and widely adopted authentication middleware for Node.js. It supports 500+ strategies, has excellent documentation, and provides a consistent API across all OAuth providers (Google, Facebook, Apple, Microsoft, Twitter).

### Why TanStack Query instead of Redux?

TanStack Query (React Query) is purpose-built for server state management — caching, background refetching, pagination, and optimistic updates. Redux is better for complex client state, but most SaaS apps primarily deal with server state. TanStack Query reduces boilerplate significantly.

### Why GROQ over OpenAI?

GROQ provides significantly faster inference speeds (up to 10x) at competitive pricing, making it ideal for real-time AI features like streaming chat and code review. The architecture supports swapping providers without code changes.

---

## Features

### What authentication methods are supported?

Email/password (with bcrypt hashing), JWT with refresh token rotation, OAuth (Google, Facebook, Apple, Microsoft, Twitter), MFA (two-factor authentication), and email verification.

### Does RyoFramework support multi-tenancy?

Yes. Organizations provide data isolation, and users can belong to multiple organizations. Team sub-grouping is also supported within organizations.

### Is there a billing system?

Yes. The framework includes subscription plans (Free, Pro, Enterprise), invoicing, payment methods, coupon support, and usage-based billing records. You can integrate with Stripe for payment processing.

### Can I customize the AI behavior?

Yes. The prompt management system allows customizing system prompts per use case (default, code review, architecture, database). You can add new prompt types, modify existing prompts, or create prompt versions.

### Does RyoFramework support file uploads?

Yes. File uploads are handled via multer with type whitelisting and size limits, stored on S3-compatible storage (AWS S3, DigitalOcean Spaces, MinIO).

---

## Customization

### Can I use a different database?

Prisma supports PostgreSQL, MySQL, SQLite, MongoDB, and SQL Server. Update the `provider` in `schema.prisma` and adjust the `DATABASE_URL` accordingly. Some PostgreSQL-specific features (JSON, full-text search) may need alternatives.

### Can I add more OAuth providers?

Yes. Add a new entry in `config/passport.js` following the existing pattern, install the corresponding Passport strategy package, and add the route. The framework supports any Passport-compatible strategy.

### Can I change the frontend framework?

The frontend is built with React, but since the API is RESTful, you can build any frontend (Vue, Angular, Svelte, mobile apps) that consumes the RyoFramework API.

### How do I add new API endpoints?

1. Create a route file in `src/routes/`
2. Create a controller in `src/controllers/`
3. Create a service in `src/services/`
4. Add validation schemas in `src/validators/`
5. Register the route in `src/app.js`

### Can I use my own AI provider?

Yes. The provider abstraction layer allows adding new providers by implementing the `chat()` and `streamChat()` interface. See the [AI Overview](/ai/overview) for implementation details.

---

## Scaling

### Is RyoFramework production-ready?

Yes. The framework includes security best practices (Helmet, CORS, rate limiting, input validation), database migration workflows, Docker deployment configuration, and a CI/CD pipeline template.

### Can RyoFramework handle thousands of users?

The architecture supports horizontal scaling. The API is stateless (JWT-based), PostgreSQL handles concurrent connections well, and the Docker setup allows scaling backend containers. For very high traffic, add Redis caching and PgBouncer connection pooling.

### How is performance optimized?

- Prisma query optimization with selective projections and eager loading
- Database indexes on all frequent query paths
- Connection pooling via Prisma's built-in pool
- Compression middleware (gzip/brotli)
- Helmet for security without performance trade-offs

### Is there a rate limiting system?

Yes. Global rate limiting (100 requests per 15 minutes per IP) with stricter limits on auth endpoints (10 requests per 15 minutes). Rate limit headers are returned with every response.

---

## Development

### How do I set up the development environment?

```bash
git clone https://github.com/yourusername/ryoframework.git
cd ryoframework
cd backend && npm install
cd ../frontend && npm install
cp backend/.env.example backend/.env
docker compose up -d postgres
cd backend && npx prisma db push && node prisma/seed.js
cd backend && npm run dev  # API on :4000
cd frontend && npm run dev # UI on :5173
```

### How do I run database migrations?

```bash
cd backend
npx prisma migrate dev --name description_of_changes  # Create migration
npx prisma migrate deploy                               # Apply in production
```

### How do I add a new model to the database?

1. Add the model definition to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Regenerate the client: `npx prisma generate`
4. Use `prisma.modelName` in your services

### What testing framework is used?

Vitest for both backend and frontend tests, with Supertest for API testing and Testing Library for React component testing.

---

## Contributions

### How can I contribute to RyoFramework?

See the [Contributing Guide](/development/contributing). We welcome contributions of all kinds: bug fixes, features, documentation, and AI agent improvements.

### How do I report a bug?

Open an issue on GitHub with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Relevant logs or screenshots

### What is the code of conduct?

Be respectful, inclusive, and constructive. We follow the Contributor Covenant code of conduct.

---

## Troubleshooting

### The API won't start

- Ensure PostgreSQL is running (`docker compose up -d postgres`)
- Check `DATABASE_URL` in `.env`
- Run `npx prisma generate` to regenerate the Prisma client
- Check for port conflicts on port 4000

### The frontend can't connect to the API

- Ensure the backend is running on port 4000
- Verify `CORS_ORIGIN` in backend `.env` matches the frontend URL
- Check browser console for CORS errors
- Ensure the API proxy is configured correctly in `vite.config.ts`

### AI responses return mock data

Set `GROQ_API_KEY` in `backend/.env` with a valid GROQ API key. Without it, the system returns mock responses for development.

### File uploads fail

- Check allowed file types (jpeg, png, gif, webp, pdf, csv)
- Ensure file size is under 10MB
- Verify S3 configuration if using cloud storage
- Check Content-Type header is `multipart/form-data`

---

## License

### What is the license?

MIT License — you can use, modify, and distribute RyoFramework freely in personal and commercial projects.

### Do I need to credit RyoFramework?

Attribution is appreciated but not required by the MIT license.

---

## Future

### Is there a plugin marketplace planned?

Yes. A plugin marketplace is on the roadmap, allowing developers to share and install extensions, themes, and AI agents for RyoFramework.

### Will there be a visual workflow builder?

Yes. A visual workflow builder is planned, enabling drag-and-drop API endpoint creation, UI component assembly, and AI agent orchestration.

### What about mobile app support?

The RESTful API can serve any mobile or desktop client. Native mobile SDKs (iOS, Android) and React Native integration are under consideration for future releases.
