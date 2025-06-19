---
description: 
globs: 
alwaysApply: true
---
# CanAI Analytics Rules

## Role and Expertise
You are an analytics expert for the **CanAI Emotional Sovereignty Platform**, ensuring comprehensive event tracking, privacy compliance, and actionable insights across the 9-stage user journey (F1-F9). You deliver analytics that achieve TrustDelta ≥4.2, >65% CanAI preference, and emotional resonance tracking aligned with PRD success metrics.

### Roo Code Development Context
When implementing analytics code, you MUST:
- **Reference exact file paths** from project structure mapping
- **Use TypeScript interfaces** provided in this document
- **Follow PRD success metrics** as validation criteria
- **Implement all mandatory events** for each stage
- **Validate schemas** before deployment
- **Track emotional resonance** for every user output
- **Ensure PII compliance** in all implementations

## Purpose
Standardize analytics to deliver privacy-compliant, actionable insights, achieving TrustDelta ≥4.2 and >65% CanAI preference with emotional resonance tracking that drives business decisions and platform optimization.

## Standards

### Event Taxonomy
Track **mandatory events** aligned with the 9-stage user journey (PRD Section 5):
- **funnel_step**: Core progression tracking through F1-F9 stages
- **api_latency**: Performance monitoring for <2s response targets  
- **spark_selection**: Product track engagement and trust scoring
- **feedback_submitted**: User satisfaction and advocacy metrics
- **pricing_modal_viewed**: Conversion funnel optimization
- **hume_fallback_triggered**: AI service reliability monitoring
- **retry_success**: Error recovery effectiveness
- **interaction_logged**: UI interactions (e.g., pricing modal clicks)
- **task_output_discarded**: Quality control with reasons (`drift` | `duplicate` | `low_quality`)

### Critical Success Events (PRD Section 12)
**MUST TRACK** these events for business success measurement:
- **trustdelta_achieved**: When TrustDelta ≥4.2 (target metric)
- **canai_preference_selected**: When user chooses CanAI over generic (>65% target)
- **emotional_resonance_high**: When resonance >0.7 (quality threshold)
- **conversion_completed**: Full F1-F9 journey completion
- **advocacy_action**: Social share, referral, or 5-star rating

### Naming Conventions
- **Events**: snake_case (e.g., `interaction_logged`)
- **Properties**: camelCase (e.g., `interactionType`)

### Payload Schemas
```typescript
// Core funnel progression event
funnel_step: { 
  stepName: string, 
  completed: boolean, 
  dropoffReason: string|null, 
  userId: string|null 
}

// API performance monitoring
api_latency: { 
  endpoint: string, 
  durationMs: number, 
  correlationId: string 
}

// Product engagement tracking
spark_selection: { 
  sparkId: string, 
  productTrack: "business_builder|social_email|site_audit", 
  trustScore: number 
}

// User interaction monitoring
interaction_logged: { 
  userId: string|null, 
  interactionType: string, 
  details: object 
} // e.g., { interactionType: "pricing_modal_click", details: { modalId: "pricing_1" } }

// Critical success event schemas
trustdelta_achieved: {
  userId: string,
  sessionId: string,
  trustDelta: number, // Must be ≥4.2
  productTrack: "business_builder"|"social_email"|"site_audit",
  achievementStage: "F8"|"F9"
}

canai_preference_selected: {
  userId: string,
  sessionId: string,
  trustDelta: number,
  comparisonTimeMs: number,
  confidenceLevel: number // 1-5 scale
}

emotional_resonance_high: {
  userId: string,
  sessionId: string,
  resonanceScore: number, // Must be >0.7
  arousal: number, // Must be >0.5
  valence: number, // Must be >0.6
  contentType: "spark"|"deliverable"|"summary"
}
```

Validate with Joi in `backend/middleware/analytics.js`.

### Implementation Priority Matrix
**CRITICAL** (implement first):
- `funnel_step` for all F1-F9 stages
- `trustdelta_achieved` for business success measurement
- `emotional_resonance_high` for quality validation
- `api_latency` for performance monitoring

**HIGH** (implement second):
- `spark_selection` for engagement tracking
- `feedback_submitted` for satisfaction measurement
- `canai_preference_selected` for competitive advantage
- `interaction_logged` for UX optimization

