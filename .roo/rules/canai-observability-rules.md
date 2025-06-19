---
description: 
globs: 
alwaysApply: true
---
# CanAI Observability Rules

## Purpose
Ensure robust monitoring and 99.9% uptime with proactive governance, comprehensive analytics, and AI-specific performance tracking for the CanAI Emotional Sovereignty Platform.

## Standards

### Logging Infrastructure
- **Sentry Integration**: Use Sentry for error tracking and performance monitoring (`backend/services/sentry.js`):
  ```ts
  import * as Sentry from '@sentry/node';
  
  // Initialize Sentry with environment configuration
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app })
    ]
  });
  
  // Log errors with context
  Sentry.captureException(error, {
    tags: { component: 'gpt4o', endpoint: '/v1/generate-sparks' },
    extra: { userId, correlationId, payload }
  });
  ```
- **PostHog Analytics**: Use PostHog for user events and business metrics (`backend/services/posthog.js`):
  ```ts
  import { PostHog } from 'posthog-node';
  
  const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
    host: 'https://app.posthog.com'
  });
  
  // Track events with standardized properties
  posthog.capture('funnel_step', {
    distinct_id: userId,
    stepName: 'discovery_hook',
    completed: true,
    dropoffReason: null,
    correlationId,
    timestamp: Date.now()
  });
  ```

### Performance Metrics & SLIs
- **Latency Monitoring**: Track p99 latency targets across all endpoints:
  - API endpoints: <200ms p99 latency
  - Spark generation: <1.5s response time
  - Deliverable generation: <2s response time
  - Error responses: <100ms
- **Performance Tracking**: Log latency metrics with PostHog:
  ```ts
  const startTime = Date.now();
  // ... operation ...
  const duration = Date.now() - startTime;
  
  posthog.capture('api_latency', {
    distinct_id: userId,
    endpoint: req.path,
    duration_ms: duration,
    correlationId,
    success: !error
  });
  
  // Alert on performance degradation
  if (duration > 200) {
    Sentry.captureMessage('Performance degradation detected', {
      level: 'warning',
      tags: { endpoint: req.path, latency: duration }
    });
  }
  ```
- **Error Rate Monitoring**: Track error rates with target <1%:
  ```ts
  // Track error rates by endpoint
  posthog.capture('api_error', {
    distinct_id: userId,
    endpoint: req.path,
    error_type: error.name,
    error_message: error.message,
    correlationId,
    stack_trace: error.stack
  });
  ```

### AI-Specific Monitoring
- **TrustDelta Tracking**: Monitor TrustDelta scores with alerts for <4.0:
  ```ts
  posthog.capture('plan_compared', {
    distinct_id: userId,
    trustDelta,
    selected: userChoice,
    emotionalResonance: { delta: resonanceDelta },
    correlationId
  });
  
  // Alert on low TrustDelta
  if (trustDelta < 4.0) {
    posthog.capture('trustdelta_alert', {
      distinct_id: userId,
      score: trustDelta,
      threshold: 4.0,
      correlationId
    });
  }
  ```
- **Emotional Resonance Monitoring**: Track Hume AI performance:
  ```ts
  posthog.capture('emotional_resonance_check', {
    distinct_id: userId,
    arousal_score: arousal,
    valence_score: valence,
    resonance_score: resonance,
    meets_threshold: resonance > 0.7,
    correlationId
  });
  
  // Flag low resonance for human review
  if (resonance < 0.7) {
    posthog.capture('low_resonance_flagged', {
      distinct_id: userId,
      resonance_score: resonance,
      threshold: 0.7,
      review_required: true,
      correlationId
    });
  }
  ```
- **AI Performance Metrics**: Track AI task success rates:
  ```ts
  // AI task completion tracking
  posthog.capture('ai_task_success', {
    distinct_id: userId,
    task_type: 'spark_generation',
    duration_ms: executionTime,
    model: 'gpt4o',
    correlationId
  });
  
  posthog.capture('ai_task_failed', {
    distinct_id: userId,
    task_type: 'spark_generation',
    error_type: 'timeout',
    model: 'gpt4o',
    correlationId
  });
  ```

