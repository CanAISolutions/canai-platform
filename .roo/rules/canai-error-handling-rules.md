---
description: 
globs: 
alwaysApply: true
---
# CanAI Error Handling Rules

## Role and Expertise
You are an error handling expert for the **CanAI Emotional Sovereignty Platform**, ensuring robust, empathetic, and performant error handling across the 9-stage user journey (F1-F9). Your expertise covers frontend error boundaries, backend middleware, API error responses, database logging, webhook recovery, AI integration fallbacks, and monitoring - all aligned with PRD Section 9 requirements.

## Purpose
Standardize empathetic error handling to maintain user trust, achieve <100ms error responses, and ensure 99.9% platform uptime while preserving emotional sovereignty throughout the user experience.

## Architecture Overview
Error handling operates across multiple integrated layers:

### Frontend Layer
- **Error Boundaries**: `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/components/enhanced/ErrorBoundaryFallback.tsx`
- **Page-Level Handling**: Individual error handling in `frontend/src/pages/` for each journey stage
- **Toast Notifications**: Real-time error feedback via `frontend/src/components/ui/toast.tsx`
- **Accessibility**: WCAG 2.2 AA compliant error messages with ≥48px tap targets

### Backend Layer
- **Middleware Stack**: `backend/middleware/error.js`, `backend/middleware/retry.js`, `backend/middleware/validation.js`
- **Route Handlers**: Consistent error handling across `backend/routes/`
- **Service Layer**: AI service fallbacks in `backend/services/`
- **Webhook Processing**: Dead-letter queue handling in `backend/webhooks/`

### Data & Monitoring Layer
- **Error Logging**: Supabase `databases/error_logs` with RLS policies
- **Analytics**: PostHog event tracking via `backend/services/posthog.js`
- **Monitoring**: Sentry integration via `backend/services/sentry.js`
- **Caching**: localStorage fallbacks and `backend/services/cache.js`

## Error Taxonomy & Standards

### Core Error Types
Define and handle these PRD-aligned error categories:

```typescript
type ErrorCategory = 
  | 'api_timeout'        // GPT-4o, Hume AI, or external API timeouts
  | 'validation_error'   // Input validation failures (2-step funnel, 12-field form)
  | 'stripe_failure'     // Payment processing errors
  | 'low_confidence'     // AI confidence <0.8 requiring clarification
  | 'contradiction'      // Conflicting user inputs detected
  | 'nsfw_content'       // Inappropriate content detection
  | 'token_limit'        // >128K tokens exceeded
  | 'webhook_failure'    // Make.com webhook processing failures
  | 'rate_limit'         // API rate limiting (100 req/min)
  | 'network_error'      // Connectivity issues
  | 'auth_failure'       // Memberstack authentication issues
  | 'model_output_drift' // AI output quality degradation
  | 'hume_fallback'      // Hume AI quota exceeded (>900 req/day)
```

### Error Response Standards

#### User-Facing Messages
- **Empathetic Tone**: Non-blaming, supportive language aligned with CanAI's emotional sovereignty
- **Character Limit**: <50 characters for mobile optimization
- **Response Time**: Display in <100ms via cached responses
- **Accessibility**: ARIA labels, proper contrast ratios, keyboard navigation support

#### Examples from PRD Table 17:
```typescript
const ERROR_MESSAGES = {
  api_timeout: "We're sparking your ideas! Please wait a moment.",
  validation_error: "Your vision needs clarity—please add [field_name].",
  stripe_failure: "Payment issue, let's retry!",
  low_confidence: "Let's clarify: [clarifying_questions]",
  contradiction: "Bold tone suggests ambition. Clarify goal?",
  nsfw_content: "Please avoid offensive language.",
  token_limit: "Input shortened for clarity. Review changes?",
  hume_fallback: "Processing with enhanced AI—slight delay expected."
} as const;
```

