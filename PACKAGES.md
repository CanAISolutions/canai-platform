# Package Organization

## Development Dependencies

### Type Safety & Build Tools
- `@types/node`: TypeScript definitions for Node.js
- `@types/react`: TypeScript definitions for React
- `@types/react-dom`: TypeScript definitions for React DOM
- `typescript`: TypeScript compiler
- `@typescript-eslint/eslint-plugin`: TypeScript ESLint plugin
- `@typescript-eslint/parser`: TypeScript ESLint parser
- `vite`: Build tool and dev server
- `turbo`: Monorepo build system

### Testing & Quality Assurance
- `@testing-library/react`: React testing utilities
- `@testing-library/jest-dom`: DOM testing utilities
- `jest`: JavaScript testing framework
- `jest-environment-jsdom`: Jest environment for DOM testing

### Code Quality & Linting
- `eslint`: JavaScript linter
- `eslint-config-prettier`: Prettier integration for ESLint
- `eslint-plugin-react`: React ESLint plugin
- `eslint-plugin-react-hooks`: React Hooks ESLint plugin
- `prettier`: Code formatter

### Git Hooks & Commit Management
- `husky`: Git hooks
- `lint-staged`: Run linters on staged files
- `@commitlint/cli`: Commit message linter
- `@commitlint/config-conventional`: Conventional commit config

## Production Dependencies

### Core Framework
- `react`: UI library
- `react-dom`: React DOM rendering
- `react-router-dom`: Routing library

### State Management & Data Fetching
- `@tanstack/react-query`: Data fetching and caching
- `zustand`: State management

### UI Components & Styling
- `@headlessui/react`: Unstyled UI components
- `@heroicons/react`: Icon library
- `tailwindcss`: Utility-first CSS framework
- `@tailwindcss/forms`: Form styling
- `@tailwindcss/typography`: Typography styling
- `autoprefixer`: CSS vendor prefixing
- `postcss`: CSS processing
- `clsx`: Class name utilities

### Backend & Database
- `@supabase/supabase-js`: Supabase client
- `@supabase/auth-helpers-react`: Supabase auth helpers

### Authentication & Payments
- `@memberstack/react`: MemberStack integration
- `@stripe/stripe-js`: Stripe client
- `stripe`: Stripe server SDK

### Analytics & Monitoring
- `posthog-js`: PostHog analytics
- `@sentry/react`: Sentry error tracking (React)
- `@sentry/node`: Sentry error tracking (Node)

### Caching & Performance
- `redis`: Redis client
- `ioredis`: Redis client with promises

### Utilities
- `date-fns`: Date manipulation
- `zod`: Schema validation
- `uuid`: Unique ID generation 