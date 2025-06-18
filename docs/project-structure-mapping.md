# CanAI Platform Project Structure Mapping

## Overview

This document provides a comprehensive mapping of the CanAI Emotional Sovereignty Platform project
structure, organized by functional areas and responsibilities. The platform is structured as a
monorepo with workspaces for backend and frontend applications, supporting the complete 9-stage
user journey (F1-F9) with comprehensive tooling, testing, and deployment infrastructure.

## Root Level Structure

```
canai-platform/
├── .cursor/                    # Cursor IDE configuration and comprehensive rules
├── .github/                    # GitHub Actions workflows and templates
├── .husky/                     # Git hooks configuration
├── .vscode/                    # VS Code configuration
├── .yarn/                      # Yarn 2+ configuration
├── backend/                    # Backend services and APIs (workspace)
├── frontend/                   # React/Vite frontend application (workspace)
├── databases/                  # Database schemas, migrations, and seed data
├── docs/                       # Comprehensive project documentation
├── packages/                   # Shared packages and configurations
├── coverage/                   # Test coverage reports
├── node_modules/               # Root dependencies
└── [config files]             # Root-level configuration files
```

## Detailed Folder Structure

### 1. Configuration & Tooling

```
.cursor/
└── rules/                      # Comprehensive Cursor IDE rules for CanAI development
    ├── canai-analytics-rules.mdc       # Analytics and tracking standards
    ├── canai-api-rules.mdc             # API development guidelines
    ├── canai-ci-cd-rules.mdc           # CI/CD pipeline standards
    ├── canai-cortex-rules.mdc          # Project memory and milestone tracking
    ├── canai-data-lifecycle-rules.mdc  # Data management and lifecycle
    ├── canai-docs-rules.mdc            # Documentation standards
    ├── canai-error-handling-rules.mdc  # Error handling patterns
    ├── canai-feature-flags-rules.mdc   # Feature flag management
    ├── canai-github-rules.mdc          # GitHub workflow standards
    ├── canai-llm-prompting.mdc         # LLM prompt engineering
    ├── canai-llm-rules.mdc             # LLM integration guidelines
    ├── canai-make-automation.mdc       # Make.com automation rules
    ├── canai-memberstack-sync.mdc      # Memberstack integration
    ├── canai-observability-rules.mdc   # Monitoring and observability
    ├── canai-performance-rules.mdc     # Performance optimization
    ├── canai-security-rules.mdc        # Security implementation
    ├── canai-structure-rules.mdc       # Project structure guidelines
    ├── canai-supabase-rules.mdc        # Supabase integration rules
    ├── canai-taskmaster-rules.mdc      # Task management and tracking
    ├── canai-testing-rules.mdc         # Testing strategies and standards
    ├── canai-typescript-rules.mdc      # TypeScript development rules
    ├── canai-user-journey.mdc          # User journey implementation
    ├── cortex.md                       # Project memory and milestone tracking
    └── README.md                       # Rules documentation overview

.github/
├── workflows/
│   ├── ci.yml                         # Main CI/CD pipeline
│   └── rules-validation.yml           # Cursor rules validation
└── [templates/]                       # Issue and PR templates

.husky/
└── commit-msg                         # Git commit message validation

Root Config Files:
├── .coderabbit.yaml                   # Code review configuration
├── .cursor.config.json                # Cursor IDE configuration
├── .dockerignore                      # Docker ignore patterns
├── .editorconfig                      # Editor configuration
├── .eslintrc.js                       # ESLint configuration
├── .gitignore                         # Git ignore patterns
├── .npmrc                             # NPM configuration
├── .nvmrc                             # Node version specification
├── .pre-commit-config.yaml            # Pre-commit hooks configuration
├── .prettierrc.js                     # Prettier formatting rules
├── .yarnrc                            # Yarn configuration
├── commitlint.config.js               # Commit message linting
├── docker-compose.yml                 # Docker services configuration
├── Dockerfile.backend                 # Backend containerization
├── env.example                        # Environment variables template
├── eslint-preset.js                   # Custom ESLint preset
├── eslint.config.js.backup            # ESLint config backup
├── LICENSE                            # Project license
├── package.json                       # Root package configuration (monorepo)
├── package-lock.json                  # NPM lock file
├── PACKAGES.md                        # Package documentation
├── PRD.md                             # Product Requirements Document
├── render.yaml                        # Render deployment configuration
├── RULES-ENFORCEMENT.md               # Rules enforcement documentation
├── Taskmaster-Tasks.md                # Task management and tracking
├── tsconfig.json                      # Root TypeScript configuration
├── tsconfig.tsbuildinfo               # TypeScript build info
├── vitest.config.ts                   # Vitest test runner configuration
├── vitest.setup.ts                    # Vitest setup configuration
├── yarn.lock                          # Yarn lock file
└── yarn-error.log                     # Yarn error logs
```

