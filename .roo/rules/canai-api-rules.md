---
description: 
globs: 
alwaysApply: true
---
# CanAI API Rules

## Purpose
Ensure REST APIs are developer-friendly, performant (<200ms responses), and emotionally resonant, supporting Stripe and Supabase integrations for the CanAI Emotional Sovereignty Platform's complete 9-stage user journey.

## Role and Expertise
You are an API development expert for the **CanAI Emotional Sovereignty Platform**, ensuring every endpoint aligns with PRD requirements, API contract specifications, and project structure. You deliver developer-friendly, emotionally intelligent APIs that drive user trust and engagement through the complete 9-stage journey with all 25+ endpoints.

## Core Principles & Context

### 1. PRD-First Development
- **Complete API Catalog**: Implement all 25+ endpoints as specified in PRD Section 8.7 API Catalog
- **Performance Targets**: <1.5s spark generation, <2s deliverable generation, <500ms funnel validation, <200ms auto-save, <100ms error responses
- **Emotional Sovereignty**: Every API response must support emotional resonance and user trust building
- **Project Structure Alignment**: Follow `backend/routes/`, `backend/services/`, `backend/middleware/` organization per project-structure-mapping.md

### 2. API Contract Compliance
- **Base URL**: `https://canai-router.onrender.com:10000/v1` (internal: `canai-router:10000`)
- **Standard Response Format**: `{ data?, error: string|null, metadata? }`
- **Authentication Levels**:
  - **None**: F1-F2 endpoints, `/v1/consent`, `/v1/log-interaction`
  - **Memberstack JWT**: F3-F9 endpoints, user-specific operations
  - **Admin JWT**: `/v1/admin-metrics` only
- **Rate Limiting**: 100 req/min/IP with exponential backoff
- **Input Sanitization**: DOMPurify + Zod validation on all inputs

### 3. Project Structure Integration
```typescript
// File Organization Per Project Structure
backend/
├── routes/              # API endpoint handlers (align with PRD 8.7)
│   ├── messages.js     # GET /v1/messages
│   ├── funnel.js       # POST /v1/validate-input
│   ├── sparks.js       # POST /v1/generate-sparks, /v1/regenerate-sparks
│   ├── stripe.js       # Payment endpoints
│   └── deliverables.js # F7 generation endpoints
├── middleware/          # Shared middleware
│   ├── auth.js         # Memberstack JWT validation
│   ├── validation.js   # Zod + DOMPurify
│   ├── rateLimit.js    # 100 req/min/IP
│   └── cache.js        # Response caching
├── services/           # External integrations
│   ├── supabase.js     # Database operations
│   ├── gpt4o.js        # OpenAI integration
│   ├── hume.js         # Emotional resonance
│   └── posthog.js      # Analytics tracking
└── webhooks/           # Make.com integrations
    └── make_scenarios/ # Existing scenarios
```

## Complete API Specifications

### F1: Discovery Hook (No Authentication)

#### GET /v1/messages
**Purpose**: Fetch trust indicators and testimonials for emotional engagement
```typescript
// File: backend/routes/messages.js
// Middleware: backend/middleware/cache.js (TTL: 5min)
// Service: backend/services/supabase.js

export interface MessagesResponse {
  data: {
    messages: Array<{
      text: string;
      author?: string;
      type: 'testimonial' | 'trust_indicator' | 'sample_preview';
      created_at: string;
      emotional_tone?: 'warm' | 'bold' | 'optimistic';
    }>;
    personalized: boolean;
    trust_score_context?: number;
  };
  error: null;
  metadata: {
    timestamp: string;
    request_id: string;
    cache_hit: boolean;
  };
}

// Implementation Requirements:
// - Cache responses for 5min (backend/middleware/cache.js)
// - Log to PostHog: posthog.capture('messages_fetched', { count, user_id? })
// - Handle Supabase errors gracefully with fallback content
// - Performance target: <200ms
```

#### POST /v1/log-interaction
**Purpose**: Track user interactions for behavioral analytics
```typescript
// File: backend/routes/interaction.js
// Middleware: backend/middleware/validation.js
// Service: backend/services/supabase.js, backend/services/posthog.js

export interface LogInteractionRequest {
  user_id?: string;
  session_id: string;
  interaction_type: 'modal_open' | 'modal_close' | 'card_click' | 'button_click' | 'page_view';
  interaction_details: {
    element_id?: string;
    product_viewed?: 'business_builder' | 'social_email' | 'site_audit';
    duration_ms?: number;
    emotional_response?: 'positive' | 'neutral' | 'negative';
  };
  timestamp?: string;
}

// Implementation Requirements:
// - Store in Supabase session_logs table
// - Trigger Make.com webhook: backend/webhooks/make_scenarios/log_interaction.js
// - Performance target: <100ms response
// - Batch analytics events for performance
```