#### Internal Logging Structure
```typescript
interface ErrorLogEntry {
  id: string;
  user_id: string | null;
  error_message: string;
  error_type: ErrorCategory;
  action: string;
  support_request: boolean;
  retry_count: number;
  correlation_id: string;
  created_at: string;
  metadata?: Record<string, any>;
}
```

## Stage-Specific Error Handling Implementation

### F1: Discovery Hook (`frontend/src/pages/DiscoveryHook.tsx`)
```typescript
// Error scenarios and implementations:
const F1_ERROR_HANDLERS = {
  cms_load_failure: {
    fallback: () => loadFromLocalStorage('discovery_content'),
    message: "Loading your experience...",
    recovery: "Cache CMS content with 1hr TTL"
  },
  pricing_modal_failure: {
    fallback: () => loadCachedPricing(),
    message: "Pricing loading...",
    recovery: "Display cached pricing data"
  },
  sample_pdf_failure: {
    fallback: () => showPlaceholderContent(),
    message: "Samples preparing...",
    recovery: "Show text-based sample descriptions"
  }
};
```

### F2: 2-Step Discovery Funnel (`frontend/src/pages/DiscoveryFunnel.tsx`)
```typescript
const F2_ERROR_HANDLERS = {
  validation_failure: {
    action: showTooltipGuidance,
    message: "Your challenge needs more detail—please clarify.",
    recovery: "Provide contextual tooltips via /v1/generate-tooltip"
  },
  trust_score_timeout: {
    fallback: () => useLocalValidation(),
    message: "Calculating trust score...",
    recovery: "Use client-side validation rules"
  },
  auto_save_failure: {
    fallback: () => saveToLocalStorage(),
    message: "Saving progress...",
    recovery: "localStorage backup with sync on reconnect"
  }
};
```

### F3: Spark Layer (`frontend/src/pages/SparkLayer.tsx`)
```typescript
const F3_ERROR_HANDLERS = {
  generation_timeout: {
    fallback: () => loadCachedSparks(),
    message: "Generating sparks...",
    recovery: "Display cached sparks from previous successful generations"
  },
  regeneration_limit: {
    action: showUpgradePrompt,
    message: "Upgrade for unlimited regenerations",
    recovery: "Prompt for subscription upgrade"
  },
  hume_quota_exceeded: {
    fallback: () => useGPT4oWithTrustDeltaPenalty(),
    message: "Processing with enhanced AI—slight delay expected.",
    recovery: "Apply -0.2 TrustDelta penalty, log to PostHog"
  }
};
```

### F4: Purchase Flow (`frontend/src/pages/PurchaseFlow.tsx`)
```typescript
const F4_ERROR_HANDLERS = {
  stripe_session_failure: {
    retry: exponentialBackoff(3, 1000),
    message: "Payment issue, let's retry!",
    recovery: "Retry with exponential backoff, queue support if fails"
  },
  payment_failure: {
    action: showRetryOptions,
    message: "Payment didn't process—try again?",
    recovery: "Offer alternative payment methods"
  },
  webhook_delivery_failure: {
    fallback: () => queueForDLQProcessing(),
    message: "Confirming purchase...",
    recovery: "Process via dead-letter queue with 3 retries"
  }
};
```

### F5: Detailed Input Collection (`frontend/src/pages/DetailedInput.tsx`)
```typescript
const F5_ERROR_HANDLERS = {
  auto_save_failure: {
    fallback: () => persistToLocalStorage(),
    message: "Saving progress...",
    recovery: "localStorage persistence with 100ms debouncing"
  },
  tooltip_generation_failure: {
    fallback: () => showContextualFallbacks(),
    message: "Loading guidance...",
    recovery: "Use pre-defined contextual help text"
  },
  field_validation_error: {
    action: showFieldSpecificGuidance,
    message: "Your vision deserves clarity—please add [field_name].",
    recovery: "Highlight specific field with guidance tooltip"
  }
};
```

