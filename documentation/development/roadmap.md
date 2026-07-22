# Roadmap

RyoFramework's development roadmap outlines planned features, improvements, and the long-term vision for the framework.

## Current Version: 1.0.0 (Released 2026)

### Features

**Authentication & Security**
- Email/password authentication with bcrypt hashing
- JWT access + refresh token system with rotation
- OAuth 2.0 integration (Google, Facebook, Apple, Microsoft, Twitter/X)
- Multi-factor authentication (TOTP)
- Brute force protection via login attempt tracking
- RBAC with role hierarchy (SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER)
- Granular permission system (action/resource model)

**User Management**
- User registration and profile management
- Email verification flow
- Password reset via email
- Account status management (PENDING, ACTIVE, SUSPENDED, BANNED)

**Organizations & Teams**
- Multi-tenant organization structure
- Team sub-grouping within organizations
- Member invitation system
- Role assignment per organization

**AI Integration**
- GROQ API integration (chat + streaming)
- Provider abstraction layer for AI services
- Prompt management with typed system prompts
- Streaming via Server-Sent Events (SSE)
- Code review and schema generation AI functions
- Conversation history persistence
- Mock mode for development without API key

**Billing**
- Subscription plan management (Free, Pro, Enterprise)
- Plan limits and feature configuration
- Invoice tracking
- Usage records for metered billing
- Coupon/discount system

**File Management**
- Multi-file upload with type whitelisting
- S3-compatible storage
- File metadata and URL management

**Notifications**
- In-app notification system
- Notification channel preferences (in_app, email, push)
- Notification templates
- Real-time notification delivery

**API Infrastructure**
- RESTful API design
- Zod-based input validation
- Rate limiting (global + per-endpoint)
- Structured JSON error responses
- Pagination for list endpoints
- CORS configuration
- Helmet.js security headers

**Database**
- Prisma ORM with PostgreSQL
- Migration workflow
- Seed data for development
- Database indexing strategy
- Soft delete support

**Frontend**
- React 18 with TypeScript
- Vite build tooling
- Tailwind CSS styling
- Radix UI primitives (accessible components)
- TanStack Query for server state
- React Hook Form with Zod validation
- GSAP animations
- Responsive design

**Deployment**
- Docker Compose for local development
- Multi-stage Docker builds
- Nginx reverse proxy configuration
- GitHub Actions CI/CD workflow
- Environment configuration management

## Upcoming Features

### Q3 2026: Visual Workflow Builder

A drag-and-drop interface for building API workflows and automations without code.

- Visual API endpoint creator
- Conditional logic branching
- Webhook triggers and actions
- AI agent integration into workflows
- Export workflows as code

### Q4 2026: AI Requirement Analyzer

An AI-powered tool that analyzes product requirements and generates implementation code.

- Natural language requirement input
- Schema generation from requirements
- API endpoint generation
- UI component suggestions
- Test case generation
- Effort estimation

### Q1 2027: Plugin Marketplace

A community-driven marketplace for extending RyoFramework.

- Plugin SDK and API
- Published plugin registry
- Plugin installation via CLI
- Plugin management dashboard
- AI agent plugins
- Theme and UI component plugins
- Community ratings and reviews

### Q2 2027: MCP (Model Context Protocol) Integration

Native support for the Model Context Protocol enabling standardized AI tool integration.

- MCP-compatible AI tool definitions
- Sandboxed code execution
- Tool discovery and registry
- Secure integration patterns
- Third-party MCP server support

### Additional Planned Features

**AI & Agents**
- Multi-provider AI support (OpenAI, Anthropic, Google Gemini)
- RAG (Retrieval-Augmented Generation) with pgvector
- Agent orchestration and collaboration
- AI-powered code generation
- Automated testing agent
- Documentation generation agent

**Infrastructure**
- Redis caching layer
- Background job queue (Bull/BullMQ)
- Real-time WebSocket support
- GraphQL API option
- Admin dashboard UI
- Multi-region deployment support
- CDN integration

**Monitoring**
- Sentry error tracking integration
- Prometheus metrics endpoint
- Structured logging with log aggregation
- Performance monitoring dashboard
- Uptime monitoring

**Enterprise**
- SAML/SSO authentication
- Audit log retention policies
- Data export/import
- Compliance reporting (SOC2, GDPR)
- Role-based admin panels
- API rate limit customization per plan

## Long-Term Vision

### Year 1: Foundation (Current)

Establish RyoFramework as the go-to AI-first SaaS framework with a solid foundation of authentication, billing, teams, and AI integration.

### Year 2: Ecosystem

Build a rich ecosystem around the framework including:
- Plugin Marketplace with community contributions
- Visual development tools
- AI-powered development assistants
- Comprehensive documentation and tutorials
- Active community forums

### Year 3: Platform

Transform RyoFramework into a complete application platform:
- No-code/low-code application builder
- AI-first development environment
- Enterprise compliance and governance
- Managed hosting option
- Professional services and consulting

## Version History

| Version | Date | Highlights |
|---|---|---|
| 1.0.0 | Jul 2026 | Initial release — auth, orgs, AI, billing, files, notifications |
