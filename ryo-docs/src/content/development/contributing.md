# Contributing

Thank you for your interest in contributing to RyoFramework! This guide will help you get started with contributing effectively.

## Code of Conduct

Be respectful, inclusive, and constructive. We are committed to providing a welcoming environment for all contributors.

## Setting Up the Development Environment

### Prerequisites

- **Node.js** v24 or later
- **npm** v10 or later
- **Docker Desktop** (for PostgreSQL)
- **Git**

### Installation

```bash
# Fork and clone the repository
git clone https://github.com/your-username/ryoframework.git
cd ryoframework

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Set up environment
cp ../backend/.env.example ../backend/.env

# Start PostgreSQL
cd ..
docker compose up -d postgres

# Push schema to database
cd backend && npx prisma db push

# Seed data
node prisma/seed.js

# Start development servers
npm run dev  # API on :4000
# In another terminal:
cd ../frontend && npm run dev  # UI on :5173
```

### Default Credentials

| Email | Password | Role |
|---|---|---|
| `admin@ryoforge.com` | `admin123` | SUPER_ADMIN |
| `user@ryoforge.com` | `user123` | MEMBER |

## Pull Request Workflow

### Step 1: Find or Create an Issue

- Search existing issues to avoid duplicates
- Comment on the issue to express interest
- For new features, open an issue first to discuss the approach

### Step 2: Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**

| Prefix | Purpose |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |
| `test/` | Test additions or modifications |
| `chore/` | Build process, dependencies, tooling |

### Step 3: Make Changes

- Follow the [coding standards](#coding-standards)
- Write or update tests
- Update documentation if needed
- Keep changes focused and atomic

### Step 4: Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Lint
cd backend && npm run lint
cd frontend && npm run lint
```

### Step 5: Commit Changes

```bash
git add .
git commit -m "feat: add user profile avatars"
```

**Commit message format:**
```
<type>: <description>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

### Step 6: Push and Open a Pull Request

```bash
git push origin feat/your-feature-name
```

Then open a PR on GitHub with:
- Clear description of changes
- Reference to the related issue (e.g., `Closes #123`)
- Screenshots for UI changes
- Testing steps

### Step 7: Code Review

- Respond to reviewer feedback
- Make requested changes
- Keep the PR up to date with the base branch

## Code Review Process

### Reviewer's Checklist

- [ ] Code follows project standards and conventions
- [ ] Tests are added/updated and passing
- [ ] Documentation is updated (if applicable)
- [ ] No security vulnerabilities introduced
- [ ] Error handling is appropriate
- [ ] Performance implications considered
- [ ] No unnecessary dependencies added
- [ ] Migration scripts are correct (if schema changed)

### Review Procedure

1. **Initial review** within 48 hours
2. **Author responds** to feedback within 1 week
3. **Final approval** from at least one maintainer
4. **Merge** after approval (squash commits)

## Coding Standards

### Backend (JavaScript)

- **Syntax**: ES modules (`import`/`export`), no CommonJS
- **Naming**: `camelCase` for variables and functions, `PascalCase` for classes
- **Error handling**: Use `ApiError` class, pass errors to `next()`
- **Async**: Use `async/await`, avoid raw promises
- **Imports**: Group by: 1) external packages, 2) internal modules, 3) controllers/services
- **File structure**: One export per file (default export for main, named for helpers)

```javascript
// Good
import express from 'express';
import prisma from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
```

### Frontend (TypeScript/React)

- **TypeScript**: Strict mode, avoid `any`
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **State management**: TanStack Query for server state, React state for UI state
- **Forms**: React Hook Form with Zod validation
- **Imports**: Group by: 1) React/external, 2) components, 3) features, 4) utils

```tsx
// Good component structure
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../design-system/Button';
import { useAuth } from '../../hooks/useAuth';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Component logic
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  );
}
```

### Prisma Schema

- **Field names**: `camelCase`
- **Model names**: `PascalCase`, singular
- **Relations**: Always define on both sides with `@relation`
- **Indexes**: Add `@@index` for frequently queried fields
- **Soft delete**: Use `deletedAt DateTime?` pattern

### Testing

```javascript
// Test structure
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Setup: create test data
  });

  it('authenticates with valid credentials', async () => {
    // Arrange
    // Act
    // Assert
  });

  it('rejects invalid password', async () => {
    // Error case
  });
});
```

## Documentation Standards

### Location

- Framework documentation: `ryo-docs/src/content/`
- API reference: `api.md`
- Code comments: Only for complex logic, not obvious code

### Format

- Use Markdown with proper heading hierarchy
- Include code examples for APIs and configuration
- Tables for structured information
- Links between related documents
- Realistic, practical examples

### Types of Documentation

| Type | Description | Example |
|---|---|---|
| Overview | High-level concepts | AI architecture, database design |
| Reference | Detailed specifications | API endpoints, configuration |
| Guide | Step-by-step instructions | Deployment, migration |
| FAQ | Common questions | Troubleshooting, customizations |

## Issue Reporting Guidelines

### Bug Reports

```
**Describe the bug**
A clear description of the issue.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

**Expected behavior**
What should happen instead.

**Screenshots**
If applicable.

**Environment**
- OS: [e.g., macOS 14.5]
- Node version: [e.g., 24.0.0]
- Browser: [e.g., Chrome 126]
- RyoFramework version: [e.g., 1.0.0]

**Additional context**
Any relevant logs or information.
```

### Feature Requests

```
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other approaches you've thought about.

**Additional context**
Any other information.
```

## Getting Help

- Open an issue on GitHub
- Check the [FAQ](/reference/faq) and [Troubleshooting](/reference/troubleshooting) guides
- Review existing issues and pull requests