#### GET /v1/pricing
**Purpose**: Retrieve transparent pricing for all product tracks
```typescript
// File: backend/routes/pricing.js
// Service: backend/services/supabase.js

export interface PricingResponse {
  data: {
    products: Array<{
      id: string;
      name: 'business_builder' | 'social_email' | 'site_audit';
      price: number; // $99, $49, $79 per PRD
      currency: 'USD';
      description: string;
      features: string[];
      word_count_range?: string; // "700-800 words" for business_builder
      emotional_benefits: string[]; // Trust-building features
    }>;
    transparency_message: string;
  };
  error: null;
}

// Implementation Requirements:
// - Cache for 1hr, invalidate on admin updates
// - Log pricing_viewed events to PostHog
// - Support A/B testing via feature flags
```

### F2: 2-Step Discovery Funnel (No Authentication)

#### POST /v1/validate-input
**Purpose**: Validate funnel inputs with GPT-4o and generate trust score
```typescript
// File: backend/routes/funnel.js
// Middleware: backend/middleware/validation.js
// Service: backend/services/gpt4o.js, backend/services/hume.js

export interface ValidateInputRequest {
  businessType: 'retail' | 'service' | 'tech' | 'creative' | 'other';
  otherType?: string;
  primaryChallenge: string; // 5-100 characters
  preferredTone: 'warm' | 'bold' | 'optimistic' | 'professional' | 'playful' | 'inspirational' | 'custom';
  customTone?: string;
  desiredOutcome: 'secure_funding' | 'grow_customers' | 'improve_operations' | 'boost_online_presence';
  session_id: string;
}

export interface ValidateInputResponse {
  data: {
    valid: boolean;
    trust_score: number; // 0-100, target ≥85 per PRD
    feedback: string; // GPT-4o generated
    emotional_resonance: {
      arousal: number; // Hume AI, target >0.5
      valence: number; // Hume AI, target >0.6
      confidence: number;
    };
    clarifying_questions?: string[];
    next_step_recommendation: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <500ms
// - Store in Supabase initial_prompt_logs table
// - Trigger Make.com webhook: backend/webhooks/make_scenarios/save_funnel.js
// - Circuit breaker for Hume AI (>900 req/day → GPT-4o fallback)
// - Log validation_completed to PostHog with trust_score
```

### F3: Spark Layer (Memberstack JWT Required)

#### POST /v1/generate-sparks
**Purpose**: Generate three emotionally resonant spark concepts
```typescript
// File: backend/routes/sparks.js
// Middleware: backend/middleware/auth.js, backend/middleware/validation.js
// Service: backend/services/gpt4o.js, backend/services/hume.js

export interface GenerateSparksRequest {
  business_type: string;
  tone: string;
  outcome: string;
  challenge: string;
  initial_prompt_id: string; // UUID from F2
  emotional_context?: {
    primary_driver: 'community' | 'trust' | 'ambition' | 'connection' | 'inclusion';
    user_confidence_level: number; // 1-10
  };
}

export interface GenerateSparksResponse {
  data: {
    sparks: Array<{
      id: string;
      title: string;
      tagline: string;
      description: string;
      emotional_driver: 'community' | 'trust' | 'ambition' | 'connection' | 'inclusion';
      resonance_score: number; // Hume AI validation
      trust_alignment: number; // 1-10
    }>;
    generation_metadata: {
      generation_time_ms: number;
      model_version: string;
      emotional_analysis: object;
    };
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <1500ms
// - Store in Supabase spark_logs table
// - Cache results: key="sparks_{businessType}_{tone}_{outcome}", TTL=5min
// - Log spark_generated to PostHog with selection metrics
// - Success metric: >80% selection rate (PRD Section 12.2)
```

#### POST /v1/regenerate-sparks
```typescript
// File: backend/routes/sparks.js
// Purpose: Regenerate sparks with attempt limiting (max 3/4 attempts)
// Rate limiting: backend/middleware/rateLimit.js

export interface RegenerateSparksRequest {
  business_type: string;
  tone: string;
  outcome: string;
  initial_prompt_id: string;
  attempt_count: number;
  trust_score: number;
  feedback?: string;
  previous_spark_ids: string[];
}

// Implementation Requirements:
// - Max 3 attempts (4 if trust_score <50%)
// - Enhanced prompts based on previous attempts
// - Store regeneration patterns in Supabase
// - Log to PostHog: spark_regenerated with attempt metrics
```

### F4: Purchase Flow (Memberstack JWT Required)

#### POST /v1/stripe-session
```typescript
// File: backend/routes/stripe.js
// Purpose: Create transparent Stripe checkout with emotional context
// Auth: backend/middleware/auth.js (Memberstack JWT)
// Service: backend/services/stripe.js

export interface StripeSessionRequest {
  spark: {
    title: string;
    product_track: 'business_builder' | 'social_email' | 'site_audit';
  };
  user_id: string;
  spark_log_id: string;
  pricing_transparency_acknowledged: boolean;
}

export interface StripeSessionResponse {
  data: {
    session: { id: string };
    pricing_details: {
      amount: number; // $99, $49, $79 per PRD
      currency: 'USD';
      product_name: string;
    };
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <1000ms
// - Trigger Make.com add_project.json on successful payment
// - Log purchase_initiated and purchase_completed to PostHog
// - Success metric: >90% checkout completion (PRD Section 12.4)
// - Require Idempotency-Key (UUID v4) header
```