**MEDIUM** (implement third):
- `pricing_modal_viewed` for conversion optimization
- `hume_fallback_triggered` for service reliability
- `retry_success` for error recovery metrics
- `task_output_discarded` for quality control

### Data Retention
Retain for 24 months via `databases/cron/purge.sql` (PRD Section 7.3).

### PII Compliance
- Anonymize PII with `backend/services/anonymize.js`
- Ensure no PII in PostHog (`backend/services/posthog.js`)

### Data Validation
- Validate payloads pre-send with Joi
- Log invalid payloads to `databases/error_logs`

### Ownership
Backend team owns analytics in `backend/services/posthog.js`.

### Emotional Metrics
Track TrustDelta and Hume AI resonance (arousal >0.5, valence >0.6) via `spark_selection` and `feedback_submitted`.

### Real-Time Success Monitoring
**IMMEDIATE ALERTS** when:
- TrustDelta drops below 4.2 for >5 consecutive users
- CanAI preference falls below 65% in any 24-hour period
- Emotional resonance averages <0.7 for any product track
- API latency exceeds 2s for >10% of requests
- Funnel conversion drops >10% from baseline

**DASHBOARD REQUIREMENTS**:
- Live TrustDelta trending (hourly updates)
- CanAI vs Generic preference ratio (real-time)
- Emotional resonance heatmap by stage and product
- Performance metrics with SLA compliance
- Conversion funnel with dropoff analysis

## Complete Stage Implementation

### F1: Discovery Hook (PRD Section 6.1)
```typescript
// Core funnel tracking
posthog.capture('funnel_step', {
  stepName: 'discovery_hook',
  completed: true,
  dropoffReason: null,
  userId: user?.id || null,
  sessionId: session.id,
  funnelStage: 'F1'
});

// Pricing modal engagement
posthog.capture('pricing_modal_viewed', {
  userId: user?.id || null,
  sessionId: session.id,
  productViewed: 'business_builder'|'social_email'|'site_audit',
  modalOpenTimeMs: Date.now() - modalStartTime,
  pricingDisplayed: productPrice
});

// Product card interactions
posthog.capture('product_card_clicked', {
  userId: user?.id || null,
  sessionId: session.id,
  product: 'business_builder'|'social_email'|'site_audit',
  cardPosition: 1|2|3,
  clickSource: 'hero'|'cards_section'
});

// Preview engagement
posthog.capture('preview_viewed', {
  userId: user?.id || null,
  sessionId: session.id,
  sampleType: 'business_builder'|'social_email'|'site_audit',
  previewDurationMs: viewTime,
  sampleCompletion: boolean
});
```

### F2: 2-Step Discovery Funnel (PRD Section 6.2)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'discovery_funnel',
  completed: true,
  dropoffReason: null,
  userId: user?.id || null,
  sessionId: session.id,
  funnelStage: 'F2'
});

// Custom tone tracking
posthog.capture('custom_tone_entered', {
  userId: user?.id || null,
  sessionId: session.id,
  tone: toneValue,
  toneCategory: 'warm'|'bold'|'optimistic'|'professional'|'playful'|'inspirational'|'custom',
  characterCount: toneValue.length
});

// Quiz engagement
posthog.capture('quiz_used', {
  userId: user?.id || null,
  sessionId: session.id,
  quizType: 'tone_finder'|'challenge_clarifier',
  completed: boolean,
  quizDurationMs: duration,
  finalSelection: selectedValue
});

// Contradiction detection
posthog.capture('contradiction_flagged', {
  userId: user?.id || null,
  sessionId: session.id,
  reason: 'tone_goal_mismatch'|'business_type_challenge_mismatch',
  flaggedFields: ['field1', 'field2'],
  resolutionAction: 'user_clarified'|'user_ignored'|'auto_resolved'
});

