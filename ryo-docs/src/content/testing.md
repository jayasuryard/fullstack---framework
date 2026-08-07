# Testing

Two separate suites, run with `npm test` in each workspace.

## Backend — `node:test`

Plain Node test runner. No Jest, no Vitest on the backend.

```bash
cd backend
npm test                        # unit tests
RUN_INTEGRATION=1 npm run test:integration   # integration (Docker required)
```

### Unit tests

- 14 tests, plus 14 integration-flavored tests skipped by default (they need the Docker services).
- Files: `backend/tests/*.test.js`.

### Integration tests

Need two Docker services, used **only** by the test suite:

```bash
docker run -d --name fw-test-pg -p 55432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saas_framework_test postgres:16

docker run -d --name fw-test-redis -p 56379:6379 redis:7
```

- Run with `RUN_INTEGRATION=1 npm run test:integration` (single concurrency).
- 14 tests: real auth flow (login → refresh rotation → logout), lockout, rate limits, upload validation, envelope codes.
- The suite wires its own Prisma client and Redis, and cleans up after itself.

## Frontend — Vitest

```bash
cd frontend
npm test
```

- 2 test files, 14 tests total (auth helpers, `api.js` request building, storage).
- Vitest 4, runs in jsdom-like env (see `vite.config.js` test section).

## Static Gates (CI + pre-push)

| Gate | Command |
|------|---------|
| Backend lint | `cd backend && npm run lint` (script `scripts/lintCheck.js`) |
| Frontend lint | `cd frontend && npm run lint` (ESLint 9 flat config) |
| Frontend typecheck | `cd frontend && npm run typecheck` (`tsc --noEmit`) |
| Frontend build | `cd frontend && npm run build` (Vite) |
| Docs build | `cd ryo-docs && npm run build` (`tsc -b && vite build`) |

CI workflow: `.github/workflows/ci.yml` (repo root) runs all gates. Push to `deployment-dev` runs them again before the blue-green deploy.

## Writing a Backend Test

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('envelope: success code 1000', () => {
  const { response } = require('../helpers/apiResponse')
  const res = response('SUCCESS', { ok: true })
  assert.equal(res.responseCode, 1000)
  assert.deepEqual(res.responseData.result, { ok: true })
})
```

## Writing a Frontend Test

```js
import { describe, it, expect } from 'vitest'
import { unwrapApiResult } from '../src/server/api'

describe('unwrapApiResult', () => {
  it('returns result for code 1000', () => {
    expect(unwrapApiResult({ responseCode: 1000, responseData: { result: { a: 1 } } })).toEqual({ a: 1 })
  })
})
```