#### POST /v1/refund
```typescript
// File: backend/routes/stripe.js
// Purpose: Process refunds with transparent policy
// Auth: backend/middleware/auth.js

export interface RefundRequest {
  session_id: string;
  reason: string;
  user_id: string;
}

export interface RefundResponse {
  data: { status: 'success'; refund_id: string };
  error: null;
}

// Implementation Requirements:
// - Process via backend/services/stripe.js
// - Log refund events to PostHog and Supabase
// - Update user access permissions
```

#### POST /v1/switch-product
```typescript
// File: backend/routes/stripe.js
// Purpose: Switch product tracks with transparent pricing

export interface SwitchProductRequest {
  session_id: string;
  new_product: 'business_builder' | 'social_email' | 'site_audit';
  user_id: string;
}

// Implementation Requirements:
// - Refund original, create new session
// - Trigger Make.com add_project.json for new product
// - Maintain user journey continuity
```

### F5: Detailed Input Collection (Memberstack JWT Required)

#### POST /v1/save-progress
```typescript
// File: backend/routes/inputs.js
// Purpose: Auto-save detailed inputs with <200ms performance
// Auth: backend/middleware/auth.js

export interface SaveProgressRequest {
  prompt_id?: string; // null for first save
  payload: {
    // 12-field inputs per PRD
    businessName: string;
    businessDescription: string;
    targetAudience: string;
    primaryGoal: string;
    revenueModel?: string;
    currentStage?: string;
    timeline?: string;
    budget?: string;
    marketingChannels?: string;
    competitiveAdvantage?: string;
    challenges?: string;
    successMetrics?: string;
  };
  step_completed: 1 | 2;
  auto_save: boolean;
}

export interface SaveProgressResponse {
  data: {
    prompt_id: string;
    clarifying_questions?: string[];
    completeness_score: number; // 0-100
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <200ms for auto-save
// - Store in Supabase prompt_logs table with RLS
// - Validate with Zod schemas in backend/middleware/validation.js
// - Trigger Make.com webhook: backend/webhooks/make_scenarios/save_inputs.js
// - Require Idempotency-Key for auto-save deduplication
```

#### GET /v1/resume
```typescript
// File: backend/routes/inputs.js
// Purpose: Resume interrupted input collection or deliverable generation
// Auth: backend/middleware/auth.js

export interface ResumeResponse {
  data: {
    current_stage: 'F5' | 'F7';
    prompt_id?: string;
    saved_inputs?: object;
    generation_status?: 'pending' | 'complete';
  };
  error: null;
}

// Implementation Requirements:
// - Check Supabase for user's latest progress
// - Support resuming from F5 (inputs) or F7 (generation)
// - Performance target: <200ms
```

### F6: Intent Mirror (Memberstack JWT Required)

#### POST /v1/intent-mirror
```typescript
// File: backend/routes/intent.js
// Purpose: Generate intelligent summary with confidence score
// Auth: backend/middleware/auth.js
// Service: backend/services/gpt4o.js

export interface IntentMirrorRequest {
  businessName: string;
  targetAudience: string;
  primaryGoal: string;
  // ... other 12-field inputs
}

export interface IntentMirrorResponse {
  data: {
    summary: string;
    confidence_score: number; // 0-100
    clarifying_questions: string[];
    emotional_themes: string[];
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <1000ms
// - Store summary in Supabase prompt_logs
// - Generate emotionally intelligent summaries
// - Support real-time editing capability
```

### F7: Deliverable Generation (Memberstack JWT Required)

#### POST /v1/deliverable
```typescript
// File: backend/routes/deliverables.js
// Purpose: Generate high-quality, emotionally resonant deliverables
// Auth: backend/middleware/auth.js
// Service: backend/services/gpt4o.js, backend/services/hume.js

export interface DeliverableRequest {
  prompt_log_id: string;
  user_id: string;
  product_track: 'business_builder' | 'social_email' | 'site_audit';
  generation_context: {
    emotional_tone: string;
    target_audience: string;
    business_context: object;
  };
}

export interface DeliverableResponse {
  data: {
    canai_output: string; // 700-800 words for business_builder
    pdf_url?: string; // Supabase storage URL
    emotional_resonance: {
      arousal: number; // >0.5
      valence: number; // >0.6
      overall_score: number; // >0.7
    };
    quality_metrics: {
      word_count: number;
      readability_score: number;
      emotional_alignment: number;
    };
    generation_time_ms: number;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <2000ms per PRD
// - Store in Supabase comparisons table
// - Validate emotional resonance with Hume AI
// - Log deliverable_generated to PostHog with quality metrics
// - Support revision workflow with feedback integration
```

#### GET /v1/generation-status
```typescript
// File: backend/routes/deliverables.js
// Purpose: Check deliverable generation status
// Auth: backend/middleware/auth.js

export interface GenerationStatusResponse {
  data: {
    status: 'complete' | 'pending' | 'failed';
    pdf_url?: string;
    progress_percentage?: number;
    estimated_completion?: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <200ms
// - Check Supabase comparisons table
// - Support real-time status updates
```

