---
description: 
globs: 
alwaysApply: true
---
# CanAI User Journey Rules

## Purpose
Optimize the 9-stage user journey for >80% spark selection, TrustDelta ≥4.2, and emotional resonance >0.7, delivering emotionally sovereign AI solutions through a carefully orchestrated experience that builds trust, demonstrates value, and drives conversion.

## Standards

### Journey Mapping
- **9-Stage Architecture**: Implement all stages in `frontend/src/pages/` with corresponding backend APIs in `backend/routes/`
- **Stage Flow**: F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 (Discovery Hook → Feedback Capture)
- **Component Organization**: Feature-based structure in `frontend/src/components/{StageName}/`
- **API Versioning**: Use `/v1/` prefix for all endpoints with consistent RESTful patterns

### Success Metrics & Analytics
- **Funnel Tracking**: Monitor completion rates with `funnel_step` events via PostHog
- **Performance Targets**: 
  - Discovery Hook click-through >75%
  - Funnel completion >90% 
  - Spark selection >80%
  - Purchase conversion >90%
  - TrustDelta ≥4.2/5.0
  - Emotional resonance >0.7
  - Feedback response >70%
- **Analytics Implementation**: Track all interactions via `frontend/src/utils/analytics.ts` with PostHog integration

### UX Constraints & Performance
- **Checkout Limit**: ≤3 steps (SparkLayer → PurchaseFlow → Confirmation)
- **Auto-Save**: Every 10s to `databases/prompt_logs` with localStorage fallback
- **Response Times**: 
  - Page load <1.5s
  - Spark generation <1.5s
  - Deliverable generation <2s
  - Auto-save <200ms
  - Error responses <100ms
- **Tooltips**: Industry-specific based on `businessType` via `/v1/generate-tooltip`

### Accessibility & Compliance
- **WCAG 2.2 AA**: ARIA labels, ≥4.5:1 contrast, ≥48px tap targets
- **Screen Reader**: Full VoiceOver compatibility
- **Keyboard Navigation**: Complete keyboard-only operation
- **Error Announcements**: Use `useAccessibility` hook for screen reader feedback

## Detailed Stage Implementation

### F1: Discovery Hook
**Purpose**: Capture attention and establish trust through compelling value proposition

**Frontend Implementation**:
- **Page**: `frontend/src/pages/DiscoveryHook.tsx`
- **Components**: 
  - `frontend/src/components/DiscoveryHook/Hero.tsx` - Main hero section
  - `frontend/src/components/DiscoveryHook/TrustIndicatorsSection.tsx` - Social proof
  - `frontend/src/components/DiscoveryHook/ProductCardsSection.tsx` - Product showcase
  - `frontend/src/components/DiscoveryHook/CTAButtons.tsx` - Primary actions
  - `frontend/src/components/DiscoveryHook/PsychologicalTrustIndicators.tsx` - Trust building
- **Key Elements**:
  - Trust indicators with cache (TTL: 5min) via `localStorage`
  - Product cards with pricing from `/v1/pricing`
  - Sample previews with emotional hooks
  - Accessibility-compliant buttons (≥48px)

**Backend Implementation**:
- **API**: `GET /v1/messages` in `backend/routes/messages.js`
- **Response**: Trust indicators, testimonials, sample previews
- **Logging**: `POST /v1/log-interaction` to `databases/session_logs`
- **Caching**: `backend/services/cache.js` (TTL: 5min)

**Analytics & Tracking**:
```typescript
// Required PostHog events
posthog.capture('f1_discovery_hook_viewed', {
  user_id: string,
  session_id: string,
  funnel_stage: 'F1',
  page_load_time_ms: number,
  intent?: 'secure_funding'|'grow_customers'|'improve_operations'
});

posthog.capture('pricing_modal_viewed', {
  product_viewed: 'business_builder'|'social_email'|'site_audit',
  modal_open_time_ms: number
});

posthog.capture('product_card_clicked', {
  product: 'business_builder'|'social_email'|'site_audit',
  card_position: number
});
```

