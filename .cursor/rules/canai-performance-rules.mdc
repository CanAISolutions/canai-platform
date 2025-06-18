---
description: 
globs: 
alwaysApply: true
---
# CanAI Performance Rules

## Purpose
Ensure a fast, scalable CanAI Emotional Sovereignty Platform with strict performance targets: <200ms APIs, <1.5s page loads, <2s deliverable generation, and support for 10k monthly users with 99.9% uptime.

## Standards

### Performance Targets
- **API Endpoints**:
  - Spark Generation: ≤1.5s via `/v1/generate-sparks` (`backend/routes/sparks.js`)
  - Deliverable Generation/Revision: ≤2s via `/v1/request-revision` (`backend/routes/deliverables.js`)
  - Error Responses/Email Triggers: ≤100ms (`backend/middleware/error.js`)
  - Auto-Save: ≤200ms via `/v1/save-progress` (`backend/routes/inputs.js`)
  - Tooltip Load: ≤100ms via `/v1/generate-tooltip` (`backend/routes/tooltip.js`)
  - Make.com Webhook Response: ≤200ms (`backend/webhooks/`)
  - Contradiction/NSFW Detection: ≤200ms (`backend/routes/contradiction.js`, `backend/routes/filter.js`)
- **Frontend Performance**:
  - Webflow Page Load: ≤1.5s (Lighthouse score ≥90)
  - Modal/Card/Sample Load: ≤1s (`frontend/src/components/`)
  - Swipeable cards: ≥48px tap targets for responsiveness
- **Latency Budgets**:
  - P50: Deliverable Generated ≤1500ms
  - P95: ≤2000ms
  - P99: ≤4000ms (with streaming)
  - Single API call: <200ms

### Caching Strategy
- **Node-Cache Implementation** (`backend/services/cache.js`):
  - API Responses: TTL 5min for `/v1/messages`, `/v1/pricing`
  - Spark Generation: TTL 1hr for `/v1/generate-sparks`
  - Tooltips: TTL 1hr for `/v1/generate-tooltip` 
  - Cache keys: `sparks_{businessType}_{tone}_{outcome}`, `tooltip_{field}`
- **Supabase Caching** (`databases/spark_cache`):
  - Store cached sparks with cache_key, sparks JSONB, expires_at
  - Implement cache-first strategy (check cache before GPT-4o)
  - Cache hit rate target: >80%
- **Frontend Caching**:
  - Webflow CMS content cached with TTL 1h
  - Sample PDFs served from Supabase storage with public read access
  - localStorage fallbacks for API failures (F2-E1, F3-E1)

### Load Testing & Scalability
- **Load Testing** (`backend/tests/load.test.js`):
  - Validate with 10k users using Locust
  - Ensure Render auto-scaling in `docker-compose.yml`
  - Test critical endpoints under concurrent load
- **Scalability Requirements**:
  - Stateless backend on Render serverless Node.js
  - Support 10k monthly users without performance degradation
  - Health checks via `backend/health.js`

### Database Performance
- **Supabase Optimization** (`databases/migrations/`):
  - Indexes for performance: `idx_prompt_logs_user_id`, `idx_comparisons_trust_delta`, `idx_initial_prompt_logs_user_id`, `idx_spark_logs_initial_prompt_id`
  - Async/await for all database operations
  - Batch writes: `supabase.from('session_logs').insert([...])`
  - RLS policies optimized for query performance

### AI Service Performance
- **GPT-4o Optimization** (`backend/services/gpt4o.js`):
  - Async calls to reduce blocking
  - Token management: 128K tokens/req, chunk inputs for large payloads
  - MapReduce for token overflow scenarios
- **Hume AI Circuit Breaker** (`backend/middleware/hume.js`):
  - Fallback to GPT-4o sentiment if >900 req/day
  - Track -0.2 TrustDelta impact in fallback scenarios
  - <5% requests should use fallback

