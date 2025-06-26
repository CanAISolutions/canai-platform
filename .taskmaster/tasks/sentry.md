# Scope of Work: Task 4 - Setup Sentry Error Monitoring

## Objective
Implement Sentry error monitoring and performance tracking for a full-stack TypeScript/JavaScript application (Node.js backend, React frontend) to achieve robust error capture, performance monitoring, privacy compliance, and production readiness, as outlined in PRD.md.

## Key Deliverables
1. Initialized Sentry SDK in backend and frontend with environment-specific DSN configuration.
2. Configured error capture with custom error boundaries, context enrichment, and PII scrubbing.
3. Enabled performance monitoring for APIs, database queries, and user flows.
4. Set up release tracking with automated source map uploads and CI/CD integration.
5. Configured alert rules and notification channels for critical errors and performance issues.
6. Updated documentation in `docs/project-structure-mapping.md` and `analytics-implementation-log.md`.

## Subtasks

### Subtask 4.1: Initialize Sentry SDK with DSN Configuration
- **Backend**:
  - Install `@sentry/node` and configure with DSN from environment variables.
  - Initialize Sentry in the application entry point.
  - Verify setup by triggering a test error.
- **Frontend**: ✅ Complete
  - Installed `@sentry/react` v7+ and configured with DSN from environment variables.
  - No longer uses `@sentry/tracing` or `BrowserTracing` (deprecated in v7+).
  - Initialized Sentry in the React entry point (`main.tsx`).
  - App is wrapped in a custom ErrorBoundary for UI error capture.
  - Verified setup by triggering a test error, then removed test logic and manual trigger button.
- **Documentation**:
  - DSN configuration and initialization documented in `docs/project-structure-mapping.md` and `analytics-implementation-log.md`.
  - Verification steps and removal of test logic are recorded.

### Subtask 4.2: Configure Error Capture and Custom Contexts
- **Backend**:
  - Implement PII scrubbing using Sentry's `beforeSend` to redact sensitive data (e.g., passwords, emails).
  - Enrich events with user, session, endpoint, and custom tags.
  - Add global error handlers and breadcrumbs for context.
- **Frontend**:
  - Implement Sentry's React error boundary HOC to catch UI errors.
  - Enrich events with user, session, route, and custom tags.
  - Add breadcrumbs for user interactions.
  - Test error capture with simulated errors.
- **Documentation**:
  - Document error boundaries, context enrichment, and scrubbing in `docs/project-structure-mapping.md` and `analytics-implementation-log.md`.

### Subtask 4.3: Set Up Performance Monitoring and Release Tracking
- **Backend**:
  - Enable performance monitoring with `@sentry/node` and configure transaction/spans for API endpoints and database queries (e.g., Prisma).
  - Set up release tagging with app version and deployment ID.
  - Automate source map uploads in CI/CD pipeline (e.g., GitHub Actions).
- **Frontend**:
  - Enable performance monitoring with `@sentry/tracing` and configure `BrowserTracing` for route and user flow tracking.
  - Set up release tagging with app version and deployment ID.
  - Automate source map uploads in CI/CD pipeline.
- **Documentation**:
  - Document performance monitoring setup and release tracking in `docs/project-structure-mapping.md` and `analytics-implementation-log.md`.

  Task 4.3 Execution Plan