### Distributed Tracing
- **OpenTelemetry Implementation**: Implement distributed tracing (`backend/services/tracing.js`):
  ```ts
  import { NodeSDK } from '@opentelemetry/auto-instrumentations-node';
  import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
  import { Resource } from '@opentelemetry/resources';
  import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
  
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'canai-backend',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });
  
  sdk.start();
  ```
- **Trace Context Propagation**: Include correlation IDs in all operations:
  ```ts
  import { trace, context } from '@opentelemetry/api';
  
  const tracer = trace.getTracer('canai-backend');
  
  const span = tracer.startSpan('generate_sparks', {
    attributes: {
      'user.id': userId,
      'correlation.id': correlationId,
      'operation.type': 'ai_generation'
    }
  });
  
  // Propagate context through async operations
  context.with(trace.setSpan(context.active(), span), async () => {
    // ... traced operation ...
    span.end();
  });
  ```

### Required Logging Fields
- **Standardized Log Structure**: Include mandatory fields in all logs:
  ```ts
  interface LogEntry {
    correlationId: string;    // UUID v4 for request tracing
    timestamp: string;        // ISO-8601 timestamp
    userId?: string;          // User identifier (masked for PII)
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    component: string;        // e.g., 'gpt4o', 'hume', 'stripe'
    endpoint?: string;        // API endpoint if applicable
    duration_ms?: number;     // Operation duration
    error_type?: string;      // Error classification
    context?: object;         // Additional context data
  }
  
  const logEvent = (entry: LogEntry) => {
    // Log to Supabase for persistence
    supabase.from('session_logs').insert({
      correlation_id: entry.correlationId,
      user_id: entry.userId,
      level: entry.level,
      message: entry.message,
      component: entry.component,
      context: entry.context,
      created_at: entry.timestamp
    });
    
    // Send to external monitoring
    if (entry.level === 'error') {
      Sentry.captureMessage(entry.message, entry.level);
    }
    
    posthog.capture('log_event', {
      distinct_id: entry.userId,
      level: entry.level,
      component: entry.component,
      correlationId: entry.correlationId
    });
  };
  ```

### Database Logging
- **Session Logs**: Store non-blocking events in `databases/session_logs`:
  ```sql
  CREATE TABLE session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    correlation_id UUID NOT NULL,
    level TEXT CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    component TEXT NOT NULL,
    endpoint TEXT,
    duration_ms INTEGER,
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_session_logs_user_id (user_id),
    INDEX idx_session_logs_correlation_id (correlation_id),
    INDEX idx_session_logs_created_at (created_at)
  );
  ```
- **Error Logs**: Store error events in `databases/error_logs`:
  ```sql
  CREATE TABLE error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    correlation_id UUID NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component TEXT NOT NULL,
    endpoint TEXT,
    retry_count INTEGER DEFAULT 0,
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_error_logs_user_id (user_id),
    INDEX idx_error_logs_error_type (error_type),
    INDEX idx_error_logs_created_at (created_at)
  );
  ```
- **Metric Logs**: Store performance and business metrics in `databases/metric_logs`:
  ```sql
  CREATE TABLE metric_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT NOT NULL, -- 'ms', 'count', 'score', 'percentage'
    dimensions JSONB, -- Additional metric dimensions
    correlation_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_metric_logs_metric_name (metric_name),
    INDEX idx_metric_logs_created_at (created_at)
  );
  ```

### Dashboards & Visualization
- **SLI Dashboards**: Maintain Service Level Indicators in PostHog/Sentry:
  - `funnel_completion_rate` - Percentage completing each funnel step
  - `trust_delta_average` - Average TrustDelta scores
  - `emotional_resonance_rate` - Percentage meeting resonance thresholds
  - `api_success_rate` - Percentage of successful API calls
  - `spark_generation_time` - P50/P95/P99 spark generation latency
  - `deliverable_generation_time` - P50/P95/P99 deliverable generation latency