### 2. Backend Services (Workspace)

```
backend/
├── api/                               # Domain-driven API architecture
│   ├── src/
│   │   ├── App.ts                     # Express application setup
│   │   ├── Server.ts                  # Server configuration
│   │   ├── Contexts/                  # Domain contexts
│   │   │   └── Todo/                  # Todo domain logic (example)
│   │   └── Shared/                    # Shared utilities
│   │       ├── BootstrapAsyncDepdencies.ts
│   │       ├── Constants.ts
│   │       └── Logger.ts
│   ├── package.json                   # API-specific dependencies
│   ├── tsconfig.json                  # API TypeScript configuration
│   └── .eslintrc.js                   # API ESLint configuration
├── dist/                              # Compiled backend output
├── middleware/                        # Express middleware (currently empty - to be populated)
├── prompts/                           # LLM prompt templates
├── routes/                            # API route definitions (currently empty - to be populated)
├── services/                          # Business logic services (currently empty - to be populated)
├── supabase/                          # Supabase client configuration
│   └── client.js
├── tests/                             # Backend test suites
├── webhooks/                          # Webhook handlers
│   └── make_scenarios/                # Make.com scenario configurations
│       ├── add_client.json            # Client creation automation
│       ├── add_project.json           # Project creation automation
│       ├── admin_add_project.json     # Admin project creation
│       └── SAAP Update Project Blueprint.json  # Project update automation
├── health.js                          # Health check endpoint
├── package.json                       # Backend dependencies
├── server.js                          # Main server entry point
├── tsconfig.json                      # Backend TypeScript configuration
└── vitest.config.ts                   # Backend test configuration
```

### 3. Frontend Application (Workspace)

