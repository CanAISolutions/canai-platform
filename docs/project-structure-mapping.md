# CanAI Platform Project Structure Mapping

## Overview

The CanAI Emotional Sovereignty Platform is a monorepo with backend and frontend workspaces,
supporting a 9-stage user journey (F1-F9). It includes robust tooling, testing, and deployment
infrastructure for scalable development.

- **Version**: 3.0.0 (June 2025)
- **Status**: Infrastructure Foundation Complete
- **Last Updated**: December 18, 2024

## Project Structure

```
canai-platform/
├── .cursor/                    # Cursor IDE rules
├── .github/                    # GitHub Actions workflows
├── .husky/                     # Git hooks
├── .roo/                       # Roo configuration
├── .taskmaster/                # TaskMaster AI configuration
├── .vscode/                    # VS Code settings
├── backend/                    # Backend APIs (workspace)
├── frontend/                   # React/Vite app (workspace)
├── databases/                  # Database schemas
├── docs/                       # Documentation
├── packages/                   # Shared utilities
├── scripts/                    # Automation scripts
├── coverage/                   # Test coverage
├── node_modules/               # Dependencies
└── [config files]              # Root configs
```

## Detailed Structure

### 1. Configuration & Tooling

- **.cursor/rules/**: Development guidelines
  - canai-typescript-rules.mdc
  - canai-testing-rules.mdc
  - canai-security-rules.mdc
  - canai-production-readiness.mdc
  - taskmaster.mdc
- **.github/workflows/**: 17 CI/CD pipelines
  - ci.yml: Main pipeline
  - test.yml: Unit, integration, e2e tests
  - lint.yml: ESLint, Prettier
  - performance.yml: Performance monitoring
  - security.yml: Security scans
- **.taskmaster/config/**: TaskMaster AI settings
- **Root Configs**:
  - .eslintrc.js
  - .prettierrc.js
  - tsconfig.json
  - vitest.config.ts
  - render.yaml
  - docker-compose.yml
  - taskmaster_tasks.md

### 2. Backend (Workspace)

```
backend/
├── api/src/                   # Express APIs
│   ├── App.ts
│   ├── Server.ts
│   └── Contexts/             # Domain logic
├── config/                   # Configurations
│   └── quizRules.json
├── middleware/               # Express middleware
├── routes/                   # API routes
├── services/                 # Business logic
├── supabase/client.js        # Supabase client
├── tests/                    # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── webhooks/                 # Make.com scenarios
│   └── make_scenarios/
└── server.js                 # Entry point
```

### 3. Frontend (Workspace)

```
frontend/
├── src/
│   ├── components/           # Feature-based React components
│   │   ├── DiscoveryHook/    # F1: Hero.tsx, CTAButtons.tsx
│   │   ├── PurchaseFlow/     # F4: CheckoutModal.tsx
│   │   ├── DetailedInput/    # F5: StepOneForm.tsx
│   │   ├── IntentMirror/     # F6: SummaryCard.tsx
│   │   ├── SparkSplit/       # F8: EmotionalCompass.tsx
│   │   ├── feedback/         # F9: StarRating.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── pages/                # 9-stage journey
│   │   ├── DiscoveryHook.tsx # F1
│   │   ├── PurchaseFlow.tsx  # F4
│   │   ├── DetailedInput.tsx # F5
│   │   ├── IntentMirror.tsx  # F6
│   │   ├── SparkSplit.tsx    # F8
│   │   └── Feedback.tsx      # F9
│   ├── utils/                # Integrations
│   │   ├── supabase.ts
│   │   ├── memberstack.ts
│   │   └── analytics.ts
│   └── tests/                # Unit, integration, e2e
├── public/                   # Static assets
├── vite.config.ts            # Vite build
└── tailwind.config.ts        # Tailwind CSS
```

### 4. Database

```
databases/
├── migrations/               # Schemas
├── seed/                     # Seed data
└── cron/                     # Scheduled tasks
```

### 5. Documentation

```
docs/
├── api/endpoints.md          # API docs
├── deployment/guide.md       # Deployment guide
├── crm-export-guide.md       # CRM integration
├── glossary.md               # Project terms
└── project-structure-mapping.md # This document
```

### 6. Shared Packages

```
packages/
├── config/                   # Shared configs
└── tsconfig/                 # TypeScript configs
    ├── api.json
    └── ui.json
```

## Architecture Patterns

- **Monorepo**: Backend, frontend, shared workspaces
- **9-Stage Journey**:
  - F1: Discovery Hook
  - F2: Discovery Funnel
  - F3: Spark Layer
  - F4: Purchase Flow
  - F5: Detailed Input
  - F6: Intent Mirror
  - F7: Deliverable Generation
  - F8: SparkSplit
  - F9: Feedback Capture
- **Integrations**:
  - Supabase: Database, auth
  - Make.com: Automation
  - Memberstack: User management
  - Stripe: Payments
  - PostHog: Analytics
- **Standards**:
  - TypeScript (strict)
  - WCAG 2.2 AA accessibility
  - <2s response times
  - Vitest testing
  - ESLint, Prettier

## Development Status

### Completed

- ✅ Monorepo setup
- ✅ Frontend: 9-stage journey components
- ✅ Tooling: Cursor, TaskMaster, ESLint
- ✅ CI/CD: 17 GitHub Actions workflows
- ✅ Testing: Vitest structure
- ✅ Documentation: CRM, deployment, glossary
- ✅ Backend: Directory structure

### Pending

- 🔄 Backend routes, services, middleware
- 🔄 Database schemas, migrations
- 🔄 Test case implementation

## Development Workflow

### Setup

1. `npm install` (root)
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`
4. Full: `npm run dev`

### Commands

- Test: `npm run test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck:strict`
- Format: `npm run format`
- Build: `npm run build`

### Quality Assurance

- Pre-commit hooks
- 17 CI/CD workflows
- CodeRabbit reviews
- Performance monitoring (Lighthouse)
- Security scans
- GDPR-compliant analytics

## Deployment

- **Platform**: Render
- **Containerization**: Docker
- **Config**: render.yaml
- **Checklists**: .github/templates/

## Next Steps

- Implement backend routes, services, middleware
- Define database schemas, migrations
- Write unit, integration, e2e tests
- Enhance monitoring with Sentry
- Populate email templates, webhooks