### F6: Intent Mirror (`frontend/src/pages/IntentMirror.tsx`)
```typescript
const F6_ERROR_HANDLERS = {
  summary_generation_failure: {
    fallback: () => generateBasicReflection(),
    message: "Reflecting your intent...",
    recovery: "Create simple bullet-point summary from inputs"
  },
  low_confidence_score: {
    action: showClarifyingQuestions,
    message: "Let's clarify: [specific_questions]",
    recovery: "Present 2-3 targeted clarification questions"
  },
  edit_save_failure: {
    fallback: () => optimisticUpdateWithRollback(),
    message: "Saving changes...",
    recovery: "Show changes immediately, rollback on failure"
  }
};
```

### F7: Deliverable Generation (`frontend/src/pages/DeliverableGeneration.tsx`)
```typescript
const F7_ERROR_HANDLERS = {
  generation_timeout: {
    action: returnPartialWithResumeLink,
    message: "We're finalizing your plan—check back in 5 minutes.",
    recovery: "Return partial output with resume URL"
  },
  revision_failure: {
    fallback: () => loadCachedPreviousVersion(),
    message: "Loading previous version...",
    recovery: "Display last successful generation"
  },
  pdf_creation_failure: {
    fallback: () => provideTextOnlyFallback(),
    message: "Preparing text version...",
    recovery: "Offer downloadable text format"
  }
};
```

### F8: SparkSplit (`frontend/src/pages/SparkSplit.tsx`)
```typescript
const F8_ERROR_HANDLERS = {
  comparison_failure: {
    fallback: () => showSingleOutputDisplay(),
    message: "Displaying your result...",
    recovery: "Show CanAI output only with explanation"
  },
  trust_delta_calculation_failure: {
    action: requestManualFeedback,
    message: "Rate your experience to help us improve",
    recovery: "Show manual rating interface"
  },
  emotional_resonance_failure: {
    fallback: () => useFallbackScoring(),
    message: "Analyzing emotional impact...",
    recovery: "Use GPT-4o for basic sentiment analysis"
  }
};
```

### F9: Feedback Capture (`frontend/src/pages/Feedback.tsx`)
```typescript
const F9_ERROR_HANDLERS = {
  submission_failure: {
    fallback: () => queueInLocalStorage(),
    message: "Saving feedback...",
    recovery: "Queue for retry when connection restored"
  },
  email_sending_failure: {
    action: addToRetryQueue,
    message: "Feedback received—follow-up coming soon",
    recovery: "Process via Make.com retry queue"
  },
  analytics_logging_failure: {
    fallback: () => logToLocalStorage(),
    message: "Thank you for your feedback!",
    recovery: "Store locally, sync when possible"
  }
};
```

## Backend Implementation Standards

### Middleware Configuration
```typescript
// backend/middleware/error.js - Global error handler
interface ErrorResponse {
  error: string;
  code: number;
  details?: object;
  correlationId: string;
  retryAfter?: number;
  userMessage: string;
}

// backend/middleware/retry.js - Retry configuration
interface RetryConfig {
  maxRetries: 3;
  baseDelay: 500; // ms
  maxDelay: 30000; // ms
  backoffFactor: 2;
  retryableErrors: ErrorCategory[];
}
```

### API Route Error Pattern
```typescript
// Standard pattern for all backend routes
export const standardErrorHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await operationWithPossibleFailure();
    return res.json({ data: result, error: null });
  } catch (error) {
    const errorInfo = {
      user_id: req.user?.id || null,
      error_message: error.message,
      action: req.route.path,
      error_type: classifyError(error),
      correlation_id: req.correlationId || generateCorrelationId(),
      retry_count: req.retryCount || 0,
      metadata: extractErrorMetadata(error)
    };

    await logToSupabase(errorInfo);
    await trackInPostHog(errorInfo);
    
    const statusCode = getStatusCode(error);
    const userMessage = getUserFriendlyMessage(error.type);
    
    return res.status(statusCode).json({
      error: userMessage,
      code: statusCode,
      correlationId: errorInfo.correlation_id,
      retryAfter: error.type === 'rate_limit' ? 60 : undefined
    });
  }
};
```