```
frontend/
├── src/
│   ├── components/                    # React components organized by feature
│   │   ├── CanAICube.tsx             # Brand components
│   │   ├── CanAILogo.tsx
│   │   ├── Confetti.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PreviewModal.tsx
│   │   ├── PricingCard.tsx
│   │   ├── PricingModal.tsx
│   │   ├── ProductCards.tsx
│   │   ├── StandardBackground.tsx     # Standardized components
│   │   ├── StandardCard.tsx
│   │   ├── StandardTypography.tsx
│   │   ├── TrustIndicators.tsx
│   │   ├── DetailedInput/             # F5: Detailed Input Collection
│   │   │   ├── AutoSaveIndicator.tsx
│   │   │   ├── StepOneForm.tsx
│   │   │   └── StepTwoForm.tsx
│   │   ├── DiscoveryHook/             # F1: Discovery Hook
│   │   │   ├── CTAButtons.tsx
│   │   │   ├── EnhancedHero.tsx
│   │   │   ├── EnhancedSecondaryCTAs.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── MemberstackLoginButton.tsx
│   │   │   ├── ProductCardsSection.tsx
│   │   │   ├── PsychologicalTrustIndicators.tsx
│   │   │   ├── SecondaryCTAs.tsx
│   │   │   └── TrustIndicatorsSection.tsx
│   │   ├── enhanced/                  # Enhanced UI components
│   │   │   ├── ErrorBoundaryFallback.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   ├── feedback/                  # F9: Feedback Capture
│   │   │   ├── DangerZone.tsx
│   │   │   ├── EnhancedReferral.tsx
│   │   │   ├── EnhancedSocialShare.tsx
│   │   │   ├── Followup.tsx
│   │   │   ├── ReferModal.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── SuccessAnimation.tsx
│   │   ├── IntentMirror/              # F6: Intent Mirror
│   │   │   ├── EditModal.tsx
│   │   │   └── SummaryCard.tsx
│   │   ├── PurchaseFlow/              # F4: Purchase Flow
│   │   │   ├── CheckoutModal.tsx
│   │   │   ├── ConfirmationSection.tsx
│   │   │   ├── PricingTable.tsx
│   │   │   ├── ProductSwitchModal.tsx
│   │   │   └── RefundPolicyModal.tsx
│   │   ├── Samples/                   # Sample outputs display
│   │   │   └── SampleMetricBadge.tsx
│   │   ├── SparkSplit/                # F8: SparkSplit comparison
│   │   │   ├── ComparisonContainer.tsx
│   │   │   ├── EmotionalCompass.tsx
│   │   │   ├── EmotionalResonanceDisplay.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   ├── ProjectContextSummary.tsx
│   │   │   ├── RefinedComparisonContainer.tsx
│   │   │   ├── RefinedFeedbackForm.tsx
│   │   │   ├── SparkleIcon.tsx
│   │   │   ├── TrustDeltaDisplay.tsx
│   │   │   ├── TrustDeltaStars.tsx
│   │   │   └── utils.tsx
│   │   ├── ui/                        # Shared UI components (shadcn/ui)
│   │   │   ├── accordion.tsx          # Radix UI components
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── background-image.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── enhanced-button.tsx    # Custom enhanced components
│   │   │   ├── form.tsx
│   │   │   ├── hero-image.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── mobile-optimized-card.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── optimized-image.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── responsive-modal.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── standard-button.tsx    # Standardized components
│   │   │   ├── standard-components.ts
│   │   │   ├── standard-form.tsx
│   │   │   ├── standard-indicators.tsx
│   │   │   ├── standard-modal.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── validated-form.tsx
│   │   └── ui-components/             # Additional UI components
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAccessibility.ts
│   │   ├── useFeedbackForm.ts
│   │   ├── useFormValidation.ts
│   │   └── usePerformanceMonitor.ts
│   ├── integrations/                  # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/                           # Utility libraries
│   │   ├── accessibility.ts
│   │   └── utils.ts
│   ├── pages/                         # Page components (9-stage journey)
│   │   ├── DeliverableGeneration.tsx  # F7: Deliverable Generation
│   │   ├── DetailedInput.tsx          # F5: Detailed Input Collection
│   │   ├── DiscoveryFunnel.tsx        # F2: 2-Step Discovery Funnel
│   │   ├── DiscoveryHook.tsx          # F1: Discovery Hook
│   │   ├── Feedback.tsx               # F9: Feedback Capture
│   │   ├── Index.tsx                  # Landing page
│   │   ├── IntentMirror.tsx           # F6: Intent Mirror
│   │   ├── NotFound.tsx               # 404 page
│   │   ├── PurchaseFlow.tsx           # F4: Purchase Flow
│   │   ├── Samples.tsx                # Sample outputs
│   │   ├── SparkLayer.tsx             # F3: Spark Layer
│   │   └── SparkSplit.tsx             # F8: SparkSplit
│   ├── styles/                        # CSS styles
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── themes.css
│   │   └── utilities.css
│   ├── tests/                         # Frontend tests
│   │   ├── DeliverableGeneration.test.tsx
│   │   ├── F9-feedback-flow.test.tsx
│   │   └── IntentMirror.test.tsx
│   ├── types/                         # TypeScript type definitions
│   │   └── formTypes.ts
│   ├── utils/                         # Utility functions
│   │   ├── analytics.ts               # PostHog analytics
│   │   ├── api.ts                     # API client
│   │   ├── deliverableApi.ts          # F7 API integration
│   │   ├── detailedInputIntegration.ts # F5 integration
│   │   ├── discoveryFunnelApi.ts      # F2 API integration
│   │   ├── intentMirrorIntegration.ts # F6 integration
│   │   ├── makecom.ts                 # Make.com integration
│   │   ├── memberstack.ts             # Memberstack integration
│   │   ├── memberstackAuth.ts         # Authentication
│   │   ├── purchaseAnalytics.ts       # Purchase tracking
│   │   ├── purchaseFlowApi.ts         # F4 API integration
│   │   ├── sparkLayerApi.ts           # F3 API integration
│   │   ├── sparkSplitApi.ts           # F8 API integration
│   │   ├── supabase.ts                # Supabase client
│   │   └── tracing.ts                 # Performance tracing
│   ├── App.css                        # Application styles
│   ├── App.tsx                        # Main application component
│   ├── index.css                      # Global styles
│   ├── main.tsx                       # Application entry point
│   └── vite-env.d.ts                  # Vite environment types
├── tests/                             # Frontend test directories
│   ├── e2e/                          # End-to-end tests
│   ├── integration/                  # Integration tests
│   └── unit/                         # Unit tests
├── public/                           # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── dist/                             # Built frontend assets
├── bun.lockb                         # Bun lock file
├── components.json                   # shadcn/ui configuration
├── eslint.config.js                  # Frontend ESLint configuration
├── index.html                        # HTML template
├── package.json                      # Frontend dependencies
├── package-lock.json                 # NPM lock file
├── postcss.config.js                 # PostCSS configuration
├── README.md                         # Frontend documentation
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.app.json                 # App TypeScript configuration
├── tsconfig.json                     # Frontend TypeScript configuration
├── tsconfig.node.json                # Node TypeScript configuration
└── vite.config.ts                    # Vite configuration
```

