# Architecture Document

## System Architecture

### High-Level Design
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  PostgreSQL │
│  (Vite +    │     │  (Express   │     │    (Prisma) │
│   React)    │◀────│   + Node)   │◀────│             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   GROQ AI   │
                    │    (API)    │
                    └─────────────┘
```

### Backend Architecture (Layered)
```
Route → Controller → Service → Repository → Database
                        │
                   ┌────┴────┐
               External     Utilities
               Services
```

### Module Architecture
Each module follows:
- `routes/` - API route definitions
- `controllers/` - Request handling
- `services/` - Business logic
- `validators/` - Input validation (Zod)
- `middleware/` - Cross-cutting concerns

### Key Patterns
- Repository Pattern for data access
- Service Layer for business logic
- Thin Controllers
- Dependency Injection via module imports
- Middleware for cross-cutting concerns
- Centralized error handling