#### POST /v1/request-revision
```typescript
// File: backend/routes/deliverables.js
// Purpose: Handle user-requested revisions with feedback
// Auth: backend/middleware/auth.js

export interface RequestRevisionRequest {
  prompt_id: string;
  feedback: string;
  revision_type: 'tone' | 'content' | 'structure' | 'length';
}

export interface RequestRevisionResponse {
  data: {
    new_output: string;
    trust_delta: number;
    revision_id: string;
  };
  error: null;
}

// Implementation Requirements:
// - Incorporate user feedback into revision prompts
// - Track revision patterns for improvement
// - Store revisions in Supabase with version control
// - Trigger Make.com webhook: generate_deliverable.js
```

#### POST /v1/regenerate-deliverable
```typescript
// File: backend/routes/deliverables.js
// Purpose: Regenerate deliverable with attempt limiting
// Rate limiting: Max 2 attempts per PRD

export interface RegenerateDeliverableRequest {
  prompt_id: string;
  attempt_count: number;
  regeneration_reason?: string;
}

// Implementation Requirements:
// - Max 2 attempts per user per deliverable
// - Enhanced prompts based on previous attempts
// - Log regeneration patterns to PostHog
```

### F9: Feedback Capture (Memberstack JWT Required)

#### POST /v1/feedback
```typescript
// File: backend/routes/feedback.js
// Purpose: Capture comprehensive user feedback
// Auth: backend/middleware/auth.js
// Service: backend/services/gpt4o.js (sentiment), backend/services/supabase.js

export interface FeedbackRequest {
  prompt_id: string;
  rating: number; // 1-5 scale
  comment?: string;
  shared_platforms?: string[];
  user_id: string;
  feedback_categories?: {
    quality: number;
    emotional_resonance: number;
    actionability: number;
  };
}

export interface FeedbackResponse {
  data: {
    status: 'success';
    sentiment_analysis?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    };
    follow_up_recommendation?: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <500ms
// - Store in Supabase feedback_logs table with RLS
// - Perform sentiment analysis with GPT-4o
// - Trigger Make.com webhook: save_feedback.js
// - Track satisfaction metrics for improvement
```

#### POST /v1/refer
```typescript
// File: backend/routes/feedback.js
// Purpose: Generate referral links with incentives
// Auth: backend/middleware/auth.js

export interface ReferRequest {
  user_id: string;
  friend_email: string;
  personal_message?: string;
}

export interface ReferResponse {
  data: {
    referral_link: string;
    incentive_details: string;
    tracking_id: string;
  };
  error: null;
}

// Implementation Requirements:
// - Generate unique tracking links
// - Store in Supabase session_logs with RLS
// - Cache links in backend/services/cache.js
// - Trigger Make.com webhook: save_referral.js
```

## Support & Utility Endpoints

### POST /v1/generate-tooltip
```typescript
// File: backend/routes/tooltip.js
// Purpose: Generate dynamic tooltips for form fields
// Cache: TTL 1hr per field

export interface GenerateTooltipRequest {
  field: string;
  context?: object;
}

export interface GenerateTooltipResponse {
  data: { tooltip: string };
  error: null;
}

// Implementation Requirements:
// - Performance target: <100ms
// - Cache with key: tooltip_{field}
// - Generate contextual help via GPT-4o
```

### POST /v1/detect-contradiction
```typescript
// File: backend/routes/funnel.js
// Purpose: Flag tone/outcome mismatches

export interface DetectContradictionRequest {
  preferred_tone: string;
  desired_outcome: string;
  business_context?: string;
}

export interface DetectContradictionResponse {
  data: {
    contradiction: boolean;
    message?: string;
    suggestion?: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <200ms
// - Use GPT-4o for contradiction detection
// - Provide actionable suggestions
```

### POST /v1/filter-input
```typescript
// File: backend/routes/filter.js
// Purpose: Filter inappropriate inputs (NSFW detection)

export interface FilterInputRequest {
  payload: {
    business_description: string;
    primary_goal: string;
    // ... other inputs to validate
  };
}

export interface FilterInputResponse {
  data: {
    valid: boolean;
    reason?: string;
    filtered_content?: string[];
  };
  error: null;
}

// Implementation Requirements:
// - Use GPT-4o for content filtering
// - Validate with Zod + DOMPurify
// - Log filtered attempts to Supabase error_logs
```

## Security & Admin Endpoints

### POST /v1/consent
```typescript
// File: backend/routes/consent.js
// Purpose: Log GDPR/CCPA consent (No authentication required)

export interface ConsentRequest {
  user_id?: string;
  consent_type: 'gdpr' | 'ccpa';
  consented: boolean;
  ip_address: string;
}

// Implementation Requirements:
// - Store in Supabase session_logs
// - Performance target: <200ms
// - Support anonymous consent logging
```

### POST /v1/purge-data
```typescript
// File: backend/routes/purge.js  
// Purpose: Delete user data (GDPR/CCPA compliance)
// Auth: backend/middleware/auth.js

export interface PurgeDataRequest {
  user_id: string;
  purge_reason: 'user_request' | 'account_deletion' | 'inactive';
  confirmation_token: string;
}

// Implementation Requirements:
// - Delete across all Supabase tables with RLS
// - Log purge events to error_logs
// - Performance target: <1000ms
```