// Trust score generation
posthog.capture('trust_score_generated', {
  userId: user?.id || null,
  sessionId: session.id,
  trustScore: score, // 0-100
  scoreFactors: {
    completeness: completenessScore,
    coherence: coherenceScore,
    emotionalAlignment: emotionalScore
  },
  validationTimeMs: duration
});
```

### F3: Spark Layer (PRD Section 6.3)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'spark_layer',
  completed: true,
  dropoffReason: null,
  userId: user?.id || null,
  sessionId: session.id,
  funnelStage: 'F3'
});

// Spark selection
posthog.capture('spark_selected', {
  userId: user?.id || null,
  sessionId: session.id,
  sparkId: sparkId,
  sparkName: sparkName,
  product: 'business_builder'|'social_email'|'site_audit',
  selectionTimeMs: selectionTime,
  retryCount: attempts,
  sparkPosition: 1|2|3
});

// Regeneration tracking
posthog.capture('sparks_regenerated', {
  userId: user?.id || null,
  sessionId: session.id,
  attemptCount: attemptNumber,
  trustScore: currentTrustScore,
  regenerationReason: 'not_satisfied'|'trust_score_low'|'want_more_options',
  totalRegenerationTimeMs: totalTime
});

// Extended regeneration (trust score <50%)
posthog.capture('sparks_regenerated_extra', {
  userId: user?.id || null,
  sessionId: session.id,
  attemptCount: attemptNumber,
  trustScore: currentTrustScore,
  extraAttemptGranted: true
});
```

### F4: Purchase Flow (PRD Section 6.4)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'purchase_flow',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F4'
});

// Price viewing
posthog.capture('price_viewed', {
  userId: user.id,
  sessionId: session.id,
  product: 'business_builder'|'social_email'|'site_audit',
  price: productPrice,
  priceSource: 'modal'|'checkout'|'product_page',
  viewDurationMs: viewTime
});

// Product switching
posthog.capture('product_switched', {
  userId: user.id,
  sessionId: session.id,
  fromTrack: 'business_builder'|'social_email'|'site_audit',
  toTrack: 'business_builder'|'social_email'|'site_audit',
  switchReason: 'price'|'features'|'timeline'
});

// Payment completion
posthog.capture('payment_completed', {
  userId: user.id,
  sessionId: session.id,
  product: 'business_builder'|'social_email'|'site_audit',
  amount: paymentAmount,
  paymentMethod: paymentMethodType,
  completionTimeMs: checkoutTime,
  stripeSessionId: stripeSession.id
});

// Payment failures
posthog.capture('payment_failed', {
  userId: user.id,
  sessionId: session.id,
  errorCode: error.code,
  errorMessage: error.message,
  retryCount: attemptNumber,
  failureStage: 'initiation'|'processing'|'confirmation'
});
```

### F5: Detailed Input Collection (PRD Section 6.5)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'detailed_input',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F5'
});

// Input saving (auto-save)
posthog.capture('input_saved', {
  userId: user.id,
  sessionId: session.id,
  fieldsCompleted: completedFieldCount,
  totalFields: 12,
  completionPercentage: (completedFieldCount / 12) * 100,
  autoSaveTriggered: true,
  saveLatencyMs: saveTime
});

// Tooltip engagement
posthog.capture('tooltip_viewed', {
  userId: user.id,
  sessionId: session.id,
  field: 'businessName'|'targetAudience'|'primaryGoal'|'revenueModel'|'competitiveAdvantage'|'brandVoice'|'uniqueValue'|'location'|'timeline'|'budget'|'successMetrics'|'contentSources',
  tooltipDurationMs: viewTime,
  helpfulRating: 1|2|3|4|5
});

// Field validation failures
posthog.capture('field_validation_failed', {
  userId: user.id,
  sessionId: session.id,
  fieldName: fieldName,
  validationError: errorMessage,
  userRetryCount: retryAttempts
});
```

### F6: Intent Mirror (PRD Section 6.6)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'intent_mirror',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F6'
});

// Intent confirmation
posthog.capture('intent_confirmed', {
  userId: user.id,
  sessionId: session.id,
  confidenceScore: confidence, // 0-1
  summaryWordCount: summary.length,
  confirmationSpeedMs: confirmationTime,
  userSatisfaction: 'immediate'|'after_review'|'hesitant'
});

// Field editing
posthog.capture('field_edited', {
  userId: user.id,
  sessionId: session.id,
  field: fieldName,
  editType: 'clarification'|'correction'|'addition',
  characterDelta: newLength - oldLength
});

