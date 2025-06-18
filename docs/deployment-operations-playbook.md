# Deployment and Operations Playbook - CanAI Emotional Sovereignty Platform

## Purpose

Guides reliable deployment and production operations. Prevents deployment errors by standardizing
PRD-specified processes.

## Structure

- **Environment Setup**: Render, Supabase, .env configurations.
- **CI/CD Pipeline**: GitHub Actions steps for build/test/deploy.
- **Rollback Plan**: Git tags and failure triggers.
- **Monitoring**: Sentry, PostHog for errors and analytics.
- **Maintenance**: Data purging and health checks.

## Environment Setup

### Render

- **Backend**: `canai-router.onrender.com:10000` (IPs: 52.41.36.82, 54.191.253.12, 44.226.122.3).
- **Frontend**: `canai-frontend.onrender.com`, Webflow CMS integrated.
- **Admin Dashboard**: `canai-admin.onrender.com`, Memberstack-secured.

### Supabase

- **Database**: `db.canai.supabase.co`, configured in `.env` (`SUPABASE_URL`, `PROJECT_ID`).

### Heroku

- Fallback for backend, configured in `package.json`.

### .env

```
SUPABASE_URL=your-supabase-url
PROJECT_ID=your-supabase-project-id
OPENAI_API_KEY=your-openai-api-key
HUME_API_KEY=your-hume-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
SENTRY_DSN=your-sentry-dsn
POSTHOG_API_KEY=your-posthog-api-key
```

## CI/CD Pipeline

### Build

- **Frontend**: `npm run build` with Vite (`frontend/vite.config.ts`).
- **Backend**: `npm run build` with Docker (`docker-compose.yml`).

### Test

- **Jest**: Unit tests (`backend/tests/*.test.js`).
- **Supatest**: Integration tests (`backend/tests/api.test.js`).
- **axe-core**: Accessibility tests (`backend/tests/accessibility.test.js`).
- **Pipeline**: `.github/workflows/test.yml`.

### Deploy

- **Render**: Push to `main` branch triggers deployment (`.github/workflows/deploy.yml`).
- **Heroku**: Fallback deployment if Render fails.

## Rollback Plan

- **Git Tags**: Maintain releases (e.g., `v1.0.0`, `v1.1.0`) in `.git/`.
- **Triggers**: Failed health check (`GET /health`) or >1% error rate in Sentry.
- **Process**: Revert to previous tag, redeploy via CI/CD (<5min).

## Monitoring

- **Sentry**: Tracks errors (e.g., API timeouts, Stripe failures) (`backend/services/sentry.js`).
- **PostHog**: Captures events (e.g., `funnel_step`, `spark_selected`, TrustDelta trends)
  (`backend/services/posthog.js`).
- **Logs**: Stored in `databases/error_logs` and `databases/session_logs`.
- **Uptime**: 99.9%, validated by `GET /health`.

## Maintenance

- **Data Purging**: 24-month retention via `pg_cron` (`databases/cron/purge.sql`).
- **Health Checks**: `GET /health` every 5min, alerts via Sentry if fails.
- **Dependency Updates**: Monthly scans with Semgrep (`.github/workflows/security.yml`).