### GET /v1/admin-metrics
```typescript
// File: backend/routes/admin.js
// Purpose: Admin dashboard metrics
// Auth: Admin JWT only

export interface AdminMetricsResponse {
  data: {
    funnel_metrics: { step_name: number };
    error_logs: Array<{ error_message: string; count: number }>;
    feedback_trends: { avg_rating: number; poor_count: number };
    performance_metrics: { avg_latency_ms: number; error_rate: number };
  };
  error: null;
}

// Implementation Requirements:
// - Aggregate data from Supabase logs
// - Performance target: <1000ms
// - Admin-only access control
```

### POST /v1/export
```typescript
// File: backend/routes/export.js
// Purpose: Export deliverables to CRM (Future enhancement)
// Auth: backend/middleware/auth.js

export interface ExportRequest {
  deliverable_id: string;
  export_format: 'pdf' | 'docx' | 'json';
  crm_integration?: 'hubspot' | 'salesforce';
}

// Implementation Requirements:
// - Export from Supabase storage
// - Support multiple formats
// - Future CRM integration hooks
```

## Advanced Implementation Standards

### Idempotency Requirements
```typescript
// All POST/PATCH endpoints require Idempotency-Key header
// Store in databases/idempotency_logs via backend/middleware/idempotency.js
// Format: UUID v4
// TTL: 24 hours for replay protection

const idempotencyConfig = {
  required_methods: ['POST', 'PATCH'],
  key_format: 'uuid_v4',
  storage: 'supabase_idempotency_logs',
  ttl: '24h',
  replay_protection: true
};
```

### Empathetic Error Messages (PRD Table 17)
```typescript
// File: backend/middleware/error.js
export const empathetic_messages = {
  timeout_spark: "We're sparking your ideas! This is taking a moment longer than usual.",
  timeout_deliverable: "Your vision deserves perfection. We're crafting something special.",
  validation_failed: "Your vision needs clarity—please add more detail to your business description.",
  rate_limit: "You're moving fast! Please take a moment and try again in a few seconds.",
  payment_failed: "Let's resolve this payment together. Your progress is safely saved.",
  server_error: "Our systems are momentarily busy. We'll have you back on track shortly.",
  network_error: "Connection hiccup detected. Your progress is saved—let's continue."
};

// Implementation Requirements:
// - Use empathetic language per PRD Table 17
// - Include actionable next steps
// - Return in <100ms with correlation IDs
```

### Schema Validation with Joi
```typescript
// Define in backend/docs/api.yaml (OpenAPI 3.0)
// Examples per API Contract Specification:
// - /v1/generate-sparks: { sparks: [{ title: string, tagline: string }], error: string|null }
// - /v1/messages: { messages: [{ text: string }], error: string|null }
// - /v1/pricing: { products: [{ name: string, price: number }], error: string|null }
// - /v1/intent-mirror: { summary: string, confidence: number, error: string|null }

// Validate all schemas with Joi in backend/middleware/validation.js
```

### Authentication Implementation
```typescript
// Use MemberStack JWT in Authorization header (backend/middleware/auth.js)
// Allow anonymous access for specific endpoints:
const anonymousEndpoints = [
  '/v1/messages',
  '/v1/pricing', 
  '/v1/log-interaction',
  '/v1/validate-input',
  '/v1/generate-tooltip',
  '/v1/detect-contradiction', 
  '/v1/filter-input',
  '/v1/consent'
];

// Require JWT for all other endpoints (F3-F9, admin, user operations)
```

### F8: SparkSplit (Memberstack JWT Required)

#### POST /v1/spark-split
**Purpose**: Compare CanAI vs generic output to demonstrate value
```typescript
// File: backend/routes/sparkSplit.js
// Service: backend/services/sparkSplit.js, backend/services/hume.js

export interface SparkSplitResponse {
  data: {
    canai_output: string;
    generic_output: string;
    trust_delta: number; // Target ≥4.0/5.0 per PRD
    emotional_resonance: {
      canai_score: number;
      generic_score: number;
      delta: number; // Positive = CanAI advantage
    };
    comparison_metrics: {
      personalization_score: number;
      emotional_depth: number;
      actionability: number;
    };
  };
  error: null;
}

// Implementation Requirements:
// - Generate distinct prompts for CanAI vs generic outputs
// - Target TrustDelta ≥4.0/5.0 and >65% user preference for CanAI
// - Log plan_compared to PostHog with trust metrics
// - Performance target: <1500ms
```

### F9: Feedback Capture (Memberstack JWT Required)