**Success Metrics**:
- Click-through rate >75%
- Page load time <1.5s
- Modal engagement >50%
- Trust indicator views >60%

**Error Handling**:
- API timeout fallback to cached content
- Graceful degradation for missing trust indicators
- Loading states with progress indicators

### F2: 2-Step Discovery Funnel
**Purpose**: Capture essential inputs with minimal friction while building trust score

**Frontend Implementation**:
- **Page**: `frontend/src/pages/DiscoveryFunnel.tsx`
- **Components**: Two-step form with validation and progress indicators
- **Features**:
  - Auto-save every 10s with debouncing via `useFormValidation` hook
  - Real-time trust score display
  - Dynamic tooltips from `/v1/generate-tooltip`
  - Contradiction detection with user-friendly messaging
  - Progress indicators showing completion status

**Backend Implementation**:
- **APIs**:
  - `POST /v1/validate-input` in `backend/routes/validation.js`
  - `POST /v1/generate-tooltip` for contextual help
  - `POST /v1/detect-contradiction` for input validation
- **Storage**: `databases/initial_prompt_logs` table
- **AI Integration**: GPT-4o for trust score, Hume AI for emotional resonance
- **Validation**: DOMPurify sanitization, Joi schema validation

**Input Schema**:
```typescript
interface DiscoveryFunnelInput {
  businessType: 'retail' | 'service' | 'tech' | 'nonprofit' | 'other';
  otherType?: string;
  primaryChallenge: 'Low online visibility' | 'Need funding' | 'Poor performance' | 'Other';
  preferredTone: 'warm' | 'bold' | 'optimistic' | 'professional' | 'playful' | 'inspirational' | 'custom';
  customTone?: string;
  desiredOutcome: 'secure_funding' | 'grow_customers' | 'improve_operations' | 'boost_online_presence';
}
```

**Analytics & Tracking**:
```typescript
posthog.capture('f2_discovery_funnel_started', {
  funnel_stage: 'F2',
  step: 1|2,
  form_completion_time_ms: number
});

posthog.capture('trust_score_generated', {
  trust_score: number, // 0-100
  score_factors: {
    completeness: number,
    coherence: number,
    emotional_alignment: number
  }
});

posthog.capture('contradiction_flagged', {
  reason: 'tone_goal_mismatch'|'business_type_challenge_mismatch',
  resolution_action: 'user_clarified'|'user_ignored'
});
```

**Success Metrics**:
- Funnel completion >90%
- Form completion time ≤30s
- Trust score average >80
- Contradiction resolution >85%

### F3: Spark Layer
**Purpose**: Generate emotionally resonant concept names to inspire purchase intent

**Frontend Implementation**:
- **Page**: `frontend/src/pages/SparkLayer.tsx`
- **Features**:
  - Three spark cards with selection interface
  - Regeneration button with attempt tracking
  - Edge toggle for SparkSplit preview
  - Feedback collection for regeneration improvements
  - Visual trust score integration

**Backend Implementation**:
- **APIs**:
  - `POST /v1/generate-sparks` in `backend/routes/sparks.js`
  - `POST /v1/regenerate-sparks` with attempt limits
- **Logic**: 
  - 3 attempts standard, 4 if trust score <50%
  - GPT-4o integration with emotional drivers
  - Prompt templates in `backend/prompts/sparks.js`
- **Storage**: `databases/spark_logs` with selection tracking

**Analytics & Tracking**:
```typescript
posthog.capture('spark_selected', {
  spark_id: string,
  product: 'business_builder'|'social_email'|'site_audit',
  selection_time_ms: number,
  retry_count: number,
  spark_position: 1|2|3
});

posthog.capture('sparks_regenerated', {
  attempt_count: number,
  trust_score: number,
  regeneration_reason: 'not_satisfied'|'trust_score_low'|'want_more_options'
});
```

