# Development Rules

## Core Rules
1. Never use `any` in TypeScript
2. No duplicated code
3. Follow SOLID principles
4. Keep it simple (KISS)
5. Don't repeat yourself (DRY)
6. All code must be reviewed
7. All features must have tests
8. All APIs must have validation
9. All errors must be handled
10. All secrets must be in environment variables

## Backend Rules
- Thin controllers, fat services
- No business logic in routes
- Async/await always (no raw callbacks)
- Validate all inputs with Zod
- Use Prisma for all database access
- Structured logging throughout
- Rate limit all public endpoints

## Frontend Rules
- Feature-based folder structure
- Reusable hooks for logic
- Centralized API layer (Axios + TanStack Query)
- Lazy load routes
- Error boundaries for all sections
- Dark mode support from day one
- Responsive design required

## Database Rules
- UUID primary keys
- Soft delete support
- Audit fields (createdAt, updatedAt, deletedAt)
- Indexes on foreign keys and search fields
- No raw SQL (use Prisma)
- All migrations reviewed

## Security Rules
- Helmet headers enabled
- CORS configured per environment
- Rate limiting on auth routes
- Input validation on all endpoints
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with short expiry
- Refresh token rotation
- Secure cookie configuration