#### POST /v1/feedback
```typescript
// File: backend/routes/feedback.js
// Purpose: Capture comprehensive user feedback
// Auth: backend/middleware/auth.js
// Service: backend/services/gpt4o.js (sentiment), backend/services/supabase.js

export interface FeedbackRequest {
  prompt_id: string;
  rating: number; // 1-5 scale
  comment?: string;
  shared_platforms?: string[];
  user_id: string;
  feedback_categories?: {
    quality: number;
    emotional_resonance: number;
    actionability: number;
  };
}

export interface FeedbackResponse {
  data: {
    status: 'success';
    sentiment_analysis?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    };
    follow_up_recommendation?: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <500ms
// - Store in Supabase feedback_logs table with RLS
// - Perform sentiment analysis with GPT-4o
// - Trigger Make.com webhook: save_feedback.js
// - Track satisfaction metrics for improvement
```

#### POST /v1/refer
```typescript
// File: backend/routes/feedback.js
// Purpose: Generate referral links with incentives
// Auth: backend/middleware/auth.js

export interface ReferRequest {
  user_id: string;
  friend_email: string;
  personal_message?: string;
}

export interface ReferResponse {
  data: {
    referral_link: string;
    incentive_details: string;
    tracking_id: string;
  };
  error: null;
}

// Implementation Requirements:
// - Generate unique tracking links
// - Store in Supabase session_logs with RLS
// - Cache links in backend/services/cache.js
// - Trigger Make.com webhook: save_referral.js
```

## Support & Utility Endpoints

### POST /v1/generate-tooltip
```typescript
// File: backend/routes/tooltip.js
// Purpose: Generate dynamic tooltips for form fields
// Cache: TTL 1hr per field

export interface GenerateTooltipRequest {
  field: string;
  context?: object;
}

export interface GenerateTooltipResponse {
  data: { tooltip: string };
  error: null;
}

// Implementation Requirements:
// - Performance target: <100ms
// - Cache with key: tooltip_{field}
// - Generate contextual help via GPT-4o
```

### POST /v1/detect-contradiction
```typescript
// File: backend/routes/funnel.js
// Purpose: Flag tone/outcome mismatches

export interface DetectContradictionRequest {
  preferred_tone: string;
  desired_outcome: string;
  business_context?: string;
}

export interface DetectContradictionResponse {
  data: {
    contradiction: boolean;
    message?: string;
    suggestion?: string;
  };
  error: null;
}

// Implementation Requirements:
// - Performance target: <200ms
// - Use GPT-4o for contradiction detection
// - Provide actionable suggestions
```

### POST /v1/filter-input
```typescript
// File: backend/routes/filter.js
// Purpose: Filter inappropriate inputs (NSFW detection)

export interface FilterInputRequest {
  payload: {
    business_description: string;
    primary_goal: string;
    // ... other inputs to validate
  };
}

export interface FilterInputResponse {
  data: {
    valid: boolean;
    reason?: string;
    filtered_content?: string[];
  };
  error: null;
}

// Implementation Requirements:
// - Use GPT-4o for content filtering
// - Validate with Zod + DOMPurify
// - Log filtered attempts to Supabase error_logs
```

## Security & Admin Endpoints

### POST /v1/consent
```typescript
// File: backend/routes/consent.js
// Purpose: Log GDPR/CCPA consent (No authentication required)

export interface ConsentRequest {
  user_id?: string;
  consent_type: 'gdpr' | 'ccpa';
  consented: boolean;
  ip_address: string;
}

// Implementation Requirements:
// - Store in Supabase session_logs
// - Performance target: <200ms
// - Support anonymous consent logging
```

### POST /v1/purge-data
```typescript
// File: backend/routes/purge.js  
// Purpose: Delete user data (GDPR/CCPA compliance)
// Auth: backend/middleware/auth.js

export interface PurgeDataRequest {
  user_id: string;
  purge_reason: 'user_request' | 'account_deletion' | 'inactive';
  confirmation_token: string;
}

// Implementation Requirements:
// - Delete across all Supabase tables with RLS
// - Log purge events to error_logs
// - Performance target: <1000ms
```

### GET /v1/admin-metrics
```typescript
// File: backend/routes/admin.js
// Purpose: Admin dashboard metrics
// Auth: Admin JWT only

export interface AdminMetricsResponse {
  data: {
    funnel_metrics: { step_name: number };
    error_logs: Array<{ error_message: string; count: number }>;
    feedback_trends: { avg_rating: number; poor_count: number };
    performance_metrics: { avg_latency_ms: number; error_rate: number };
  };
  error: null;
}

// Implementation Requirements:
// - Aggregate data from Supabase logs
// - Performance target: <1000ms
// - Admin-only access control
```

### POST /v1/export
```typescript
// File: backend/routes/export.js
// Purpose: Export deliverables to CRM (Future enhancement)
// Auth: backend/middleware/auth.js

export interface ExportRequest {
  deliverable_id: string;
  export_format: 'pdf' | 'docx' | 'json';
  crm_integration?: 'hubspot' | 'salesforce';
}

// Implementation Requirements:
// - Export from Supabase storage
// - Support multiple formats
// - Future CRM integration hooks
```

## Advanced Implementation Standards

### Idempotency Requirements
```typescript
// All POST/PATCH endpoints require Idempotency-Key header
// Store in databases/idempotency_logs via backend/middleware/idempotency.js
// Format: UUID v4, TTL: 24 hours for replay protection

const idempotencyConfig = {
  required_methods: ['POST', 'PATCH'],
  key_format: 'uuid_v4',
  storage: 'supabase_idempotency_logs',
  ttl: '24h',
  replay_protection: true
};
```