// Support requests
posthog.capture('support_requested', {
  userId: user.id,
  sessionId: session.id,
  reason: 'low_confidence'|'unclear_summary'|'technical_issue',
  userMessage: supportMessage
});
```

### F7: Deliverable Generation (PRD Section 6.7)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'deliverable_generation',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F7'
});

// Deliverable completion
posthog.capture('deliverable_generated', {
  userId: user.id,
  sessionId: session.id,
  productType: 'business_builder'|'social_email'|'site_audit',
  completionTimeMs: generationTime,
  outputWordCount: wordCount,
  emotionalResonanceScore: resonanceScore, // 0-1 from Hume AI
  trustDeltaPreview: trustDelta,
  qualityMetrics: {
    coherence: coherenceScore,
    completeness: completenessScore,
    personalization: personalizationScore
  }
});

// Revision requests
posthog.capture('revision_requested', {
  userId: user.id,
  sessionId: session.id,
  reason: 'tone'|'content'|'length'|'accuracy'|'personalization',
  specificFeedback: feedbackText,
  revisionNumber: revisionCount
});

// Status checking
posthog.capture('generation_status_checked', {
  userId: user.id,
  sessionId: session.id,
  checkCount: statusCheckCount,
  timeSinceStartMs: elapsedTime,
  status: 'in_progress'|'completed'|'failed'
});
```

### F8: SparkSplit (PRD Section 6.8)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'spark_split',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F8'
});

// Plan comparison (Critical for TrustDelta)
posthog.capture('plan_compared', {
  userId: user.id,
  sessionId: session.id,
  trustDelta: trustDeltaScore, // Target: ≥4.2
  selected: 'canai'|'generic',
  emotionalResonance: {
    canaiScore: canaiResonanceScore,
    genericScore: genericResonanceScore,
    delta: resonanceDelta // Target: >0.3
  },
  comparisonTimeMs: comparisonDuration,
  userConfidence: confidenceRating
});

// TrustDelta viewing
posthog.capture('trustdelta_viewed', {
  userId: user.id,
  sessionId: session.id,
  score: trustDeltaScore,
  tooltipViewed: boolean,
  understandingConfirmed: boolean
});

// Generic preference (track for improvement)
posthog.capture('generic_preferred', {
  userId: user.id,
  sessionId: session.id,
  feedback: feedbackReason,
  improvementSuggestions: suggestions
});
```

### F9: Feedback Capture (PRD Section 6.9)
```typescript
// Funnel progression
posthog.capture('funnel_step', {
  stepName: 'feedback_capture',
  completed: true,
  dropoffReason: null,
  userId: user.id,
  sessionId: session.id,
  funnelStage: 'F9'
});

// Feedback submission
posthog.capture('feedback_submitted', {
  userId: user.id,
  sessionId: session.id,
  rating: 1|2|3|4|5,
  comment: feedbackComment,
  sentiment: 'positive'|'neutral'|'negative',
  sharedPlatforms: ['instagram', 'linkedin', 'twitter'],
  referralShared: boolean
});

// Social sharing
posthog.capture('social_shared', {
  userId: user.id,
  sessionId: session.id,
  platform: 'instagram'|'linkedin'|'twitter'|'facebook',
  contentType: 'deliverable'|'experience'|'referral',
  shareMethod: 'direct'|'copy_link'|'native_share'
});

// Referral actions
posthog.capture('referral_shared', {
  userId: user.id,
  sessionId: session.id,
  platform: 'email'|'sms'|'social',
  recipientCount: recipientNumber,
  personalMessage: boolean
});
```

## Emotional Metrics Integration

### Hume AI Resonance Tracking
```typescript
// Track emotional resonance with circuit breaker
posthog.capture('emotional_resonance_measured', {
  userId: user.id,
  sessionId: session.id,
  outputId: deliverable.id,
  resonanceScore: humeResult.resonance, // Target: >0.7
  arousal: humeResult.arousal, // Target: >0.5
  valence: humeResult.valence, // Target: >0.6
  measurementSource: 'hume_ai'|'gpt4o_fallback',
  apiLatencyMs: measurementTime
});

// Track fallback usage
posthog.capture('hume_fallback_triggered', {
  userId: user?.id || null,
  sessionId: session.id,
  usage: dailyHumeUsage,
  fallbackReason: 'limit_exceeded'|'api_error'|'timeout',
  trustDeltaImpact: -0.2 // Expected degradation
});
```

## Implementation Architecture

### Backend Analytics Service
```typescript
// backend/services/posthog.js - Primary analytics service
import { PostHog } from 'posthog-node';
import { validateEventPayload } from '../middleware/analytics.js';
import { anonymizeProperties } from './anonymize.js';

class CanAIAnalytics {
  private posthog: PostHog;
  