### 4. Database & Migrations

```
databases/
├── migrations/                       # Database migration files
├── seed/                            # Database seed data
└── todo-database/                   # Todo example database
```

### 5. Documentation

```
docs/
├── api/
│   └── endpoints.md                 # API endpoint documentation
├── deployment/
│   └── guide.md                    # Deployment guide
├── development/
│   ├── architecture.md             # System architecture
│   └── setup.md                   # Development setup
├── visions/                        # Product vision documents
├── api-contract-specification.md
├── change-management-versioning-matrix.md
├── coding-standards-style-guide.md
├── data-model-schema.md
├── deployment-operations-playbook.md
├── project-structure-mapping.md   # This document
├── prompt-engineering-templates.md
├── README.md
├── risk-assumption-log.md
├── taskmaster-deployment-prep.md
├── technical-architecture-document-(TAD).md
└── test-case-specification.md
```

### 6. Shared Packages

```
packages/
├── config/                          # Shared configuration
│   └── node_modules/               # Config dependencies
└── tsconfig/                       # TypeScript configurations
    ├── api.json                    # API TypeScript config
    ├── package.json                # TypeScript config package
    └── ui.json                     # UI TypeScript config
```

### 7. Additional Directories

```
coverage/                           # Test coverage reports
node_modules/                       # Root dependencies
.vscode/                           # VS Code workspace settings
.yarn/                             # Yarn 2+ cache and configuration
```

## Key Architecture Patterns

### 1. Monorepo Structure
The project uses a monorepo approach with workspaces:
- **Root Level**: Shared configuration, documentation, and tooling
- **Backend Workspace**: API services, webhooks, and business logic
- **Frontend Workspace**: React application with Vite build system
- **Shared Packages**: Common TypeScript configurations and utilities

### 2. 9-Stage User Journey Mapping

The frontend is organized around the 9-stage user journey:

- **F1**: Discovery Hook (`/pages/DiscoveryHook.tsx`, `/components/DiscoveryHook/`)
- **F2**: 2-Step Discovery Funnel (`/pages/DiscoveryFunnel.tsx`)
- **F3**: Spark Layer (`/pages/SparkLayer.tsx`)
- **F4**: Purchase Flow (`/pages/PurchaseFlow.tsx`, `/components/PurchaseFlow/`)
- **F5**: Detailed Input Collection (`/pages/DetailedInput.tsx`, `/components/DetailedInput/`)
- **F6**: Intent Mirror (`/pages/IntentMirror.tsx`, `/components/IntentMirror/`)
- **F7**: Deliverable Generation (`/pages/DeliverableGeneration.tsx`)
- **F8**: SparkSplit (`/pages/SparkSplit.tsx`, `/components/SparkSplit/`)
- **F9**: Feedback Capture (`/pages/Feedback.tsx`, `/components/feedback/`)

### 3. Integration Points

- **Supabase**: Database and authentication (`/integrations/supabase/`)
- **Make.com**: Workflow automation (`/backend/webhooks/make_scenarios/`)
- **Memberstack**: User management (`/utils/memberstack.ts`)
- **PostHog**: Analytics (`/utils/analytics.ts`)
- **Stripe**: Payment processing (integrated in Purchase Flow)

### 4. Development Standards

