# AI Agent System

RyoFramework includes a multi-agent AI system designed for collaborative development assistance. Each agent has a specialized role, knowledge domain, and set of responsibilities.

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Agent Orchestrator                         │
│         Routes requests to the appropriate agent(s)          │
└──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────┘
       │      │      │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼      ▼      ▼
    ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
    │Arch│ │BEnd│ │FEnd│ │ DB │ │Sec │ │ QA │ │ Doc│
    └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘
       │      │      │      │      │      │      │
       └──────┴──────┴──────┴──────┴──────┴──────┘
                    │
                    ▼
           ┌────────────┐    ┌────────────┐
           │  DevOps    │    │  Review    │
           └────────────┘    └────────────┘
```

## Agent Definitions

Agents are defined in the `ai/` directory at the project root. Each agent has:
- **Role**: The agent's title and function
- **System Prompt**: Defines behavior, expertise, and constraints
- **Capabilities**: Specific tasks the agent can perform
- **Input/Output**: Expected data format

### Architect Agent

**Role**: Software Architect  
**File**: `ai/architect.js`

**System Prompt:**
```
You are a software architect for RyoFramework. You provide architectural guidance
following clean architecture principles. Consider scalability, maintainability,
and the RyoFramework module system. Suggest patterns, component boundaries,
data flow, and technology choices.
```

**Capabilities:**
- System architecture design
- Module and service decomposition
- API design and contract definition
- Technology selection guidance
- Scalability and performance analysis

**Example usage:**
```javascript
import { architect } from '../ai/agents/architect.js';

const architecture = await architect.designSystem({
  requirements: 'Build a real-time collaborative editor',
  constraints: 'Must support 100 concurrent users',
  techStack: 'RyoFramework + WebSocket',
});
```

### Backend Agent

**Role**: Backend Developer  
**File**: `ai/backend.js`

**System Prompt:**
```
You are a backend developer specializing in Node.js, Express.js, and Prisma ORM.
You write clean, production-ready code following RyoFramework conventions.
Focus on API design, database queries, authentication, and business logic.
```

**Capabilities:**
- API endpoint implementation
- Prisma schema design and queries
- Authentication and authorization logic
- Business logic implementation
- Middleware and utility creation

### Frontend Agent

**Role**: Frontend Developer  
**File**: `ai/frontend.js`

**System Prompt:**
```
You are a frontend developer specializing in React, TypeScript, and Tailwind CSS.
You build beautiful, responsive, and accessible UI components following
RyoFramework design patterns. Use Radix UI primitives and TanStack Query.
```

**Capabilities:**
- React component development
- Page and layout creation
- Form implementation with validation
- State management with TanStack Query
- Responsive design with Tailwind CSS

### Database Agent

**Role**: Database Architect  
**File**: `ai/database.js`

**System Prompt:**
```
You are a database architect specializing in Prisma ORM and PostgreSQL.
Provide schema designs, query optimizations, and migration strategies.
Consider indexing, data integrity, and performance at scale.
```

**Capabilities:**
- Database schema design
- Query optimization
- Migration planning
- Index strategy
- Data modeling for SaaS patterns

### Security Agent

**Role**: Security Engineer  
**File**: `ai/security.js`

**System Prompt:**
```
You are a security engineer specializing in web application security.
Review code for OWASP Top 10 vulnerabilities, authentication flaws,
and data protection issues. Provide actionable remediation steps.
```

**Capabilities:**
- Security code review
- Vulnerability assessment
- Authentication analysis
- Authorization logic review
- Secure configuration guidance

### QA Agent

**Role**: Quality Assurance Engineer  
**File**: `ai/qa.js`

**System Prompt:**
```
You are a QA engineer for RyoFramework projects. Design test cases,
write test code, and ensure comprehensive coverage. Focus on edge cases,
error handling, and user experience.
```

**Capabilities:**
- Test case design
- Test code generation (Vitest)
- Edge case identification
- Integration test planning
- Coverage analysis

### Documentation Agent

**Role**: Technical Writer  
**File**: `ai/documentation.js`

**System Prompt:**
```
You are a technical writer for RyoFramework. Create clear, comprehensive
documentation with practical examples. Write for developers of varying
skill levels following the RyoFramework documentation standards.
```

**Capabilities:**
- API documentation
- User guides and tutorials
- Code comments and inline docs
- README and project documentation
- Architecture documentation

### DevOps Agent

**Role**: DevOps Engineer  
**File**: `ai/devops.js`

**System Prompt:**
```
You are a DevOps engineer specializing in Docker, CI/CD, and cloud deployment.
Optimize build pipelines, container configurations, and infrastructure setup
for RyoFramework deployments.
```

**Capabilities:**
- Docker configuration
- CI/CD pipeline design
- Deployment strategy
- Infrastructure as code
- Monitoring and logging setup

### Review Agent

**Role**: Code Reviewer  
**File**: `ai/review.js`

**System Prompt:**
```
You are a senior code reviewer for RyoFramework projects. Focus on:
security, performance, maintainability, and adherence to RyoFramework standards.
Provide specific, actionable feedback. Be thorough but constructive.
```

**Capabilities:**
- Pull request review
- Code quality assessment
- Best practice enforcement
- Performance optimization suggestions
- Security vulnerability detection

## Agent Collaboration Model

### Sequential Workflow

For complex features, agents work sequentially, passing results between stages:

```
Architect Agent → Backend Agent → Frontend Agent → Review Agent
    │                  │               │                │
    ▼                  ▼               ▼                ▼