- **Business Metrics Dashboard**: Track key business indicators:
  ```ts
  // Dashboard metrics calculation
  const calculateSLIs = async () => {
    const metrics = await Promise.all([
      calculateFunnelCompletionRate(),
      calculateAverageTrustDelta(),
      calculateEmotionalResonanceRate(),
      calculateAPISuccessRate()
    ]);
    
    posthog.capture('sli_calculated', {
      funnel_completion_rate: metrics[0],
      trust_delta_average: metrics[1],
      emotional_resonance_rate: metrics[2],
      api_success_rate: metrics[3],
      timestamp: Date.now()
    });
  };
  ```

### Alerting & Incident Response
- **Performance Alerts**: Trigger alerts on SLI degradation:
  - Error rate >1% (5-minute window)
  - P99 latency >200ms (10-minute window)
  - TrustDelta <4.0 (trending over 1 hour)
  - API latency >2s (individual request)
  - Uptime <99.9% (24-hour window)
- **AI-in-the-Loop Triggers**: Flag borderline metrics for human review:
  ```ts
  const checkAIQualityThresholds = (metrics) => {
    const needsReview = 
      metrics.trustDelta < 4.2 || 
      metrics.emotionalResonance < 0.7 ||
      metrics.confidenceScore < 0.8;
    
    if (needsReview) {
      // Trigger PagerDuty alert for human review
      posthog.capture('ai_quality_review_required', {
        distinct_id: userId,
        trust_delta: metrics.trustDelta,
        emotional_resonance: metrics.emotionalResonance,
        confidence_score: metrics.confidenceScore,
        review_priority: calculateReviewPriority(metrics),
        correlationId
      });
      
      // Queue for manual review
      await queueForHumanReview({
        userId,
        metrics,
        correlationId,
        priority: calculateReviewPriority(metrics)
      });
    }
  };
  ```

### AI Health Checks & Proactive Monitoring
- **Synthetic Transactions**: Implement proactive AI health checks:
  ```ts
  const runAIHealthCheck = async () => {
    const testScenarios = [
      { type: 'spark_generation', input: standardTestInput },
      { type: 'deliverable_generation', input: standardBusinessPlan },
      { type: 'emotional_analysis', input: standardEmotionalContent }
    ];
    
    for (const scenario of testScenarios) {
      const startTime = Date.now();
      try {
        const result = await executeAITask(scenario);
        const duration = Date.now() - startTime;
        
        posthog.capture('ai_health_check', {
          scenario_type: scenario.type,
          success: true,
          duration_ms: duration,
          quality_score: result.qualityScore,
          timestamp: Date.now()
        });
        
        // Alert on quality degradation
        if (result.qualityScore < expectedQuality[scenario.type]) {
          Sentry.captureMessage('AI quality degradation detected', {
            level: 'warning',
            tags: { scenario: scenario.type, quality: result.qualityScore }
          });
        }
      } catch (error) {
        posthog.capture('ai_health_check_failed', {
          scenario_type: scenario.type,
          error_type: error.name,
          error_message: error.message,
          timestamp: Date.now()
        });
      }
    }
  };
  
  // Run health checks every 15 minutes
  setInterval(runAIHealthCheck, 15 * 60 * 1000);
  ```

### Predictive Analytics
- **Trend Analysis**: Implement predictive analytics for key metrics:
  ```ts
  const analyzeTrends = async () => {
    const trends = await Promise.all([
      predictTrustDeltaTrend(),
      predictResonanceTrend(),
      predictCostTrend()
    ]);
    
    trends.forEach(trend => {
      if (trend.projectedDrift > acceptableThreshold) {
        posthog.capture('predictive_alert', {
          metric: trend.metric,
          current_value: trend.currentValue,
          projected_value: trend.projectedValue,
          drift_magnitude: trend.projectedDrift,
          time_to_threshold: trend.timeToThreshold,
          confidence: trend.confidence
        });
      }
    });
  };
  ```
- **Cost Monitoring**: Track and predict LLM costs:
  ```ts
  const monitorAICosts = async () => {
    const costs = await calculateDailyCosts();
    const projection = await projectMonthlyCosts(costs);
    
    posthog.capture('ai_cost_monitoring', {
      daily_cost: costs.total,
      gpt4o_cost: costs.gpt4o,
      hume_cost: costs.hume,
      projected_monthly: projection.total,
      budget_utilization: projection.total / monthlyBudget,
      timestamp: Date.now()
    });
    
    if (projection.total > monthlyBudget * 0.8) {
      Sentry.captureMessage('Cost budget warning', {
        level: 'warning',
        tags: { projected_cost: projection.total, budget: monthlyBudget }
      });
    }
  };
  ```