### Empathetic Error Messages (PRD Table 17)
```typescript
// File: backend/middleware/error.js
export const empathetic_messages = {
  timeout_spark: "We're sparking your ideas! This is taking a moment longer than usual.",
  timeout_deliverable: "Your vision deserves perfection. We're crafting something special.",
  validation_failed: "Your vision needs clarity—please add more detail to your business description.",
  rate_limit: "You're moving fast! Please take a moment and try again in a few seconds.",
  payment_failed: "Let's resolve this payment together. Your progress is safely saved.",
  server_error: "Our systems are momentarily busy. We'll have you back on track shortly.",
  network_error: "Connection hiccup detected. Your progress is saved—let's continue."
};

// Implementation Requirements:
// - Use empathetic language per PRD Table 17
// - Include actionable next steps
// - Return in <100ms with correlation IDs
```

### Schema Validation with Joi
```typescript
// Define in backend/docs/api.yaml (OpenAPI 3.0)
// Examples per API Contract Specification:
// - /v1/generate-sparks: { sparks: [{ title: string, tagline: string }], error: string|null }
// - /v1/messages: { messages: [{ text: string }], error: string|null }
// - /v1/pricing: { products: [{ name: string, price: number }], error: string|null }
// - /v1/intent-mirror: { summary: string, confidence: number, error: string|null }

// Validate all schemas with Joi in backend/middleware/validation.js
```

### Authentication Implementation
```typescript
// Use MemberStack JWT in Authorization header (backend/middleware/auth.js)
// Allow anonymous access for specific endpoints:
const anonymousEndpoints = [
  '/v1/messages',
  '/v1/pricing', 
  '/v1/log-interaction',
  '/v1/validate-input',
  '/v1/generate-tooltip',
  '/v1/detect-contradiction', 
  '/v1/filter-input',
  '/v1/consent'
];

// Require JWT for all other endpoints (F3-F9, admin, user operations)
```

## Advanced Implementation Requirements

### Error Handling & Recovery
```typescript
// Standard Error Response Schema
export interface APIErrorResponse {
  data?: null;
  error: string;
  details?: {
    code: string;
    field?: string;
    validation_errors?: Array<{
      path: string[];
      message: string;
      code: string;
    }>;
    retry_after?: number; // for rate limiting
  };
  metadata: {
    timestamp: string;
    request_id: string;
    error_id: string;
  };
}

// Circuit Breaker Implementation
// File: backend/middleware/hume.js
const humeCircuitBreaker = {
  failure_threshold: 900, // requests per day
  fallback_service: 'gpt4o_sentiment',
  trust_delta_penalty: -0.2,
  recovery_time: '24h'
};
```

### Performance Optimization
```typescript
// Caching Strategy per Project Structure
const cacheConfig = {
  // Static content - long TTL
  pricing: { ttl: '1hr', invalidation: 'admin_update', file: 'backend/middleware/cache.js' },
  messages: { ttl: '5min', key: 'user_type', file: 'backend/middleware/cache.js' },
  
  // Dynamic content - short TTL
  sparks: { ttl: '5min', key: 'business_type:tone:outcome', file: 'backend/services/cache.js' },
  validation: { ttl: '1min', key: 'input_hash', file: 'backend/services/cache.js' },
  
  // User-specific - no caching
  progress: { ttl: '0', security: 'user_scoped' },
  deliverables: { ttl: '0', security: 'user_scoped' }
};
```

### Integration Requirements

#### Supabase Integration
```typescript
// File: backend/services/supabase.js
// Tables per databases/ structure:
// - prompt_logs: User inputs with RLS
// - spark_logs: Generated sparks with emotional metrics
// - comparisons: SparkSplit results with trust deltas
// - feedback_logs: User feedback with sentiment analysis
// - session_logs: Interaction tracking for analytics

// RLS Policies Required:
// - user_access: auth.uid() = user_id for all user data
// - admin_access: auth.role() = 'admin' for admin endpoints
```

#### Make.com Webhook Integration
```typescript
// Files: backend/webhooks/make_scenarios/
// - add_project.json: Payment success trigger
// - save_funnel.js: F2 completion trigger  
// - generate_sparks.js: F3 generation trigger
// - save_feedback.js: F9 feedback trigger

// HMAC Validation Required for all webhooks
// Idempotency with UUID replay protection
// Dead letter queue for failed webhooks (3 retries, exponential backoff)
```

#### Analytics Integration
```typescript
// File: backend/services/posthog.js
// Key Events per PRD Section 12:
posthog.capture('discovery_hook', { user_id, session_id, completed: boolean });
posthog.capture('funnel_completion', { trust_score, emotional_resonance });
posthog.capture('spark_selected', { spark_id, emotional_driver, selection_time_ms });
posthog.capture('purchase_completed', { product, price, payment_method });
posthog.capture('deliverable_generated', { word_count, generation_time_ms, quality_score });
posthog.capture('spark_split_compared', { trust_delta, canai_preference: boolean });
posthog.capture('feedback_submitted', { rating, sentiment, shared_platforms });
```