Design Doc →   API Code →      UI Code →      Final Review
```

### Parallel Workflow

Independent tasks are executed in parallel for efficiency:

```
                    ┌──────────────────────┐
                    │     QA Agent         │
                    │  (Write tests)       │
                    └──────────────────────┘
                           Parallel
Feature Request ───────────┬──────────────────────→ Merge
                           Parallel
                    ┌──────────────────────┐
                    │   Documentation Agent │
                    │  (Write docs)         │
                    └──────────────────────┘
```

### Collaborative Workflow

Complex tasks use a collaborative pattern where agents communicate:

```
Backend Agent: "I need the API contract for user profiles"
Frontend Agent: "I need the same contract for the UI"
Architect Agent: "Here's the agreed-upon contract"
Backend Agent: "Implementing API..."
Frontend Agent: "Building UI components..."
Review Agent: "Reviewing both implementations..."
```

### Agent Communication Protocol

```javascript
// Agent message format
{
  from: 'architect',
  to: 'backend',
  type: 'contract',
  payload: {
    endpoint: 'GET /api/users/:id',
    request: {},
    response: { id: 'uuid', email: 'string', ... },
  },
  timestamp: '2026-07-22T12:00:00Z',
}
```

## Adding New Agents

### Step 1: Create the Agent File

```javascript
// ai/agents/analytics.js
export const analyticsAgent = {
  name: 'Analytics',
  role: 'Data Analyst',
  systemPrompt: `
    You are a data analyst specializing in SaaS metrics and analytics.
    Help design tracking systems, analyze user behavior, and create
    dashboards and reports following RyoFramework conventions.
  `,

  capabilities: [
    'Event tracking design',
    'Analytics dashboard creation',
    'User behavior analysis',
    'KPI definition and monitoring',
    'Report generation',
  ],
};
```

### Step 2: Register the Agent

```javascript
// ai/agents/index.js
import { architect } from './architect.js';
import { backend } from './backend.js';
import { frontend } from './frontend.js';
import { database } from './database.js';
import { security } from './security.js';
import { qa } from './qa.js';
import { documentation } from './documentation.js';
import { devops } from './devops.js';
import { review } from './review.js';
import { analytics } from './analytics.js';  // New agent

export const agents = {
  architect,
  backend,
  frontend,
  database,
  security,
  qa,
  documentation,
  devops,
  review,
  analytics,  // New agent
};
```

### Step 3: Add System Prompt

Add a prompt type for the new agent in `promptManager.js`:

```javascript
const systemPrompts = {
  // ... existing prompts
  analytics: `You are a data analyst specializing in SaaS metrics and analytics...`,
};
```

### Step 4: Create Service Functions

```javascript
// ai/aiService.js
export async function analyzeMetrics(data, type = 'user_behavior') {
  const prompt = `Analyze the following ${type} data and provide insights:\n\n${JSON.stringify(data, null, 2)}`;
  return generateResponse(prompt, null, 'analytics');
}
```

### Agent Template

Use this template when creating new agents:

```javascript
export const newAgent = {
  name: 'Agent Name',
  role: 'Agent Role Title',
  systemPrompt: `
    Describe the agent's role, expertise, and behavior.
    Include specific technologies, frameworks, and conventions
    the agent should follow.
  `,

  capabilities: [
    'Capability 1',
    'Capability 2',
    'Capability 3',
  ],

  async execute(input) {
    // Agent-specific execution logic
    const prompt = this.buildPrompt(input);
    const response = await generateResponse(prompt, null, 'agent-type');
    return this.parseResponse(response);
  },

  buildPrompt(input) {
    // Transform input into a structured prompt
    return JSON.stringify(input);
  },

  parseResponse(response) {
    // Parse AI response into structured output
    return { result: response.content };
  },
};
```

## Agent Best Practices

### Prompt Design

- **Be specific**: Define the agent's expertise, constraints, and output format
- **Provide context**: Include relevant project information (tech stack, conventions)
- **Use examples**: Show expected input/output patterns
- **Set boundaries**: Clearly state what the agent should NOT do

### Quality Assurance

- Always test agent outputs with the Review Agent
- Validate generated code against linting rules
- Run tests on agent-generated implementations
- Review agent suggestions for security implications

### Performance

- Cache frequently used agent responses
- Use streaming for long-running agent tasks
- Run independent agents in parallel
- Limit agent context to relevant information only