### Frontend Optimization
- **React/Vite Performance** (`frontend/`):
  - Dynamic imports for non-critical components
  - Lazy loading with `React.memo`
  - Asset minification via `frontend/vite.config.ts`
  - Code splitting by route/component
- **Component Performance**:
  - Minimize re-renders with proper dependency arrays
  - Use React Server Components where applicable
  - Implement Suspense boundaries with fallbacks

### Monitoring & Analytics
- **PostHog Tracking** (`backend/services/posthog.js`):
  - `posthog.capture('api_latency', { endpoint: 'string', duration_ms: number })`
  - `posthog.capture('page_load', { page: 'string', load_time_ms: number })`
  - `posthog.capture('spark_generation_time', { duration_ms: number })`
  - `posthog.capture('user_load', { active_users: number, response_time_ms: number })`
- **Sentry Monitoring** (`backend/services/sentry.js`):
  - Track performance bottlenecks
  - Monitor Render instance usage
  - Alert on performance degradation >10%
- **Error Logging**:
  - Log to Supabase `databases/error_logs` with `error_type: 'latency'`
  - Performance issues logged with context and stack traces

### Cost-Performance Optimization
- **Service Usage Tracking** (`databases/usage_logs`):
  - Monitor GPT-4o token usage (~1,000 tokens/output)
  - Track Hume AI call count (max 1,000/day)
  - Cost estimates: GPT-4o ~$50/month, Hume AI ~$100/month for 10k users
- **Optimization Strategies**:
  - Regular review of LLM cost and performance metrics
  - Optimize prompt efficiency without compromising quality
  - Implement intelligent caching to reduce API calls

### Regression Gates
- **CI/CD Performance Checks** (`.github/workflows/performance.yml`):
  - Fail CI/CD on >10% performance degradation
  - Lighthouse validation for page loads
  - Jest cache hit rate verification (`backend/tests/cache.test.js`)
  - Load test execution before production deployment

## Validation

### Testing Requirements
- **Load Testing**: Locust tests for 10k concurrent users
- **Performance Testing**: Jest unit tests for latency targets
- **Frontend Testing**: Lighthouse CI for performance scores ≥90
- **Cache Testing**: Verify cache hit rates and TTL behavior
- **API Testing**: Validate all endpoints meet latency targets

### Acceptance Criteria
- AC-1: All API endpoints meet latency targets under 10k user load
- AC-2: Webflow page load <1.5s, Lighthouse Performance score ≥90
- AC-3: Error responses <100ms, verified by automated tests
- AC-4: 99.9% uptime for critical services
- AC-5: Cache hit rate >80% for frequently accessed endpoints
- AC-6: No performance degradation under sustained load

### Monitoring Dashboards
- PostHog performance metrics dashboard
- Sentry performance monitoring alerts
- Supabase query performance tracking
- Real-time latency monitoring for critical endpoints

## Technical Implementation

### File Structure Targets
- `backend/services/cache.js` - Node-cache implementation
- `backend/tests/load.test.js` - Locust load testing
- `backend/middleware/performance.js` - Performance monitoring middleware
- `frontend/vite.config.ts` - Frontend optimization configuration
- `databases/migrations/` - Performance-optimized indexes
- `.github/workflows/performance.yml` - CI/CD performance validation

### Performance Middleware
- Request timing middleware for all API routes
- Automatic performance logging to PostHog
- Circuit breaker patterns for external services
- Rate limiting with performance-aware thresholds

## References
- PRD Sections: 7.1 (Performance), 7.4 (Scalability), 7.6 (Cost Controls)
- Project Structure: `backend/services/`, `backend/tests/`, `frontend/src/`, `databases/migrations/`
- Monitoring: PostHog analytics, Sentry performance tracking
- Load Testing: Locust configuration, Jest performance tests

---
**Updated**: June 18, 2025  
**Version**: 2.0.0  
**Scope**: Backend optimization, frontend performance, database indexing, monitoring