**Success Metrics**:
- Spark selection >80%
- Regeneration rate <20%
- Average regeneration attempts <2
- Generation time <1.5s

### F4: Purchase Flow
**Purpose**: Secure payment processing with transparent pricing and smooth UX

**Frontend Implementation**:
- **Page**: `frontend/src/pages/PurchaseFlow.tsx`
- **Components**:
  - `frontend/src/components/PurchaseFlow/CheckoutModal.tsx`
  - `frontend/src/components/PurchaseFlow/PricingTable.tsx`
  - `frontend/src/components/PurchaseFlow/ProductSwitchModal.tsx`
  - `frontend/src/components/PurchaseFlow/RefundPolicyModal.tsx`
- **Features**: Stripe integration, product switching, refund policy display

**Backend Implementation**:
- **APIs**:
  - `POST /v1/stripe-session` in `backend/routes/stripe.js`
  - `POST /v1/refund` for refund processing
  - `GET /v1/pricing` for dynamic pricing
- **Integration**: Make.com trigger via `add_project.json`
- **Security**: Stripe tokenization, no card storage, JWT verification

**Product Pricing**:
- Business Plan Builder: $99
- Social Media & Email Campaign: $49  
- Website Audit & Feedback: $79

**Analytics & Tracking**:
```typescript
posthog.capture('f4_purchase_flow_started', {
  product: 'business_builder'|'social_email'|'site_audit',
  price: number,
  payment_intent_created: boolean
});

posthog.capture('payment_completed', {
  product: string,
  amount: number,
  completion_time_ms: number,
  stripe_session_id: string
});
```

**Success Metrics**:
- Checkout completion >90%
- Payment failure recovery >85%
- Refund rate <5%
- Checkout time <1s

### F5: Detailed Input Collection
**Purpose**: Gather comprehensive 12-field inputs for personalized deliverable generation

**Frontend Implementation**:
- **Page**: `frontend/src/pages/DetailedInput.tsx`
- **Components**:
  - `frontend/src/components/DetailedInput/StepOneForm.tsx`
  - `frontend/src/components/DetailedInput/StepTwoForm.tsx`
  - `frontend/src/components/DetailedInput/AutoSaveIndicator.tsx`
- **Features**: Multi-step form, auto-save, progress tracking, tooltips

**12-Field Input Schema**:
```typescript
interface DetailedInputs {
  businessName: string;
  targetAudience: string;
  primaryGoal: 'funding' | 'growth' | 'ops' | 'online';
  competitiveContext: string;
  brandVoice: string;
  resourceConstraints: string;
  currentStatus: string;
  businessDescription: string;
  contentSource?: string; // For website audits
  auditScope?: string; // For website audits
  location: string;
  uniqueValue: string;
}
```

**Backend Implementation**:
- **API**: `POST /v1/save-progress` in `backend/routes/inputs.js`
- **Storage**: `databases/prompt_logs` with RLS policies
- **Features**: Auto-save with debouncing, input validation, tooltip generation

**Analytics & Tracking**:
```typescript
posthog.capture('f5_detailed_input_started', {
  funnel_stage: 'F5',
  product_type: string,
  step: number
});

posthog.capture('auto_save_triggered', {
  field_count: number,
  save_latency_ms: number
});
```

**Success Metrics**:
- Form completion >85%
- Auto-save success >98%
- Save latency <200ms
- Tooltip engagement >40%

### F6: Intent Mirror
**Purpose**: Validate and summarize user inputs with confidence scoring

**Frontend Implementation**:
- **Page**: `frontend/src/pages/IntentMirror.tsx`
- **Components**:
  - `frontend/src/components/IntentMirror/SummaryCard.tsx`
  - `frontend/src/components/IntentMirror/EditModal.tsx`
- **Features**: Summary display, edit capabilities, confidence visualization