Backend
1. Performance Monitoring
Current: Sentry is initialized with tracesSampleRate and profilesSampleRate in backend/api/src/instrument.ts.
Missing: Explicit transaction and span creation for API endpoints and database queries (e.g., Prisma).
Action:
Add Sentry transaction and span logic to key API endpoints and database calls.
Ensure Prisma integration is present if using Prisma.
2. Release Tagging
Current: release: process.env.npm_package_version is set.
Action:
Ensure your CI/CD sets npm_package_version or equivalent for deployments.
3. Source Map Uploads
Current: No source map upload step found.
Action:
Add a CI/CD step (e.g., GitHub Actions) to upload backend source maps to Sentry after build.
Frontend
1. Performance Monitoring
Current: Sentry is initialized in frontend/src/main.tsx with tracesSampleRate and release.
Note: Sentry v7+ does not use BrowserTracing or @sentry/tracing.
Action:
Confirm that route/user flow tracing is working (Sentry v7+ should auto-capture navigations).
Add custom transactions for critical user flows if needed.
2. Release Tagging
Current: release: import.meta.env.VITE_APP_VERSION || 'dev' is set.
Action:
Ensure your CI/CD sets VITE_APP_VERSION or equivalent for deployments.
3. Source Map Uploads
Current: No source map upload step found.
Action:
Add a CI/CD step to upload frontend source maps to Sentry after build.
Documentation
Action:
Update docs/project-structure-mapping.md and docs/analytics-implementation-log.md with:
Where and how Sentry is initialized.
How performance monitoring and release tagging are configured.
How source maps are uploaded.
Validation results.
Step 1: Backend – Add Transaction/Span Logic
I will:
Identify a key API endpoint and database call (Prisma or similar).
Add Sentry transaction and span logic to those locations.
Step 2: Backend – Add Source Map Upload to CI/CD
I will:
Draft a GitHub Actions (or similar) step for uploading backend source maps to Sentry.
Step 3: Frontend – Add Source Map Upload to CI/CD
I will:
Draft a GitHub Actions (or similar) step for uploading frontend source maps to Sentry.
Step 4: Documentation
I will:
Prepare updates for docs/project-structure-mapping.md and docs/analytics-implementation-log.md to reflect the above changes.

### Subtask 4.4: Configure Alerts for Critical Errors and User Identification
- **Alerting**:
  - Set up Sentry alert rules for high error frequency and performance degradation.
  - Configure notifications to email and/or Slack channels.
- **User Identification**:
  - Attach user IDs and session data to Sentry events for debugging and support.
- **Documentation**:
  - Document alert rules and user identification setup in `docs/project-structure-mapping.md` and `analytics-implementation-log.md`.

## Alignment with PRD.md Goals
1. **Robust Error Capture**: Full-stack Sentry integration ensures all critical errors are captured and actionable.
2. **Privacy Compliance**: PII scrubbing and GDPR-conscious handling meet compliance requirements.
3. **User/Session Context**: Enriched events with user and session data support debugging and analytics.
4. **Performance Monitoring**: Transaction and span tracking ensure performance SLAs and proactive issue detection.
5. **Alerting & Incident Response**: Configured alerts enable rapid response to critical issues.
6. **Production Readiness**: Automated release tracking and CI/CD integration reduce deployment risks.
7. **Documentation**: Updated docs maintain transparency and auditability.

## Key Considerations
- **PII Scrubbing**: Test scrubbing logic for all payloads, especially nested objects, to prevent data leaks.
- **Source Maps**: Ensure source maps are uploaded for every production build to maintain readable stack traces.
- **Alert Tuning**: Set appropriate alert thresholds to avoid fatigue.
- **Performance Overhead**: Monitor Sentry's impact on application latency.
- **CI/CD Validation**: Confirm Sentry release steps don't disrupt the pipeline.
- **Context Consistency**: Ensure user/session data is accurate, even for edge cases (e.g., anonymous users).

## Assumptions
- Environment variables for Sentry DSN are available in development and production.
- CI/CD pipeline (e.g., GitHub Actions) is configured to support source map uploads and release tagging.
- Team has access to email/Slack for alert notifications.

## Risks & Mitigations
1. **Risk**: Incomplete PII scrubbing exposes sensitive data.
   - **Mitigation**: Implement and test custom scrubbers; review Sentry events regularly.
2. **Risk**: Missing source maps result in unreadable stack traces.
   - **Mitigation**: Automate and verify source map uploads in CI/CD.
3. **Risk**: Alert fatigue reduces incident response effectiveness.
   - **Mitigation**: Tune alert thresholds and prioritize critical issues.
4. **Risk**: Performance tracing impacts application latency.
   - **Mitigation**: Set low `tracesSampleRate` in production and monitor performance.