- **TypeScript**: Strict typing throughout with comprehensive rules
- **Component Architecture**: Feature-based organization with standardized components
- **Testing**: Unit, integration, and e2e tests with Vitest
- **Performance**: Optimized for <2s response times
- **Accessibility**: WCAG 2.2 AA compliance
- **Code Quality**: ESLint, Prettier, and comprehensive Cursor rules

### 5. Build and Deployment

- **Frontend**: Vite-based build system with React and TypeScript
- **Backend**: Node.js/Express with TypeScript compilation
- **Containerization**: Docker support with multi-stage builds
- **Deployment**: Render-based deployment with automated CI/CD
- **Monitoring**: Comprehensive observability with Sentry and PostHog

## Current State Analysis

### Implemented Components
- ✅ **Monorepo Structure**: Full workspace separation with proper dependency management
- ✅ **Frontend Architecture**: Complete 9-stage journey implementation with comprehensive component library
- ✅ **Development Tooling**: Extensive Cursor rules, ESLint, Prettier, TypeScript strict mode
- ✅ **Testing Infrastructure**: Vitest setup with coverage reporting
- ✅ **Build System**: Modern Vite-based frontend build with TypeScript compilation
- ✅ **Integration Layer**: Comprehensive API utilities for all external services

### Areas for Development
- 🔄 **Backend Routes**: Currently empty - needs population with API endpoints per PRD
- 🔄 **Backend Services**: Currently empty - needs business logic implementation
- 🔄 **Backend Middleware**: Currently empty - needs authentication and validation middleware
- 🔄 **Database Migrations**: Basic structure exists but needs PRD-specific schemas

### Key Observations
- The project structure is well-organized and aligns with the comprehensive Cursor rules
- Frontend is feature-complete with all 9-stage journey components implemented
- Backend has the foundation but needs API implementation to match frontend capabilities
- Comprehensive tooling and quality assurance infrastructure is in place

## Usage Instructions

This structure supports:

1. **Scalable Development**: Clear separation of concerns with monorepo benefits
2. **PRD Alignment**: Direct mapping to 9-stage journey and business requirements
3. **Integration Ready**: Built for external service integration with robust APIs
4. **Testing**: Comprehensive test coverage across all layers
5. **Documentation**: Self-documenting architecture with extensive rules
6. **Performance**: Optimized build and deployment processes
7. **Quality Assurance**: Automated validation and quality gates

## Development Workflow

### Getting Started
1. **Root Setup**: `npm install` (installs all workspace dependencies)
2. **Backend Development**: `cd backend && npm run dev`
3. **Frontend Development**: `cd frontend && npm run dev`
4. **Full Development**: `npm run dev` (runs both backend and frontend)

### Key Commands
- **Testing**: `npm run test` (runs all tests with coverage)
- **Linting**: `npm run lint` (ESLint across all workspaces)
- **Type Checking**: `npm run typecheck:strict` (strict TypeScript validation)
- **Formatting**: `npm run format` (Prettier formatting)
- **Validation**: `npm run canai:validate` (comprehensive quality checks)
- **Build**: `npm run build` (builds both workspaces for production)

### Quality Assurance
- **Pre-commit Hooks**: Automated validation before commits
- **CI/CD Pipeline**: GitHub Actions with comprehensive testing
- **Code Review**: CodeRabbit integration for automated reviews
- **Rules Enforcement**: Comprehensive Cursor rules for consistent development

## Next Steps

When showcasing to an LLM, highlight:

- The monorepo structure with clear workspace separation
- The 9-stage journey organization with comprehensive component mapping
- Integration patterns with external services and robust API architecture
- TypeScript-first approach with strict quality standards
- Component-based architecture with standardized UI components
- Performance and accessibility focus with comprehensive testing
- Extensive tooling and automation for development efficiency
- Comprehensive documentation and rules for consistent development experience

## Version History

- **Current Version**: 2.0.0 - Updated to reflect monorepo structure and current file organization
- **Previous Version**: 1.0.0 - Original structure mapping from initial documentation
- **Last Updated**: December 2024 - Reflecting actual project state with comprehensive tooling
- **Coverage**: Complete mapping of all directories, files, and architectural patterns including:
  - Monorepo workspace structure with backend/frontend separation
  - Comprehensive Cursor rules and development tooling
  - Complete 9-stage user journey component mapping
  - Modern build system with Vite and TypeScript strict mode
  - Comprehensive testing and quality assurance infrastructure