**Backend Implementation**:
- **API**: `POST /v1/intent-mirror` in `backend/routes/intent.js`
- **AI Integration**: GPT-4o for summary generation and confidence scoring
- **Logic**: Flag low confidence (<0.8) for clarification
- **Storage**: Updated `databases/prompt_logs` with summary and confidence

**Analytics & Tracking**:
```typescript
posthog.capture('intent_mirror_confirmed', {
  confidence_score: number,
  confirmation_time_ms: number,
  edits_made: number
});

posthog.capture('clarifying_questions_answered', {
  questions_count: number,
  confidence_improvement: number
});
```

**Success Metrics**:
- Intent confirmation >85%
- Low confidence resolution >80%
- Average confidence >0.85
- Edit rate <15%

### F7: Deliverable Generation
**Purpose**: Generate final AI-driven outputs with quality validation

**Frontend Implementation**:
- **Page**: `frontend/src/pages/DeliverableGeneration.tsx`
- **Features**: Progress tracking, revision requests, quality indicators

**Backend Implementation**:
- **API**: `POST /v1/request-revision` in `backend/routes/revision.js`
- **AI Integration**: GPT-4o for content generation, Hume AI for emotional validation
- **Word Count Targets**:
  - Business Plan Builder: 700-800 words
  - Social Media & Email: 300-400 words  
  - Website Audit: 300-400 words + 120-word recommendations
- **Storage**: `databases/comparisons` with quality metrics

**Analytics & Tracking**:
```typescript
posthog.capture('deliverable_generated', {
  product_type: 'business_builder'|'social_email'|'site_audit',
  completion_time_ms: number,
  output_word_count: number,
  emotional_resonance_score: number,
  quality_metrics: {
    coherence: number,
    completeness: number,
    personalization: number
  }
});
```

**Success Metrics**:
- Generation time <2s
- Deliverable access >85%
- Revision rate <10%
- Word count accuracy >95%

### F8: SparkSplit
**Purpose**: Demonstrate CanAI's superiority through side-by-side comparison

**Frontend Implementation**:
- **Page**: `frontend/src/pages/SparkSplit.tsx`
- **Components**:
  - `frontend/src/components/SparkSplit/RefinedComparisonContainer.tsx`
  - `frontend/src/components/SparkSplit/TrustDeltaDisplay.tsx`
  - `frontend/src/components/SparkSplit/EmotionalResonanceDisplay.tsx`
  - `frontend/src/components/SparkSplit/EmotionalCompass.tsx`
  - `frontend/src/components/SparkSplit/TrustDeltaStars.tsx`

**Backend Implementation**:
- **API**: `POST /v1/spark-split` in `backend/routes/sparksplit.js`
- **Logic**: Generate dual outputs (CanAI vs Generic) with distinct prompts
- **Metrics**: TrustDelta calculation, emotional resonance comparison
- **Target**: TrustDelta ≥4.0/5.0, emotional resonance delta >0.3

**TrustDelta Calculation**:
- Tone alignment (50%)
- Emotional impact (30%) 
- Cultural specificity (20%)

**Analytics & Tracking**:
```typescript
posthog.capture('plan_compared', {
  trust_delta: number,
  selected: 'canai'|'generic',
  emotional_resonance: {
    canai_score: number,
    generic_score: number,
    delta: number
  },
  comparison_duration_ms: number
});

posthog.capture('emotional_compass_interacted', {
  interaction_type: 'hover'|'click'|'explore',
  emotion_viewed: string,
  engagement_time_ms: number
});
```

**Success Metrics**:
- CanAI preference >65%
- TrustDelta average ≥4.2
- Emotional resonance delta >0.3
- Comparison time <1.5s

### F9: Feedback Capture
**Purpose**: Collect user feedback and enable social sharing