### Retry Logic Implementation
```typescript
// backend/middleware/retry.js
export const withRetry = (operation: Function, config: RetryConfig) => {
  return async (...args: any[]) => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation(...args);
        
        if (attempt > 0) {
          await trackRetrySuccess(operation.name, attempt);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === config.maxRetries || !isRetryableError(error)) {
          break;
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );
        
        await sleep(delay);
      }
    }
    
    await trackRetryFailure(operation.name, config.maxRetries);
    throw lastError;
  };
};
```

## AI Integration Error Handling

### GPT-4o Service (`backend/services/gpt4o.js`)
```typescript
export class GPT4oService {
  async generateWithFallback(prompt: string, context: any) {
    try {
      const result = await this.callGPT4o(prompt, context);
      return { success: true, data: result, source: 'gpt4o' };
    } catch (error) {
      if (error.type === 'timeout') {
        // Try with shorter prompt
        const truncatedPrompt = this.truncatePrompt(prompt);
        try {
          const result = await this.callGPT4o(truncatedPrompt, context);
          return { success: true, data: result, source: 'gpt4o_truncated' };
        } catch (retryError) {
          return this.handleGPT4oFailure(retryError, context);
        }
      }
      
      if (error.type === 'token_limit') {
        const chunkedResults = await this.processInChunks(prompt, context);
        return { success: true, data: chunkedResults, source: 'gpt4o_chunked' };
      }
      
      throw error;
    }
  }
  
  private async handleGPT4oFailure(error: Error, context: any) {
    await this.logError(error, context);
    return {
      success: false,
      error: 'generation_failed',
      fallback: await this.getCachedResponse(context) || this.getGenericResponse(context)
    };
  }
}
```

### Hume AI Service (`backend/services/hume.js`)
```typescript
export class HumeAIService {
  private quotaExceeded = false;
  private dailyRequestCount = 0;
  
  async analyzeEmotionalResonance(content: string) {
    if (this.quotaExceeded || this.dailyRequestCount >= 900) {
      return this.fallbackToGPT4o(content);
    }
    
    try {
      const result = await this.callHumeAPI(content);
      this.dailyRequestCount++;
      return { ...result, source: 'hume', trustDeltaPenalty: 0 };
    } catch (error) {
      if (error.status === 429) {
        this.quotaExceeded = true;
        await this.trackQuotaExceeded();
        return this.fallbackToGPT4o(content);
      }
      throw error;
    }
  }
  
  private async fallbackToGPT4o(content: string) {
    const gpt4oAnalysis = await this.gpt4oEmotionalAnalysis(content);
    await this.trackHumeFallback();
    
    return {
      ...gpt4oAnalysis,
      source: 'gpt4o_fallback',
      trustDeltaPenalty: -0.2 // PRD requirement
    };
  }
}
```

## Database Schema & Logging

### Supabase Error Logs Schema
```sql
-- databases/migrations/error_logs.sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_type TEXT CHECK (error_type IN (
    'api_timeout', 'validation_error', 'stripe_failure', 'low_confidence',
    'contradiction', 'nsfw_content', 'token_limit', 'webhook_failure',
    'rate_limit', 'network_error', 'auth_failure', 'model_output_drift',
    'hume_fallback'
  )),
  action TEXT NOT NULL,
  support_request BOOLEAN DEFAULT false,
  retry_count INTEGER CHECK (retry_count BETWEEN 0 AND 3) DEFAULT 0,
  correlation_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_correlation_id ON error_logs(correlation_id);

-- RLS Policy
CREATE POLICY error_logs_rls ON error_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Data retention (24 months per PRD)
SELECT cron.schedule(
  'purge-error-logs',
  '0 0 1 * *',
  'DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL ''24 months'''
);
```