  constructor() {
    this.posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 20, // Batch events for performance
      flushInterval: 10000 // 10 seconds
    });
  }

  async capture(eventName: string, properties: any) {
    try {
      // Validate against Joi schema
      const validatedProps = await validateEventPayload(eventName, properties);
      
      // Anonymize PII
      const sanitizedProps = anonymizeProperties(validatedProps);
      
      // Send to PostHog
      this.posthog.capture({
        distinctId: sanitizedProps.userId || 'anonymous',
        event: eventName,
        properties: sanitizedProps,
        timestamp: new Date()
      });
      
      // Store in Supabase for long-term retention
      await this.storeToSupabase(eventName, sanitizedProps);
      
    } catch (error) {
      console.error(`Analytics capture failed for ${eventName}:`, error);
      // Log to error_logs but don't fail main operation
      await this.logError(eventName, error);
    }
  }

  private async storeToSupabase(eventName: string, properties: any) {
    // Store in databases/session_logs with RLS
    await supabase
      .from('session_logs')
      .insert({
        event_name: eventName,
        properties: properties,
        user_id: properties.userId,
        created_at: new Date()
      });
  }

  private async logError(eventName: string, error: Error) {
    await supabase
      .from('error_logs')
      .insert({
        error_type: 'analytics_failure',
        error_message: error.message,
        context: { eventName },
        created_at: new Date()
      });
  }
}

export const analytics = new CanAIAnalytics();
```

### Validation Middleware
```typescript
// backend/middleware/analytics.js - Joi validation
import Joi from 'joi';

const baseEventSchema = Joi.object({
  userId: Joi.string().uuid().allow(null),
  sessionId: Joi.string().uuid().required(),
  timestamp: Joi.string().isoDate().default(() => new Date().toISOString())
});

const eventSchemas = {
  funnel_step: baseEventSchema.keys({
    stepName: Joi.string().valid('discovery_hook', 'discovery_funnel', 'spark_layer', 'purchase_flow', 'detailed_input', 'intent_mirror', 'deliverable_generation', 'spark_split', 'feedback_capture').required(),
    completed: Joi.boolean().required(),
    dropoffReason: Joi.string().allow(null),
    funnelStage: Joi.string().valid('F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9').required()
  }),
  
  api_latency: baseEventSchema.keys({
    endpoint: Joi.string().required(),
    durationMs: Joi.number().positive().required(),
    correlationId: Joi.string().uuid().required(),
    statusCode: Joi.number().integer().min(100).max(599).required(),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required()
  }),

  spark_selection: baseEventSchema.keys({
    sparkId: Joi.string().required(),
    productTrack: Joi.string().valid('business_builder', 'social_email', 'site_audit').required(),
    trustScore: Joi.number().min(0).max(100).required(),
    selectionTimeMs: Joi.number().positive(),
    retryCount: Joi.number().min(0),
    sparkPosition: Joi.number().valid(1, 2, 3)
  }),

  interaction_logged: baseEventSchema.keys({
    interactionType: Joi.string().required(),
    details: Joi.object().required(),
    pageUrl: Joi.string().uri(),
    userAgent: Joi.string()
  }),

  feedback_submitted: baseEventSchema.keys({
    rating: Joi.number().valid(1, 2, 3, 4, 5).required(),
    comment: Joi.string().allow(''),
    sentiment: Joi.string().valid('positive', 'neutral', 'negative'),
    sharedPlatforms: Joi.array().items(Joi.string()),
    referralShared: Joi.boolean()
  }),

  // Critical success event validations
  trustdelta_achieved: baseEventSchema.keys({
    trustDelta: Joi.number().min(4.2).required(), // Enforce PRD target
    productTrack: Joi.string().valid('business_builder', 'social_email', 'site_audit').required(),
    achievementStage: Joi.string().valid('F8', 'F9').required()
  }),

  canai_preference_selected: baseEventSchema.keys({
    trustDelta: Joi.number().min(0).max(5).required(),
    comparisonTimeMs: Joi.number().positive().required(),
    confidenceLevel: Joi.number().valid(1, 2, 3, 4, 5).required()
  }),

  emotional_resonance_high: baseEventSchema.keys({
    resonanceScore: Joi.number().min(0.7).max(1).required(), // Enforce quality threshold
    arousal: Joi.number().min(0.5).max(1).required(), // Enforce PRD target
    valence: Joi.number().min(0.6).max(1).required(), // Enforce PRD target
    contentType: Joi.string().valid('spark', 'deliverable', 'summary').required()
  })
};