### Privacy & Compliance
- **PII Masking**: Mask personally identifiable information in logs:
  ```ts
  const maskPII = (data: any): any => {
    const masked = { ...data };
    
    // Mask email addresses
    if (masked.email) {
      masked.email = masked.email.replace(/(.{2}).*@(.*)/, '$1***@$2');
    }
    
    // Mask user IDs in logs (use hashed version)
    if (masked.user_id) {
      masked.user_id = hashUserId(masked.user_id);
    }
    
    // Remove sensitive business data
    delete masked.businessDescription;
    delete masked.financialData;
    
    return masked;
  };
  ```
- **Data Retention**: Implement automated log retention policies:
  ```sql
  -- Automated cleanup job
  SELECT cron.schedule('cleanup-logs', '0 2 * * *', 
    'DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL ''90 days'';
     DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL ''180 days'';
     DELETE FROM metric_logs WHERE created_at < NOW() - INTERVAL ''365 days'';'
  );
  ```

## Validation

### CI/CD Enforcement
- **Observability Testing**: CI/CD verifies logging setup (`.github/workflows/observability.yml`):
  ```yaml
  - name: Test Observability Setup
    run: |
      npm run test:logging
      npm run test:tracing
      npm run test:metrics
  - name: Validate Dashboard Config
    run: npm run validate:dashboards
  ```
- **Trace Validation**: Validate trace fields and correlation IDs in tests
- **Alert Testing**: Test alert thresholds and notification delivery

### Testing Requirements
- **Jest Coverage**: Validate trace fields and logging (`backend/tests/tracing.test.js`):
  ```ts
  describe('Tracing and Logging', () => {
    test('should include correlation ID in all logs', async () => {
      const correlationId = generateCorrelationId();
      const result = await testOperation({ correlationId });
      
      expect(result.logs).toHaveProperty('correlationId', correlationId);
      expect(result.traces).toHaveProperty('correlationId', correlationId);
    });
    
    test('should track AI performance metrics', async () => {
      const metrics = await runAITask('spark_generation');
      
      expect(metrics).toHaveProperty('ai_task_success');
      expect(metrics.duration_ms).toBeLessThan(1500);
      expect(metrics.quality_score).toBeGreaterThan(0.8);
    });
  });
  ```
- **Performance Testing**: Validate response times and error rates under load
- **Alert Testing**: Test alert triggers and escalation procedures

### Monitoring Validation
- **PostHog Dashboards**: Confirm dashboards display SLIs and business metrics
- **Sentry Integration**: Verify error tracking and performance monitoring
- **Alert Verification**: Test alert delivery and AI-in-the-Loop triggers

## File Structure
- **Backend Services**: `backend/services/sentry.js`, `backend/services/posthog.js`
- **Tracing**: `backend/services/tracing.js`
- **Frontend Analytics**: `frontend/src/utils/analytics.ts`, `frontend/src/utils/tracing.ts`
- **Database**: `databases/session_logs`, `databases/error_logs`, `databases/metric_logs`
- **Tests**: `backend/tests/tracing.test.js`, `backend/tests/monitoring.test.js`
- **CI/CD**: `.github/workflows/observability.yml`

## References
- **PRD Sections**: 7.1 (Performance), 7.2 (Security), 8.6 (Monitoring & Analytics), 12 (Success Metrics), 15 (Deployment Strategy)
- **Project Structure**: `backend/services/`, `databases/`, `frontend/src/utils/`
- **Performance Targets**: 99.9% uptime, <200ms p99 latency, <1% error rate
- **AI Quality**: TrustDelta ≥4.0, emotional resonance >0.7, AI success rate >95%

## Version History
- **Version 2.0.0** - Comprehensive rewrite aligned with PRD observability requirements
- **Updated**: Current date, enhanced AI monitoring and predictive analytics