**Frontend Implementation**:
- **Page**: `frontend/src/pages/Feedback.tsx`
- **Components**:
  - `frontend/src/components/feedback/StarRating.tsx`
  - `frontend/src/components/feedback/EnhancedSocialShare.tsx`
  - `frontend/src/components/feedback/EnhancedReferral.tsx`
  - `frontend/src/components/feedback/SuccessAnimation.tsx`

**Backend Implementation**:
- **API**: `POST /v1/feedback` in `backend/routes/feedback.js`
- **Features**: Rating collection, sentiment analysis, follow-up automation
- **Integration**: Make.com triggers for follow-up emails
- **Storage**: `databases/feedback_logs` with sentiment scoring

**Analytics & Tracking**:
```typescript
posthog.capture('feedback_submitted', {
  rating: number, // 1-5
  sentiment: 'positive'|'neutral'|'negative',
  feedback_categories: string[],
  shared: string[], // platforms
  submission_time_ms: number
});

posthog.capture('referral_shared', {
  platform: 'email'|'facebook'|'twitter'|'linkedin',
  referral_code: string
});
```

**Success Metrics**:
- Feedback response >70%
- Average rating >4.0/5.0
- Social sharing >25%
- Referral sharing >15%

## Cross-Stage Implementation

### Data Flow & State Management
- **React Context**: Share user data across stages via `UserJourneyContext`
- **Supabase Persistence**: Store progress in `databases/prompt_logs` with RLS
- **LocalStorage Fallback**: Maintain state during API failures
- **Progress Tracking**: Visual indicators showing journey completion

### Authentication & Security
- **Memberstack Integration**: JWT verification for stages F4-F9
- **Row-Level Security**: Supabase RLS policies for data protection
- **Input Sanitization**: DOMPurify for all user inputs
- **Rate Limiting**: 100 req/min/IP via `backend/middleware/rateLimit.js`

### Error Handling & Recovery
- **Error Boundaries**: `frontend/src/components/ErrorBoundary.tsx`
- **Graceful Degradation**: Fallback content for API failures
- **User-Friendly Messages**: Contextual error messaging
- **Recovery Flows**: Automatic retry with exponential backoff
- **Error Logging**: Sentry integration with PostHog tracking

### Performance Optimization
- **React.memo**: Prevent unnecessary re-renders
- **Lazy Loading**: Dynamic imports for non-critical components
- **Caching**: API response caching with appropriate TTLs
- **Bundle Optimization**: Code splitting by route
- **Image Optimization**: Lazy loading and responsive images

### Testing & Quality Assurance
- **Unit Tests**: >80% coverage with Jest (`frontend/tests/`, `backend/tests/`)
- **Integration Tests**: End-to-end journey validation
- **Accessibility Tests**: axe-core and VoiceOver compatibility
- **Load Testing**: 10,000 concurrent users with <2s response
- **A/B Testing**: Feature flags for optimization

## Validation & Monitoring

### CI/CD Pipeline
- **Automated Testing**: Unit, integration, and accessibility tests
- **Performance Monitoring**: Real-time latency tracking
- **Error Tracking**: Sentry for production issues
- **Analytics Validation**: PostHog event consistency checks

### Success Criteria
- **Funnel Completion**: >90% across all stages
- **Performance**: <2s response times, <100ms error responses
- **Quality**: TrustDelta ≥4.2, emotional resonance >0.7
- **User Satisfaction**: >70% positive feedback, >65% CanAI preference

### Continuous Improvement
- **User Feedback Integration**: Regular analysis of feedback patterns
- **Performance Optimization**: Ongoing latency improvements
- **A/B Testing**: Continuous optimization of conversion rates
- **Feature Enhancement**: Data-driven feature development

## References
- PRD Sections: 5 (User Journey), 6.1-6.9 (Functional Requirements), 12 (Success Metrics)
- Project Structure: `frontend/src/pages/`, `frontend/src/components/`, `backend/routes/`
- Analytics: PostHog event tracking, emotional resonance validation
- Performance: <2s generation, <1.5s sparks, <200ms auto-save targets