export const validateEventPayload = async (eventName: string, payload: any) => {
  const schema = eventSchemas[eventName];
  if (!schema) {
    throw new Error(`Unknown event type: ${eventName}`);
  }
  
  const { error, value } = schema.validate(payload);
  if (error) {
    // Log invalid payloads to databases/error_logs
    await logValidationError(eventName, error, payload);
    throw new Error(`Validation failed for ${eventName}: ${error.message}`);
  }
  
  return value;
};

const logValidationError = async (eventName: string, error: any, payload: any) => {
  await supabase
    .from('error_logs')
    .insert({
      error_type: 'validation_failure',
      error_message: error.message,
      context: { eventName, payload },
      created_at: new Date()
    });
};
```

### PII Anonymization
```typescript
// backend/services/anonymize.js
export const anonymizeProperties = (properties: any) => {
  const anonymized = { ...properties };
  
  // Email masking
  if (anonymized.email) {
    const [local, domain] = anonymized.email.split('@');
    anonymized.email = `${local.slice(0, 2)}***@${domain}`;
  }
  
  // Business description truncation (keep first 100 chars)
  if (anonymized.businessDescription && anonymized.businessDescription.length > 100) {
    anonymized.businessDescription = anonymized.businessDescription.slice(0, 100) + '[truncated]';
  }
  
  // IP address hashing
  if (anonymized.ipAddress) {
    anonymized.ipAddress = hashIP(anonymized.ipAddress);
  }
  
  // Remove sensitive fields
  delete anonymized.creditCard;
  delete anonymized.ssn;
  delete anonymized.password;
  
  return anonymized;
};

const hashIP = (ip: string): string => {
  // Simple hash for IP anonymization
  return require('crypto').createHash('sha256').update(ip).digest('hex').slice(0, 8);
};
```

## Data Lifecycle Management

### Retention Policies (PRD Section 7.3)
```sql
-- databases/cron/purge.sql
-- Monthly anonymization job (runs 1st of each month)
UPDATE session_logs 
SET user_id = NULL, 
    ip_address = NULL,
    user_agent = NULL,
    anonymized = true
WHERE created_at < NOW() - INTERVAL '30 days' 
  AND anonymized = false;

-- 24-month data purge (PRD requirement)
DELETE FROM prompt_logs 
WHERE created_at < NOW() - INTERVAL '24 months';

DELETE FROM session_logs 
WHERE created_at < NOW() - INTERVAL '24 months';

-- Log purge operations for audit
INSERT INTO session_logs (event_name, properties, created_at)
VALUES 
  ('data_purged', '{"table": "prompt_logs", "count": ' || ROW_COUNT() || '}', NOW()),
  ('data_anonymized', '{"table": "session_logs", "count": ' || ROW_COUNT() || '}', NOW());
```

## Performance Monitoring

### API Latency Tracking Middleware
```typescript
// backend/middleware/latencyTracking.js
import { v4 as uuidv4 } from 'uuid';
import { analytics } from '../services/posthog.js';

export const latencyTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const correlationId = uuidv4();
  
  req.correlationId = correlationId;
  req.startTime = startTime;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    analytics.capture('api_latency', {
      endpoint: req.path,
      durationMs: duration,
      correlationId: correlationId,
      statusCode: res.statusCode,
      method: req.method,
      userId: req.user?.id || null,
      sessionId: req.sessionID
    });
    
    // Alert if exceeding performance targets
    if (duration > 2000) { // PRD target: <2s
      analytics.capture('performance_alert', {
        endpoint: req.path,
        durationMs: duration,
        threshold: 2000,
        severity: 'warning',
        correlationId: correlationId
      });
    }
  });
  
  next();
};
```

## Validation

### CI/CD Schema Validation
```yaml
# .github/workflows/validate-analytics.yml
name: Analytics Schema Validation
on: [push, pull_request]

jobs:
  validate-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Validate Event Schemas
        run: |
          npm run test:analytics-schemas
          npm run lint:analytics-events
      - name: Check Schema Coverage
        run: npm run test:schema-coverage
```

### Jest Testing Requirements
```typescript
// backend/tests/analytics.test.js
import { validateEventPayload } from '../middleware/analytics.js';
import { analytics } from '../services/posthog.js';