## Testing & Quality Assurance

### Testing Strategy
```typescript
// File: backend/tests/api.test.js
// Test Coverage Requirements:
// - Unit tests: >90% coverage for all endpoints
// - Integration tests: End-to-end API flows with Supertest
// - Load tests: 10K concurrent users with <2s response times
// - Security tests: OWASP ZAP scans and input validation
// - Contract tests: API schema validation and backward compatibility

// Test IDs per PRD:
// - F1-tests: Discovery Hook endpoints
// - F2-tests: Funnel validation and trust scoring  
// - F3-tests: Spark generation and regeneration
// - F7-tests: Deliverable generation and quality
// - F8-tests: SparkSplit comparison and metrics
```

### Monitoring & Observability
```typescript
// Files: backend/services/sentry.js, backend/services/posthog.js
// Error Tracking: Real-time error detection with Sentry
// Performance Monitoring: PostHog events for latency and usage
// Health Checks: /health endpoint with dependency status
// Metrics Dashboard: Real-time API performance and business metrics
```

## File-Specific Implementation Guidelines

### Backend Routes (backend/routes/)
- **messages.js**: Trust indicators with emotional context
- **funnel.js**: Input validation with GPT-4o and Hume AI
- **sparks.js**: Concept generation with emotional drivers
- **stripe.js**: Payment processing with transparent pricing
- **deliverables.js**: High-quality output generation
- **sparkSplit.js**: Comparison engine for value demonstration

### Middleware (backend/middleware/)
- **auth.js**: Memberstack JWT validation with role-based access
- **validation.js**: Zod schemas + DOMPurify sanitization
- **rateLimit.js**: 100 req/min/IP with exponential backoff
- **cache.js**: Response caching with TTL management

### Services (backend/services/)
- **supabase.js**: Database operations with RLS enforcement
- **gpt4o.js**: OpenAI integration with prompt management
- **hume.js**: Emotional resonance validation with circuit breaker
- **stripe.js**: Payment processing with webhook handling
- **posthog.js**: Analytics tracking with event batching

## Version Control & Maintenance

### API Versioning
- **URL Versioning**: `/v1/` prefix for all endpoints
- **Backward Compatibility**: 12-month minimum support
- **Deprecation Process**: 90-day notice with migration guides
- **Feature Flags**: Gradual rollout of new features

### Documentation Requirements
- **OpenAPI/Swagger**: Auto-generated API documentation
- **Cortex Updates**: Log all API changes in `.roo/rules/cortex.md`
- **Change Management**: Version control with tagged releases
- **Testing Updates**: Keep test coverage >90% for all changes

## Success Metrics & KPIs

### Performance Targets (PRD Section 7.1)
- **Critical Endpoints**: <200ms (auth, validation, status)
- **Generation Endpoints**: <2000ms (deliverables, sparks)
- **Interactive Endpoints**: <500ms (funnel, auto-save)
- **Error Responses**: <100ms with clear messaging

### Business Metrics (PRD Section 12)
- **Trust Score**: ≥85 average across all funnel validations
- **Spark Selection**: >80% users select at least one spark
- **Purchase Conversion**: >90% checkout completion rate
- **TrustDelta**: ≥4.0/5.0 in SparkSplit comparisons
- **Emotional Resonance**: >0.7 across all generated content
- **User Satisfaction**: >70% positive feedback ratings

## Update Requirements

### Cortex Integration
- **Change Logging**: Update `.roo/rules/cortex.md` for all significant API changes
- **Milestone Tracking**: Record implementation progress with timestamps
- **PRD Alignment**: Verify all changes align with PRD requirements

### Continuous Improvement
- **Performance Monitoring**: Regular optimization based on metrics
- **User Feedback**: API improvements based on user journey analytics
- **A/B Testing**: Feature flag implementation for gradual rollouts
- **Security Updates**: Regular security audits and vulnerability patching

## Validation & CI/CD

### API Validation
- CI/CD enforces OpenAPI compliance via `.github/workflows/api.yml`
- Locust tests verify <200ms latency for 10k users (`backend/tests/load.test.js`)
- OWASP ZAP scans for vulnerabilities (`.github/workflows/security.yml`)
- PostHog tracks `api_latency`, `rate_limit_triggered`, `spark_generation_time`

## References
- **PRD Sections**: 6 (Functional Requirements), 7 (Performance), 8.7 (API Catalog), 12 (Success Metrics)
- **Project Structure**: `backend/routes/`, `backend/middleware/`, `backend/services/`
- **API Contract**: Complete endpoint specifications with schemas and examples  
- **Performance Requirements**: <200ms critical, <2s generation, <100ms errors

---

**Version**: 4.0.0 - Complete 25+ Endpoint Coverage & PRD Alignment
**Last Updated**: Current Date
**Coverage**: All 25+ endpoints across complete 9-stage user journey (F1-F9)
**Compliance**: PRD performance targets, security requirements, business metrics
**Owner**: API Development Team



**Stakeholders**: Product, Engineering, QA, DevOps