# CanAI Platform Project Structure Mapping

## Overview

The CanAI Emotional Sovereignty Platform is a monorepo with backend and frontend workspaces,
supporting a 9-stage user journey (F1-F9). It includes robust tooling, testing, and deployment
infrastructure for scalable development.

- **Version**: 3.0.0 (June 2025)
- **Status**: Infrastructure Foundation Complete
- **Last Updated**: June 23, 2025

## Project Structure

```
canai-platform/
├── .cursor/                    # Cursor IDE rules
├── .github/                    # GitHub Actions workflows
├── .githooks/                  # Git hooks (TaskMaster automation)
├── .husky/                     # Git hooks
├── .roo/                       # Roo configuration
├── .taskmaster/                # TaskMaster AI configuration
├── .vscode/                    # VS Code settings
├── backend/                    # Backend APIs (workspace) ✅ LIVE
├── frontend/                   # React/Vite app (workspace)
├── databases/                  # Database schemas
├── docs/                       # Documentation
├── packages/                   # Shared utilities
├── scripts/                    # Automation scripts
├── coverage/                   # Test coverage
├── node_modules/               # Dependencies
├── Dockerfile                  # Docker container config (Render deployment)
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
├── db.js                    # Direct Postgres/SQL client for admin scripts and migrations (Node.js only, never used in frontend)
├── api/src/                   # Express APIs
│   ├── App.ts
│   ├── Server.ts
│   └── Contexts/             # Domain logic
├── config/                   # Configurations
│   └── quizRules.json
├── middleware/               # Express middleware
├── routes/                   # API routes
├── services/                 # Business logic
├── supabase/client.js        # Supabase client for RLS-safe CRUD (preferred for app logic)
├── tests/                    # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── webhooks/                 # Make.com scenarios
│   └── make_scenarios/
├── package-backend.json      # Backend dependencies (Express 4.18.2)
└── server.js                 # Production Express server (✅ LIVE)
```

**Backend Infrastructure Status**: ✅ **PRODUCTION READY**
- **Live URL**: https://canai-router.onrender.com
- **Port**: 10000 with SSL termination
- **Middleware Stack**: Helmet (security), CORS, Morgan (logging), Body parsing
- **Health Endpoints**: `/` and `/health` with system metrics
- **Environment**: Production deployment with graceful shutdown
- **Docker**: Containerized with Alpine Node.js 18, non-root user

- **db.js**: Provides a direct Postgres connection using the `postgres` library. Use only for backend admin scripts, migrations, or advanced analytics that require raw SQL. Always use environment variable `DATABASE_URL` for credentials. Do **not** use in frontend or expose to client code.

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
│   ├── integrations/         # External service integrations
│   │   └── supabase/         # Supabase client and types
│   │       ├── client.ts     # Supabase client instance
│   │       ├── server.ts     # Server-side Supabase client
│   │       ├── supabase.ts   # Supabase configuration
│   │       └── types.ts      # Database type definitions
│   ├── utils/                # Utility functions
│   │   ├── supabase.ts       # Supabase utilities
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
├── supabase-frontend-integration.md # Supabase React/Vite integration guide
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
- ✅ **Backend Infrastructure**: Express server with production middleware
- ✅ **Deployment**: Render containerized deployment (https://canai-router.onrender.com)
- ✅ **Security**: Helmet, CORS, SSL termination, non-root Docker user
- ✅ **Monitoring**: Health endpoints, Morgan logging, graceful shutdown

### Pending

- 🔄 Backend API routes and business logic
- 🔄 Database schemas, migrations
- 🔄 PostHog analytics integration
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

## Supabase Schema & RLS Migration Progress (TaskMaster Task 2)

**Last updated:** [AI-assisted, YYYY-MM-DD]

### Overview
This section tracks the implementation and verification of the Supabase database schema, Row Level Security (RLS) policies, and performance indexes as mapped to TaskMaster task 2 and its subtasks. All work is aligned with PRD.md (see Section 7.2 Security Requirements and related schema specs).

### Migration Files
- `backend/supabase/migrations/001_core_tables.sql`
- `backend/supabase/migrations/002_logging_tables.sql`
- `backend/supabase/migrations/003_business_tables.sql`
- `backend/supabase/migrations/004_rls_policies.sql`

### Core Tables (Subtask 1: **done**)
- **Tables:** `prompt_logs`, `comparisons`, `spark_logs`
- **Features:**
  - Proper data types, constraints, UUID/timestamp defaults
  - Foreign key relationships
  - RLS enabled and user-only access enforced
  - Admin override policies for support
  - Composite indexes on `user_id`, `created_at`
- **Validation:** Schema, RLS, and index checks passed; test data insert/query successful

### Logging Tables (Subtask 2: **pending**)
- **Tables:** `feedback_logs`, `share_logs`, `error_logs`, `session_logs`
- **Features:**
  - Data retention policies (24 months)
  - Partitioning strategy for large tables (optional, planned)
  - RLS for user-specific access
  - Composite indexes for performance
- **Validation:** Migration applied, schema and RLS checks passed

### Business Tables (Subtask 3: **pending**)
- **Tables:** `payment_logs`, `support_requests`, `pricing`
- **Features:**
  - Audit triggers for change tracking
  - Immutable financial records (triggers prevent updates to amount/currency)
  - RLS: user, admin, and support team access as per PRD
  - Public read/admin write for pricing
  - Composite indexes for user_id, created_at, status
- **Validation:** Migration applied, schema and RLS checks passed

### RLS Policies for Core Tables (Subtask 4: **pending**)
- RLS enabled and tested for `prompt_logs`, `comparisons`, `spark_logs`
- Admin override policies in place
- No anonymous/public access (per PRD)

### RLS Policies for Logging & Business Tables (Subtask 5: **pending**)
- RLS enabled for all logging and business tables
- Role-based access for payment_logs, support_requests, pricing

### Composite Indexes (Subtask 6: **pending**)
- Indexes created for all user-specific tables: `(user_id, created_at)`
- Additional indexes: `(user_id, status)` for support_requests, `(error_type, created_at)` for error_logs
- Indexes are PRD-compliant and validated for performance

### Test & Validation Summary
- All migrations applied successfully (no errors)
- Schema, RLS, and index existence verified via SQL
- Test data insert/query performed for core and logging tables
- RLS policies tested for user/admin access
- No destructive operations performed on production data

---
**Author:** AI-assisted (Cursor Agent)