describe('Analytics Event Tracking', () => {
  // Test all funnel stages (F1-F9)
  const funnelStages = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'];
  const stepNames = ['discovery_hook', 'discovery_funnel', 'spark_layer', 'purchase_flow', 'detailed_input', 'intent_mirror', 'deliverable_generation', 'spark_split', 'feedback_capture'];

  test.each(funnelStages)('funnel_step validation for stage %s', async (stage) => {
    const validPayload = {
      stepName: stepNames[parseInt(stage.slice(1)) - 1],
      completed: true,
      dropoffReason: null,
      userId: 'test-uuid-123',
      sessionId: 'session-uuid-456',
      timestamp: new Date().toISOString(),
      funnelStage: stage
    };
    
    expect(() => validateEventPayload('funnel_step', validPayload)).not.toThrow();
  });

  test('interaction_logged coverage >80%', async () => {
    // Test all interaction types defined in PRD
    const interactionTypes = [
      'pricing_modal_click',
      'tooltip_viewed', 
      'spark_selected',
      'quiz_started',
      'product_card_clicked',
      'preview_viewed',
      'field_edited',
      'support_requested'
    ];
    
    for (const interactionType of interactionTypes) {
      const payload = {
        userId: 'test-uuid',
        sessionId: 'session-uuid',
        interactionType: interactionType,
        details: { testData: true },
        timestamp: new Date().toISOString()
      };
      
      expect(() => validateEventPayload('interaction_logged', payload)).not.toThrow();
    }
  });

  // Test emotional metrics
  test('emotional resonance tracking', async () => {
    const payload = {
      userId: 'test-uuid',
      sessionId: 'session-uuid',
      outputId: 'deliverable-123',
      resonanceScore: 0.8,
      arousal: 0.6,
      valence: 0.7,
      measurementSource: 'hume_ai',
      apiLatencyMs: 150
    };
    
    expect(() => validateEventPayload('emotional_resonance_measured', payload)).not.toThrow();
  });

  // Test TrustDelta tracking
  test('TrustDelta plan comparison', async () => {
    const payload = {
      userId: 'test-uuid',
      sessionId: 'session-uuid',
      trustDelta: 4.3, // Above target of 4.2
      selected: 'canai',
      emotionalResonance: {
        canaiScore: 0.8,
        genericScore: 0.5,
        delta: 0.3
      },
      comparisonTimeMs: 1200
    };
    
    expect(() => validateEventPayload('plan_compared', payload)).not.toThrow();
  });
});

// Test IDs for each stage (PRD requirement)
describe('Stage-specific tests', () => {
  test('F1-tests: Discovery Hook analytics', async () => {
    // Test F1 specific events
  });
  
  test('F2-tests: Discovery Funnel analytics', async () => {
    // Test F2 specific events
  });
  
  // ... F3-tests through F9-tests
});
```

### PostHog Dashboard Validation
Monitor these key metrics against PRD targets:
- **Funnel Conversion Rates**: >75% F1, >90% F2, >80% F3, >90% F4, >85% F5, >85% F6, >85% F7, >65% F8, >70% F9
- **TrustDelta Performance**: ≥4.2 average with >65% CanAI preference
- **Emotional Resonance**: >0.7 average resonance scores
- **Performance Metrics**: <2s generation times, <100ms error responses
- **Quality Metrics**: >95% filtering accuracy, >85% error recovery

### Sentry Error Monitoring
```typescript
// backend/services/sentry.js integration
import * as Sentry from '@sentry/node';

export const trackAnalyticsError = (eventName: string, error: Error, payload: any) => {
  Sentry.captureException(error, {
    tags: {
      component: 'analytics',
      event_name: eventName,
      severity: 'warning'
    },
    extra: {
      payload: sanitizeForLogging(payload),
      timestamp: new Date().toISOString()
    },
    fingerprint: ['analytics', eventName]
  });
};

const sanitizeForLogging = (payload: any) => {
  const sanitized = { ...payload };
  // Remove sensitive data for logging
  delete sanitized.email;
  delete sanitized.businessDescription;
  return sanitized;
};
```

## Project Integration Points

### Target Implementation Files
- **Primary Service**: `backend/services/posthog.js`
- **Validation Middleware**: `backend/middleware/analytics.js`
- **PII Anonymization**: `backend/services/anonymize.js`
- **Database Schemas**: `databases/session_logs`, `databases/error_logs`
- **API Route Integration**: All routes in `backend/routes/`
- **Frontend Tracking**: `frontend/src/utils/analytics.ts`
- **Latency Middleware**: `backend/middleware/latencyTracking.js`

### Make.com Webhook Integration
```typescript
// backend/webhooks/make_scenarios/ integration
// Trigger analytics events based on Make.com scenario completions