## Monitoring & Analytics Integration

### PostHog Event Tracking
```typescript
// backend/services/posthog.js - Error event tracking
export const trackErrorEvents = {
  errorOccurred: (errorType: string, endpoint: string, userId?: string) => 
    posthog.capture('error_occurred', {
      error_type: errorType,
      endpoint,
      user_id: userId
    }),
    
  retrySuccess: (errorType: string, attemptCount: number) =>
    posthog.capture('retry_success', {
      error_type: errorType,
      attempt_count: attemptCount
    }),
    
  retryFailure: (errorType: string, maxAttempts: number) =>
    posthog.capture('retry_failed', {
      error_type: errorType,
      max_attempts: maxAttempts
    }),
    
  supportRequestCreated: (errorType: string, correlationId: string) =>
    posthog.capture('support_request_created', {
      error_type: errorType,
      correlation_id: correlationId
    }),
    
  humeFallbackTriggered: (reason: string) =>
    posthog.capture('hume_fallback_triggered', {
      reason,
      trust_delta_penalty: -0.2
    }),
    
  modelOutputDrift: (sessionId: string, driftCount: number) =>
    posthog.capture('model_output_drift', {
      session_id: sessionId,
      drift_count: driftCount,
      action: driftCount >= 2 ? 'generation_stopped' : 'drift_detected'
    })
};
```

### Sentry Integration
```typescript
// backend/services/sentry.js
import * as Sentry from '@sentry/node';

export const configureSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.data) {
        event.request.data = sanitizeSensitiveData(event.request.data);
      }
      return event;
    }
  });
};

export const captureErrorWithContext = (error: Error, context: any) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_category', classifyError(error));
    scope.setContext('request_context', context);
    Sentry.captureException(error);
  });
};
```

## Webhook & Make.com Error Handling

### Dead-Letter Queue Processing
```typescript
// backend/webhooks/dlq.js
export class DeadLetterQueue {
  async processFailedWebhook(webhookData: any, originalError: Error) {
    const dlqEntry = {
      webhook_data: webhookData,
      original_error: originalError.message,
      retry_count: 0,
      max_retries: 3,
      next_retry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      created_at: new Date()
    };
    
    await this.storeDLQEntry(dlqEntry);
    await this.scheduleRetry(dlqEntry);
  }
  
  async processDLQRetries() {
    const pendingRetries = await this.getPendingRetries();
    
    for (const entry of pendingRetries) {
      try {
        await this.retryWebhook(entry);
        await this.markAsProcessed(entry.id);
      } catch (error) {
        if (entry.retry_count >= entry.max_retries) {
          await this.markAsFailed(entry.id);
          await this.createSupportTicket(entry);
        } else {
          await this.scheduleNextRetry(entry);
        }
      }
    }
  }
}
```

## Performance & Quality Requirements

### Response Time Targets
- **Error Detection**: <200ms (PRD requirement)
- **Error Message Display**: <100ms via cached responses
- **Retry Operations**: Complete within 30s total time
- **DLQ Processing**: <24hr recovery time
- **Support Escalation**: <200ms queue time

### Quality Metrics
- **Retry Success Rate**: >85% for transient errors
- **NSFW Detection Accuracy**: >95%
- **Contradiction Detection Accuracy**: >90%
- **User Satisfaction**: >90% (post-error survey)
- **Support Ticket Resolution**: <24hr for critical errors

### Model Output Drift Handling
```typescript
// Stop generation on second drift event in session
export const handleModelOutputDrift = async (sessionId: string) => {
  const driftCount = await getDriftCountForSession(sessionId);
  
  if (driftCount >= 2) {
    await stopGenerationForSession(sessionId);
    await trackModelOutputDrift(sessionId, driftCount);
    
    return {
      action: 'generation_stopped',
      message: 'Quality check triggered—please contact support for assistance.',
      supportRequired: true
    };
  }
  
  return {
    action: 'drift_detected',
    message: 'Refining output quality...',
    continueGeneration: true
  };
};
```

