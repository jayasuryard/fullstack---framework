# Testing

RyoFramework follows a comprehensive testing strategy covering both backend and frontend, with a focus on reliability, regression prevention, and developer confidence.

## Testing Strategy Overview

### Test Pyramid

```
        ╱─────╲
       ╱  E2E  ╲          ← Few: Critical user journeys
      ╱─────────╲
     ╱Integration╲         ← Some: API endpoints, service interactions
    ╱─────────────╲
   ╱   Unit Tests  ╲       ← Many: Isolated business logic
  ╱─────────────────╲
```

### Test Categories

| Layer | Type | Focus | Tools |
|---|---|---|---|
| Backend | Unit | Services, utils, validators | Vitest, Jest |
| Backend | Integration | API endpoints, middleware | Supertest, Vitest |
| Frontend | Unit | Components, hooks, utils | Vitest, Testing Library |
| Frontend | Integration | Page flows, feature interactions | Testing Library |
| E2E | End-to-end | Critical user journeys | Playwright, Cypress |

## Backend Testing

### Test Setup

```javascript
// tests/setup.js
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Use test database
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ryo_framework_test';
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean data between tests
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { app, prisma };
```

### API Tests

```javascript
// tests/api/auth.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../setup.js';

describe('POST /api/auth/signup', () => {
  it('creates a new user account', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'SecureP@ss1',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'SecureP@ss1', firstName: 'T', lastName: 'U' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'SecureP@ss2', firstName: 'T', lastName: 'U' });

    expect(res.status).toBe(409);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: 'SecureP@ss1', firstName: 'T', lastName: 'U' });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: '123', firstName: 'T', lastName: 'U' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Seed a test user
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'SecureP@ss1', firstName: 'T', lastName: 'U' });
  });

  it('authenticates with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecureP@ss1' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});
```

### Service Tests

```javascript
// tests/services/authService.test.js
import { describe, it, expect, vi } from 'vitest';
import * as authService from '../../src/services/authService.js';
import prisma from '../../src/config/database.js';
import bcrypt from 'bcryptjs';

vi.mock('../../src/config/database.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

describe('authService.signup', () => {
  it('hashes password before storing', async () => {
    const mockUser = {
      id: 'uuid',
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      status: 'ACTIVE',
    };

    prisma.user.create.mockResolvedValue(mockUser);
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await authService.signup({
      email: 'test@example.com',
      password: 'SecureP@ss1',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
          password: expect.not.stringContaining('SecureP@ss1'), // Should be hashed
        }),
      })
    );
  });

  it('throws on duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      authService.signup({ email: 'existing@example.com', password: 'P@ss1234' })
    ).rejects.toThrow();
  });
});
```

## Frontend Testing

### Component Tests

```javascript
// tests/components/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../src/components/LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('LoginForm', () => {
  it('renders login form fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<LoginForm onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecureP@ss1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecureP@ss1',
      });
    });
  });
});
```

### Integration Tests

```javascript
// tests/features/AuthenticationFlow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationFlow } from '../../src/features/AuthenticationFlow';

describe('Authentication Flow', () => {
  it('completes full signup flow', async () => {
    renderWithProviders(<AuthenticationFlow />);
    const user = userEvent.setup();

    // Click sign up link
    await user.click(screen.getByText(/create account/i));

    // Fill registration form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecureP@ss1');

    // Submit
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

## Test Fixtures and Factories

### Factory Functions

```javascript
// tests/factories/user.factory.js
import bcrypt from 'bcryptjs';

export function buildUser(overrides = {}) {
  return {
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 12),
    firstName: 'Test',
    lastName: 'User',
    role: 'MEMBER',
    status: 'ACTIVE',
    emailVerifiedAt: new Date(),
    ...overrides,
  };
}

export function buildOrganization(overrides = {}) {
  return {
    name: 'Test Organization',
    slug: 'test-org',
    ...overrides,
  };
}

export function buildPlan(overrides = {}) {
  return {
    name: 'Pro Plan',
    slug: 'pro',
    price: 29.99,
    interval: 'month',
    active: true,
    ...overrides,
  };
}
```

### Test Database Helpers

```javascript
// tests/helpers/database.js
import prisma from '../../src/config/database.js';
import { buildUser, buildOrganization } from '../factories/user.factory.js';

export async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: buildUser(overrides),
  });
}

export async function createTestOrganization(overrides = {}) {
  return prisma.organization.create({
    data: buildOrganization(overrides),
  });
}

export async function createAuthenticatedUser() {
  const user = await createTestUser();
  const { generateAccessToken } = await import('../../src/utils/tokens.js');
  const token = generateAccessToken(user);
  return { user, token };
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ryo_framework_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - run: npm ci
        working-directory: backend

      - run: npx prisma generate
        working-directory: backend

      - run: npx prisma db push
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ryo_framework_test

      - run: npm test
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ryo_framework_test
          JWT_SECRET: test-jwt-secret
          JWT_EXPIRES_IN: 15m
          REFRESH_TOKEN_SECRET: test-refresh-secret
          REFRESH_TOKEN_EXPIRES_IN: 7d

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - run: npm ci
        working-directory: frontend

      - run: npm test
        working-directory: frontend

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'

      - run: npm ci
        working-directory: backend

      - run: npm run lint
        working-directory: backend

      - run: npm ci
        working-directory: frontend

      - run: npm run lint
        working-directory: frontend
```

## Coverage Requirements

### Thresholds

| Metric | Required |
|---|---|
| Overall line coverage | ≥ 80% |
| Backend service coverage | ≥ 85% |
| Frontend component coverage | ≥ 75% |
| Critical path coverage | 100% |

### Configuration

```javascript
// vitest.config.js (backend)
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/config/database.js'],
    },
  },
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest tests/api/auth.test.js

# Watch mode
npx vitest --watch

# UI mode
npx vitest --ui
```

## Testing Conventions

### Naming

```
tests/
├── api/
│   ├── auth.test.js
│   ├── users.test.js
│   └── organizations.test.js
├── services/
│   ├── authService.test.js
│   └── userService.test.js
├── factories/
│   ├── user.factory.js
│   └── organization.factory.js
├── helpers/
│   └── database.js
└── setup.js
```

### Test Descriptions

- `describe('POST /api/auth/login')` — groups by endpoint
- `it('authenticates with valid credentials')` — describes expected behavior
- `it('rejects invalid password')` — covers error cases

### Assertion Patterns

1. **Status codes**: Verify HTTP response codes
2. **Response structure**: Check `success`, `data`, and error fields
3. **Business logic**: Validate transformation and computation
4. **Side effects**: Verify database state after operations
5. **Edge cases**: Empty inputs, missing fields, boundary values