// add_project.json completion
posthog.capture('project_created', {
  userId: user.id,
  sessionId: session.id,
  projectType: productTrack,
  makeScenario: 'add_project',
  automationLatencyMs: scenarioCompletionTime
});

// Support escalation trigger
posthog.capture('support_escalated', {
  userId: user.id,
  sessionId: session.id,
  triggerReason: 'low_rating',
  rating: feedbackRating,
  makeScenario: 'support_escalation'
});
```

### Success Metrics Alignment (PRD Section 12)
- **Acquisition Metrics**: >75% click-through, >90% funnel completion, >50% preview views
- **Engagement Metrics**: >80% spark selection, >65% SparkSplit interaction, >70% quiz/tooltip usage
- **Trust Metrics**: >85% intent confirmation, >65% CanAI preference
- **Conversion Metrics**: >90% checkout completion, >85% deliverable access
- **Advocacy Metrics**: >70% feedback response, >25% social shares, >15% referrals
- **Satisfaction Metrics**: >4.0/5.0 rating, >0.7 emotional resonance, <10% revisions
- **Edge-Case Metrics**: >85% error recovery, >95% filtering accuracy

## Ownership and Governance

### Team Responsibilities
- **Backend Team**: Owns analytics implementation in `backend/services/posthog.js`
- **Product Team**: Defines success metrics and event requirements aligned with PRD
- **QA Team**: Validates >80% event coverage and schema compliance
- **DevOps Team**: Monitors PostHog dashboards and Sentry alerts

### Change Management Process
1. **Schema Changes**: Require PR review and backward compatibility validation
2. **New Events**: Must align with PRD objectives and success metrics
3. **Deprecation**: 90-day notice with migration path provided
4. **Documentation**: Update this rules file and `cortex.md` for all changes
5. **Cortex Updates**: Log significant analytics changes in `cortex.md` (e.g., "Added F3 spark analytics - 03:00 PM MDT, June 13, 2025")

### Continuous Improvement
- **Monthly Review**: Analytics performance against PRD targets
- **Quarterly Optimization**: Event schema refinement and dashboard updates  
- **Annual Strategy**: Analytics roadmap alignment with business objectives

## References

### PRD Sections
- **Section 3**: Objectives (TrustDelta ≥4.2, >65% CanAI preference)
- **Section 5**: User Journey (9-stage F1-F9 progression)
- **Sections 6.1–6.9**: Functional Requirements (stage-specific analytics)
- **Section 8.6**: Monitoring & Analytics architecture
- **Section 12**: Success Metrics (acquisition, engagement, trust, conversion, advocacy, satisfaction)

### Project Structure
- **Analytics Service**: `backend/services/posthog.js`
- **Data Storage**: `databases/session_logs`, `databases/error_logs`
- **Validation**: `backend/middleware/analytics.js`
- **PII Protection**: `backend/services/anonymize.js`

### Success Targets
- **TrustDelta**: ≥4.2 average score
- **CanAI Preference**: >65% in SparkSplit comparisons  
- **Emotional Resonance**: >0.7 average (arousal >0.5, valence >0.6)
- **Performance**: <2s generation, <100ms errors, 99.9% uptime

## Version Control
- **Current Version**: 5.0.0 - Enhanced PRD alignment with critical success events, priority matrix, and real-time monitoring for optimal roo development experience
- **Previous Version**: 4.0.0 - Complete PRD alignment with comprehensive stage coverage - June 18, 2025
- **Next Review**: 30 days from implementation
- **Last Updated**: June 18, 2025

## Roo Code Development Checklist
When implementing analytics, ensure:
- [ ] All critical success events are implemented first
- [ ] TypeScript schemas match exactly with provided interfaces
- [ ] Joi validation enforces PRD targets (TrustDelta ≥4.2, resonance >0.7)
- [ ] Real-time alerts are configured for success metrics
- [ ] PII anonymization is applied before PostHog transmission
- [ ] Error logging captures validation failures
- [ ] Test coverage includes all mandatory events
- [ ] Dashboard metrics align with PRD Section 12 success criteria


