## Validation & Testing Requirements

### Jest Testing Requirements
```typescript
// backend/tests/error.test.js
describe('Error Handling', () => {
  test('should respond to errors within 200ms', async () => {
    const start = Date.now();
    const response = await request(app).post('/v1/test-error');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200);
    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
  });
  
  test('should log all errors to Supabase', async () => {
    await request(app).post('/v1/trigger-error');
    
    const errorLogs = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    expect(errorLogs.data).toHaveLength(1);
    expect(errorLogs.data[0].error_type).toBeDefined();
  });
  
  test('should achieve >85% retry success rate', async () => {
    const results = await Promise.all([
      ...Array(100).fill().map(() => testRetryScenario())
    ]);
    
    const successRate = results.filter(r => r.success).length / results.length;
    expect(successRate).toBeGreaterThan(0.85);
  });
});
```

### Supatest Integration Testing
```typescript
// backend/tests/integration/error-flows.test.js
describe('Error Flow Integration', () => {
  test('should handle complete error-to-recovery flow', async () => {
    // Simulate error condition
    const errorResponse = await supatest
      .post('/v1/generate-sparks')
      .send({ invalid: 'data' })
      .expect(400);
    
    // Verify error logging
    const { data: errorLog } = await supabase
      .from('error_logs')
      .select('*')
      .eq('correlation_id', errorResponse.body.correlationId)
      .single();
    
    expect(errorLog).toBeDefined();
    expect(errorLog.error_type).toBe('validation_error');
    
    // Test recovery path
    const recoveryResponse = await supatest
      .post('/v1/generate-sparks')
      .send(validSparkData)
      .expect(200);
    
    expect(recoveryResponse.body.data).toBeDefined();
  });
});
```

## Documentation & Maintenance

### Error Documentation Requirements
- **Post-Mortems**: Document recurring errors in `docs/post-mortems/`
- **Runbooks**: Maintain operational procedures in `docs/deployment/operations-playbook.md`
- **Error Catalogs**: Keep updated error type definitions and handling procedures
- **Performance Reports**: Monthly error rate and resolution time analysis

### Continuous Improvement
- **Weekly Error Review**: Analyze error patterns and implement preventive measures
- **Quarterly Testing**: Comprehensive error scenario testing
- **Annual Security Audit**: Review error handling for security vulnerabilities
- **User Feedback Integration**: Incorporate user feedback into error message improvements

## References & Compliance

### PRD Alignment
- **Section 9**: Error Handling - Core requirements and behaviors
- **Section 7**: Non-Functional Requirements - Performance and reliability targets
- **Section 12**: Success Metrics - Error rate and user satisfaction metrics
- **Section 14**: Security Strategy - Error handling security requirements

### Project Structure Integration
- **Frontend**: `frontend/src/components/enhanced/ErrorBoundaryFallback.tsx`
- **Backend**: `backend/middleware/error.js`, `backend/services/`
- **Database**: `databases/error_logs`, `databases/migrations/`
- **Monitoring**: `backend/services/posthog.js`, `backend/services/sentry.js`
- **Webhooks**: `backend/webhooks/dlq.js`, `backend/webhooks/make_scenarios/`

### Technical Standards
- **Response Times**: <100ms error display, <200ms error detection
- **Retry Logic**: Exponential backoff with 3 max retries
- **Logging**: Comprehensive error logging with correlation IDs
- **Accessibility**: WCAG 2.2 AA compliant error messages
- **Security**: PII sanitization, RLS policies, audit trails

---

**Updated**: June 18, 2025  
**Version**: 2.0.0  
**Alignment**: PRD Section 9, Project Structure Mapping v1.2









