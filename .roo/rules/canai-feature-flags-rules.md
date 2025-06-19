---
description: 
globs: 
alwaysApply: true
---
# CanAI Feature Flags Rules

## Role and Expertise
You are a feature flags expert for the **CanAI Emotional Sovereignty Platform**, responsible for implementing safe, controlled rollouts, A/B testing, and experimentation across the 9-stage user journey (F1-F9). Your expertise covers PostHog feature flag integration, progressive rollouts, user segmentation, analytics tracking, and business metric optimization aligned with emotional sovereignty principles and PRD requirements.

## Purpose
Manage feature flags for safe, controlled rollouts and A/B testing to optimize user experience, conversion rates, and emotional resonance while maintaining platform stability and achieving PRD targets (TrustDelta ≥4.2, >65% CanAI preference, <2s response times).

## Architecture Overview
Feature flags operate across multiple integrated layers:

### Frontend Layer
- **React Hooks**: `frontend/src/hooks/useFeatureFlags.ts` for component-level flag evaluation
- **Utility Functions**: `frontend/src/utils/featureFlags.ts` for flag logic and caching
- **Component Integration**: Flag-aware components in `frontend/src/components/` and `frontend/src/pages/`
- **Local Storage**: Client-side flag caching for performance optimization

### Backend Layer
- **Middleware**: `backend/middleware/featureFlags.js` for server-side flag evaluation
- **Service Layer**: `backend/services/posthog.js` for PostHog integration and flag management
- **Configuration**: `backend/configs/flags.js` for flag definitions and default states
- **API Integration**: Flag evaluation in route handlers across `backend/routes/`

### Analytics & Monitoring Layer
- **PostHog Integration**: Feature flag events, A/B test tracking, and conversion analytics
- **Performance Monitoring**: Flag impact on response times and user experience metrics
- **Business Metrics**: Conversion rate optimization, trust score improvements, emotional resonance tracking
- **User Segmentation**: Memberstack ID-based targeting and progressive rollouts

## Feature Flag Standards

### Naming Conventions
- **Format**: Use kebab-case for all flag names (e.g., `pricing-modal-layout`, `spark-tone-variant`)
- **Structure**: `{stage}-{feature}-{variant}` pattern where applicable
- **Examples**:
  - `f1-pricing-modal-layout` (Discovery Hook pricing modal variants)
  - `f3-spark-tone-generation` (Spark Layer tone testing)
  - `f7-deliverable-streaming` (Deliverable Generation streaming UI)

### Default State Policy
- **Safety First**: All flags default to `false` or `control` variant
- **Gradual Rollout**: Start with 0% rollout, gradually increase based on metrics
- **Kill Switches**: Implement emergency disable capability for critical features
- **Documentation**: Document flag purpose, variants, and success criteria

### Ownership & Lifecycle
- **Team Assignment**: Assign flags to frontend or backend teams based on implementation scope
- **Lifecycle Stages**: Create → Test → Ramp → Evaluate → Remove/Permanent
- **Cleanup**: Remove flags after 30 days of 100% rollout or permanent decision
- **Communication**: Notify stakeholders via GitHub issues for major flag changes

## Stage-Specific Feature Flag Implementation

### F1: Discovery Hook Feature Flags

#### `f1-pricing-modal-layout`
```typescript
// Purpose: Test different pricing presentation layouts
// Variants: compact | detailed | simplified
// Target: Optimize conversion to purchase flow
// Metrics: Modal engagement time, click-through rate, pricing clarity

// Implementation in frontend/src/components/DiscoveryHook/PricingModal.tsx
const { getFeatureFlag } = useFeatureFlags();
const modalLayout = getFeatureFlag('f1-pricing-modal-layout', 'compact');

const handleModalView = () => {
  posthog.capture('pricing_modal_viewed', {
    layout: modalLayout,
    user_segment: userSegment,
    timestamp: Date.now()
  });
};

// Backend flag configuration
const flagConfig = {
  'f1-pricing-modal-layout': {
    variants: ['compact', 'detailed', 'simplified'],
    defaultVariant: 'compact',
    rolloutPercentage: 0,
    targetingRules: {
      segments: ['new_users', 'returning_users'],
      properties: { user_type: 'early_stage_founder' }
    }
  }
};
```

#### `f1-trust-indicators-position`
```typescript
// Purpose: Optimize placement of testimonials and trust signals
// Variants: hero_integrated | dedicated_section | floating_badges
// Target: Increase trust and time on page
// Metrics: Trust indicator interaction rate, funnel progression

// Implementation in frontend/src/components/DiscoveryHook/TrustIndicatorsSection.tsx
const trustPosition = getFeatureFlag('f1-trust-indicators-position', 'hero_integrated');

const renderTrustIndicators = () => {
  switch(trustPosition) {
    case 'dedicated_section':
      return <DedicatedTrustSection />;
    case 'floating_badges':
      return <FloatingTrustBadges />;
    default:
      return <HeroIntegratedTrust />;
  }
};
```

#### `f1-product-cards-style`
```typescript
// Purpose: Test different product presentation styles
// Variants: horizontal | vertical | carousel
// Target: Optimize product selection and mobile experience
// Metrics: Card interaction rate, product selection distribution

// Implementation with WCAG compliance (≥48px tap targets)
const cardStyle = getFeatureFlag('f1-product-cards-style', 'horizontal');

const ProductCardsSection = () => {
  const cardProps = {
    style: cardStyle,
    minTapTarget: '48px', // WCAG 2.2 AA compliance
    onCardClick: (product) => {
      posthog.capture('product_card_clicked', {
        product,
        card_style: cardStyle,
        position: getCardPosition(product)
      });
    }
  };

  return <ProductCards {...cardProps} />;
};
```

### F2: 2-Step Discovery Funnel Feature Flags

#### `f2-tooltip-display-strategy`
```typescript
// Purpose: Optimize tooltip presentation for user guidance
// Variants: on_hover | progressive_disclosure | contextual_help | disabled
// Target: Improve form completion and reduce field errors
// Metrics: Tooltip interaction rate, form completion time, error rates

// Implementation in frontend/src/components/DetailedInput/TooltipProvider.tsx
const tooltipStrategy = getFeatureFlag('f2-tooltip-display-strategy', 'on_hover');

const TooltipProvider = ({ field, children }) => {
  const renderTooltip = () => {
    switch(tooltipStrategy) {
      case 'progressive_disclosure':
        return <ProgressiveTooltip field={field} onView={trackTooltipView} />;
      case 'contextual_help':
        return <ContextualHelp field={field} onExpand={trackHelpExpansion} />;
      case 'disabled':
        return null;
      default:
        return <HoverTooltip field={field} onHover={trackTooltipHover} />;
    }
  };

  const trackTooltipView = () => {
    posthog.capture('tooltip_viewed', {
      field,
      strategy: tooltipStrategy,
      user_progress: getUserProgress()
    });
  };

  return (
    <div className="tooltip-container">
      {children}
      {renderTooltip()}
    </div>
  );
};
```

#### `f2-contradiction-handling-ui`
```typescript
// Purpose: Test different approaches to handling input contradictions
// Variants: inline_warnings | summary_modal | guided_resolution
// Target: Improve contradiction resolution and trust scores
// Metrics: Resolution rate, user satisfaction, trust score improvement

// Implementation in frontend/src/hooks/useFormValidation.ts
const contradictionUI = getFeatureFlag('f2-contradiction-handling-ui', 'inline_warnings');

const useContradictionHandler = () => {
  const handleContradiction = (contradictions) => {
    posthog.capture('contradiction_flagged', {
      contradiction_count: contradictions.length,
      ui_variant: contradictionUI,
      resolution_method: contradictionUI
    });

    switch(contradictionUI) {
      case 'summary_modal':
        return showContradictionModal(contradictions);
      case 'guided_resolution':
        return startGuidedResolution(contradictions);
      default:
        return showInlineWarnings(contradictions);
    }
  };

  return { handleContradiction };
};
```

### F3: Spark Layer Feature Flags

#### `f3-spark-tone-generation`
```typescript
// Purpose: Test different emotional tone approaches in spark generation
// Variants: warm | bold | optimistic | professional | playful | inspirational | adaptive
// Target: Optimize spark selection rate (>80%) and emotional resonance
// Metrics: Selection rate, regeneration requests, emotional resonance scores

// Backend implementation in backend/routes/sparks.js
const generateSparksWithTone = async (req, res) => {
  const userId = req.user.id;
  const toneVariant = await getFeatureFlag(userId, 'f3-spark-tone-generation', 'warm');
  
  const sparkPrompt = buildSparkPrompt({
    inputs: req.body,
    tone: toneVariant,
    emotionalDrivers: getEmotionalDrivers(req.body)
  });

  try {
    const sparks = await gpt4oService.generateSparks(sparkPrompt);
    const resonanceScore = await humeService.analyzeResonance(sparks);

    // Track tone effectiveness
    await posthog.capture('spark_tone_tested', {
      user_id: userId,
      tone_variant: toneVariant,
      resonance_score: resonanceScore,
      generation_time: Date.now() - req.startTime
    });

    res.json({
      sparks,
      tone: toneVariant,
      resonance_score: resonanceScore
    });
  } catch (error) {
    await handleSparkGenerationError(error, { userId, toneVariant });
    res.status(500).json({ error: 'Spark generation failed' });
  }
};
```

#### `f3-regeneration-limits`
```typescript
// Purpose: Test different regeneration limit strategies
// Variants: trust_based | unlimited | progressive | feedback_gated
// Target: Balance user satisfaction with resource usage
// Metrics: User satisfaction, completion rate, resource utilization

// Implementation in backend/middleware/rateLimit.js
const getRegenerationLimit = async (userId, trustScore) => {
  const limitStrategy = await getFeatureFlag(userId, 'f3-regeneration-limits', 'trust_based');
  
  switch(limitStrategy) {
    case 'trust_based':
      return trustScore < 50 ? 4 : 3; // PRD requirement
    case 'unlimited':
      return Infinity;
    case 'progressive':
      return getProgressiveLimit(userId);
    case 'feedback_gated':
      return getFeedbackGatedLimit(userId);
    default:
      return 3;
  }
};
```

### F4: Purchase Flow Feature Flags

#### `f4-checkout-flow-variant`
```typescript
// Purpose: Streamline payment process for different user segments
// Variants: single_step | progressive | express
// Target: Optimize checkout completion rate (>90%)
// Metrics: Completion rate, payment processing time, user satisfaction

// Implementation in frontend/src/components/PurchaseFlow/CheckoutModal.tsx
const CheckoutFlow = ({ product, user }) => {
  const flowVariant = getFeatureFlag('f4-checkout-flow-variant', 'single_step');
  
  const handleCheckoutStart = () => {
    posthog.capture('checkout_started', {
      product,
      flow_variant: flowVariant,
      user_segment: getUserSegment(user)
    });
  };

  const renderCheckoutFlow = () => {
    switch(flowVariant) {
      case 'progressive':
        return <ProgressiveCheckout onStep={trackCheckoutStep} />;
      case 'express':
        return <ExpressCheckout onComplete={trackExpressComplete} />;
      default:
        return <SingleStepCheckout onSubmit={trackCheckoutSubmit} />;
    }
  };

  return (
    <div className="checkout-container">
      {renderCheckoutFlow()}
    </div>
  );
};
```

### F5: Detailed Input Collection Feature Flags

#### `f5-auto-save-interval`
```typescript
// Purpose: Optimize auto-save frequency for UX and performance
// Variants: frequent | standard | conservative | adaptive
// Target: Balance data safety with performance (<100ms save time)
// Metrics: Save success rate, user satisfaction, performance impact

// Implementation in frontend/src/hooks/useAutoSave.ts
const useAutoSave = (data, onSave) => {
  const saveInterval = getFeatureFlag('f5-auto-save-interval', 'standard');
  
  const intervals = {
    frequent: 5000,    // 5 seconds
    standard: 10000,   // 10 seconds (PRD default)
    conservative: 30000, // 30 seconds
    adaptive: getAdaptiveInterval(data) // Based on user behavior
  };

  const debouncedSave = useMemo(
    () => debounce(onSave, intervals[saveInterval]),
    [saveInterval, onSave]
  );

  useEffect(() => {
    debouncedSave(data);
    
    // Track save events
    posthog.capture('auto_save_triggered', {
      interval: intervals[saveInterval],
      data_size: JSON.stringify(data).length,
      variant: saveInterval
    });
  }, [data, debouncedSave]);
};
```

### F6: Intent Mirror Feature Flags

#### `f6-confidence-threshold`
```typescript
// Purpose: Test different confidence thresholds for clarification
// Variants: strict | standard | lenient | adaptive
// Target: Optimize clarification requests vs user friction
// Metrics: Clarification rate, user satisfaction, final confidence scores

// Implementation in backend/services/gpt4o.js
const getConfidenceThreshold = async (userId) => {
  const thresholdVariant = await getFeatureFlag(userId, 'f6-confidence-threshold', 'standard');
  
  const thresholds = {
    strict: 0.9,    // Higher bar, more clarifications
    standard: 0.8,  // PRD default
    lenient: 0.7,   // Lower bar, fewer clarifications
    adaptive: await getAdaptiveThreshold(userId) // Based on user history
  };

  return thresholds[thresholdVariant];
};
```

### F7: Deliverable Generation Feature Flags

#### `f7-generation-streaming`
```typescript
// Purpose: Test streaming vs batch deliverable generation
// Variants: streaming | batch | hybrid
// Target: Improve perceived performance and user engagement
// Metrics: User engagement during generation, completion rates, satisfaction

// Implementation in frontend/src/pages/DeliverableGeneration.tsx
const DeliverableGeneration = () => {
  const generationMode = getFeatureFlag('f7-generation-streaming', 'batch');
  
  const handleGeneration = async () => {
    posthog.capture('deliverable_generation_started', {
      mode: generationMode,
      estimated_time: getEstimatedTime(generationMode)
    });

    switch(generationMode) {
      case 'streaming':
        return streamDeliverableGeneration();
      case 'hybrid':
        return hybridDeliverableGeneration();
      default:
        return batchDeliverableGeneration();
    }
  };

  return (
    <div className="generation-container">
      <GenerationProgress mode={generationMode} />
      <GenerationOutput mode={generationMode} />
    </div>
  );
};
```

### F8: SparkSplit Feature Flags

#### `f8-comparison-layout`
```typescript
// Purpose: Test different comparison presentation layouts
// Variants: side_by_side | tabbed | overlay | animated
// Target: Maximize CanAI preference (>65%) and TrustDelta visibility
// Metrics: CanAI preference rate, time spent comparing, TrustDelta comprehension

// Implementation in frontend/src/components/SparkSplit/ComparisonContainer.tsx
const ComparisonContainer = ({ canaiOutput, genericOutput, trustDelta }) => {
  const layoutVariant = getFeatureFlag('f8-comparison-layout', 'side_by_side');
  
  const handleComparisonView = () => {
    posthog.capture('plan_compared', {
      layout: layoutVariant,
      trustDelta,
      viewing_time: 0 // Will be updated on interaction
    });
  };

  const renderComparison = () => {
    switch(layoutVariant) {
      case 'tabbed':
        return <TabbedComparison onSwitch={trackTabSwitch} />;
      case 'overlay':
        return <OverlayComparison onToggle={trackOverlayToggle} />;
      case 'animated':
        return <AnimatedComparison onTransition={trackTransition} />;
      default:
        return <SideBySideComparison onScroll={trackScrollBehavior} />;
    }
  };

  return (
    <div className="comparison-container" onLoad={handleComparisonView}>
      <TrustDeltaDisplay score={trustDelta} layout={layoutVariant} />
      {renderComparison()}
    </div>
  );
};
```

### F9: Feedback Capture Feature Flags

#### `f9-feedback-flow-variant`
```typescript
// Purpose: Test different feedback collection approaches
// Variants: immediate | delayed | contextual | progressive
// Target: Maximize feedback submission rate and quality
// Metrics: Submission rate, feedback quality scores, user satisfaction

// Implementation in frontend/src/pages/Feedback.tsx
const FeedbackCapture = ({ deliverableData }) => {
  const flowVariant = getFeatureFlag('f9-feedback-flow-variant', 'immediate');
  
  const initializeFeedbackFlow = () => {
    posthog.capture('feedback_flow_started', {
      variant: flowVariant,
      deliverable_type: deliverableData.type
    });

    switch(flowVariant) {
      case 'delayed':
        return scheduleDelayedFeedback();
      case 'contextual':
        return showContextualFeedback();
      case 'progressive':
        return startProgressiveFeedback();
      default:
        return showImmediateFeedback();
    }
  };

  return (
    <FeedbackContainer 
      variant={flowVariant}
      onSubmit={handleFeedbackSubmit}
      onSkip={handleFeedbackSkip}
    />
  );
};
```

## Advanced Feature Flag Patterns

### Kill Switches for Critical Features
```typescript
// Emergency disable capability for critical features
const KILL_SWITCHES = {
  'kill-voice-mode': {
    description: 'Emergency disable for voice input feature',
    affectedFlags: ['f2-voice-input', 'f5-voice-tooltips'],
    defaultState: false,
    escalationLevel: 'critical'
  },
  'kill-ai-generation': {
    description: 'Emergency disable for AI-powered generation',
    affectedFlags: ['f3-spark-generation', 'f7-deliverable-generation'],
    defaultState: false,
    escalationLevel: 'critical'
  }
};

// Implementation in backend/middleware/killSwitch.js
const checkKillSwitches = async (req, res, next) => {
  const activeKillSwitches = await getActiveKillSwitches();
  
  for (const killSwitch of activeKillSwitches) {
    if (killSwitch.affectedRoutes.includes(req.route.path)) {
      await posthog.capture('kill_switch_triggered', {
        switch_name: killSwitch.name,
        route: req.route.path,
        user_id: req.user?.id
      });
      
      return res.status(503).json({
        error: 'Feature temporarily unavailable',
        reason: 'maintenance'
      });
    }
  }
  
  next();
};
```

### User Segmentation for Targeted Rollouts
```typescript
// Advanced user segmentation for feature targeting
const getUserSegment = (user) => {
  const segments = [];
  
  // Demographic segmentation
  if (user.persona === 'early_stage_founder') segments.push('founders');
  if (user.persona === 'side_hustle_solopreneur') segments.push('solopreneurs');
  
  // Behavioral segmentation
  if (user.completedJourneys > 0) segments.push('returning_users');
  if (user.averageSessionTime > 600) segments.push('engaged_users');
  
  // Performance segmentation
  if (user.trustScoreAverage > 4.0) segments.push('high_trust');
  if (user.conversionRate > 0.8) segments.push('high_conversion');
  
  return segments;
};

// Segment-based flag evaluation
const getFeatureFlagForSegment = async (userId, flagName, defaultValue) => {
  const user = await getUserData(userId);
  const segments = getUserSegment(user);
  
  const flagConfig = await getFlagConfiguration(flagName);
  
  // Check segment-specific overrides
  for (const segment of segments) {
    if (flagConfig.segmentOverrides[segment]) {
      return flagConfig.segmentOverrides[segment];
    }
  }
  
  // Fall back to general rollout percentage
  return evaluateFlag(flagConfig, defaultValue);
};
```

### Prompt Versioning Integration
```typescript
// Integration with formal prompt versioning system for A/B testing
const getPromptVersion = async (userId, promptType) => {
  const promptFlag = `prompt-version-${promptType}`;
  const version = await getFeatureFlag(userId, promptFlag, 'v1.0');
  
  // Track prompt version usage
  await posthog.capture('prompt_version_used', {
    user_id: userId,
    prompt_type: promptType,
    version,
    timestamp: Date.now()
  });
  
  return loadPromptTemplate(promptType, version);
};

// Usage in backend/services/gpt4o.js
const generateWithVersionedPrompt = async (userId, inputs, promptType) => {
  const promptTemplate = await getPromptVersion(userId, promptType);
  const compiledPrompt = compilePrompt(promptTemplate, inputs);
  
  return await gpt4oService.generate(compiledPrompt);
};
```

## Flag Configuration Management

### Backend Configuration (`backend/configs/flags.js`)
```typescript
export const FEATURE_FLAGS = {
  // F1: Discovery Hook Flags
  'f1-pricing-modal-layout': {
    variants: ['compact', 'detailed', 'simplified'],
    defaultVariant: 'compact',
    rolloutPercentage: 0,
    owner: 'frontend',
    description: 'Test different pricing modal layouts for conversion optimization',
    successMetrics: ['modal_engagement_time', 'click_through_rate'],
    segmentTargeting: {
      'new_users': { rolloutPercentage: 25, variant: 'simplified' },
      'returning_users': { rolloutPercentage: 50, variant: 'detailed' }
    }
  },
  
  // F3: Spark Layer Flags
  'f3-spark-tone-generation': {
    variants: ['warm', 'bold', 'optimistic', 'professional', 'playful', 'inspirational', 'adaptive'],
    defaultVariant: 'warm',
    rolloutPercentage: 0,
    owner: 'backend',
    description: 'A/B test different emotional tones in spark generation',
    successMetrics: ['spark_selection_rate', 'emotional_resonance', 'regeneration_requests'],
    killSwitch: 'kill-ai-generation'
  },
  
  // Future Enhancement Flags (PRD Section 17)
  'voice-mode': {
    variants: ['enabled', 'disabled'],
    defaultVariant: 'disabled',
    rolloutPercentage: 0,
    owner: 'frontend',
    description: 'Voice input capability for 2-Step Discovery Funnel',
    successMetrics: ['voice_accuracy', 'completion_rate', 'user_satisfaction'],
    killSwitch: 'kill-voice-mode',
    prerequisites: ['browser_support_check', 'microphone_permission']
  }
};
```

### Frontend Hook Implementation (`frontend/src/hooks/useFeatureFlags.ts`)
```typescript
import { useEffect, useState } from 'react';
import { posthog } from '../utils/analytics';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        // Load from PostHog with fallback to localStorage cache
        const posthogFlags = posthog.getAllFlags();
        const cachedFlags = JSON.parse(localStorage.getItem('feature_flags') || '{}');
        
        const mergedFlags = { ...cachedFlags, ...posthogFlags };
        setFlags(mergedFlags);
        
        // Cache for offline usage
        localStorage.setItem('feature_flags', JSON.stringify(mergedFlags));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load feature flags:', error);
        // Fallback to cached flags
        const cachedFlags = JSON.parse(localStorage.getItem('feature_flags') || '{}');
        setFlags(cachedFlags);
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  const getFeatureFlag = (flagName: string, defaultValue: any = false) => {
    if (loading) return defaultValue;
    
    const flagValue = flags[flagName] ?? defaultValue;
    
    // Track flag evaluation
    posthog.capture('feature_flag_evaluated', {
      flag_name: flagName,
      flag_value: flagValue,
      default_used: flags[flagName] === undefined
    });
    
    return flagValue;
  };

  const isFeatureEnabled = (flagName: string) => {
    return getFeatureFlag(flagName, false) === true;
  };

  return {
    flags,
    loading,
    getFeatureFlag,
    isFeatureEnabled
  };
};
```

## Validation & Testing Requirements

### CI/CD Flag Validation (`.github/workflows/flags.yml`)
```yaml
name: Feature Flags Validation

on:
  push:
    paths:
      - 'backend/configs/flags.js'
      - 'frontend/src/hooks/useFeatureFlags.ts'
  pull_request:
    paths:
      - 'backend/configs/flags.js'

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Validate flag syntax
        run: npm run validate:flags
        
      - name: Check default states
        run: npm run test:flag-defaults
        
      - name: Lint flag configurations
        run: npm run lint:flags
        
      - name: Test flag evaluation logic
        run: npm run test:flag-evaluation
```

### Jest Testing Requirements (`backend/tests/flags.test.js`)
```typescript
describe('Feature Flags', () => {
  describe('Default States', () => {
    test('all flags should default to off/control variant', () => {
      const flags = require('../configs/flags.js');
      
      Object.entries(flags.FEATURE_FLAGS).forEach(([flagName, config]) => {
        expect(config.rolloutPercentage).toBe(0);
        expect(config.defaultVariant).toBeDefined();
      });
    });
    
    test('kill switches should default to false', () => {
      const killSwitches = require('../configs/killSwitches.js');
      
      Object.values(killSwitches.KILL_SWITCHES).forEach(killSwitch => {
        expect(killSwitch.defaultState).toBe(false);
      });
    });
  });
  
  describe('Flag Evaluation', () => {
    test('should return default value for non-existent flags', () => {
      const result = evaluateFlag('non-existent-flag', 'default');
      expect(result).toBe('default');
    });
    
    test('should respect segment-based overrides', async () => {
      const userId = 'test-user-id';
      const mockUser = { segments: ['high_trust', 'returning_users'] };
      
      jest.spyOn(userService, 'getUserData').mockResolvedValue(mockUser);
      
      const result = await getFeatureFlagForSegment(userId, 'f1-pricing-modal-layout', 'compact');
      expect(result).toBeDefined();
    });
  });
  
  describe('PostHog Integration', () => {
    test('should track flag evaluations', () => {
      const mockCapture = jest.spyOn(posthog, 'capture');
      
      getFeatureFlag('test-flag', 'default');
      
      expect(mockCapture).toHaveBeenCalledWith('feature_flag_evaluated', {
        flag_name: 'test-flag',
        flag_value: 'default',
        default_used: true
      });
    });
  });
});
```

### PostHog Analytics Events
```typescript
// Track feature flag lifecycle events
export const trackFeatureFlagEvents = {
  flagEnabled: (flagName: string, variant: string, userId?: string) =>
    posthog.capture('flag_enabled', {
      flag_name: flagName,
      variant,
      user_id: userId,
      timestamp: Date.now()
    }),
    
  flagDisabled: (flagName: string, reason: string) =>
    posthog.capture('flag_disabled', {
      flag_name: flagName,
      reason,
      timestamp: Date.now()
    }),
    
  flagEvaluated: (flagName: string, value: any, isDefault: boolean) =>
    posthog.capture('flag_evaluated', {
      flag_name: flagName,
      flag_value: value,
      default_used: isDefault
    }),
    
  experimentStarted: (experimentName: string, variants: string[]) =>
    posthog.capture('experiment_started', {
      experiment_name: experimentName,
      variants,
      start_time: Date.now()
    }),
    
  experimentCompleted: (experimentName: string, winner: string, confidence: number) =>
    posthog.capture('experiment_completed', {
      experiment_name: experimentName,
      winning_variant: winner,
      statistical_confidence: confidence,
      completion_time: Date.now()
    })
};
```

## Safety & Communication Standards

### Safety Protocols
- **Gradual Rollout**: Start at 0%, increase by 10-25% increments based on metrics
- **Monitoring**: Real-time monitoring of key metrics during rollouts
- **Rollback Plan**: Automated rollback triggers for performance degradation
- **Impact Assessment**: Measure impact on PRD targets (TrustDelta ≥4.2, <2s response times)

### Stakeholder Communication
- **GitHub Issues**: Create issues for major flag deployments with timeline and success criteria
- **Slack Notifications**: Automated notifications for flag state changes
- **Documentation**: Maintain flag registry with purpose, metrics, and lifecycle status
- **Review Process**: Require code review for all flag configuration changes

### Lifecycle Management
1. **Creation**: Define flag with clear success criteria and rollout plan
2. **Testing**: Validate in staging environment with synthetic users
3. **Ramping**: Gradual rollout with continuous monitoring
4. **Evaluation**: Statistical analysis of results vs success criteria
5. **Decision**: Permanent adoption, modification, or removal
6. **Cleanup**: Remove flag code within 30 days of permanent decision

## References & Compliance

### PRD Alignment
- **Section 17**: Future Enhancements - Voice mode and advanced features
- **Section 12**: Success Metrics - TrustDelta ≥4.2, >65% CanAI preference
- **Section 7**: Performance - <2s response times, 99.9% uptime
- **Section 8.6**: Monitoring & Analytics - PostHog integration

### Project Structure Integration
- **Backend**: `backend/configs/flags.js`, `backend/middleware/featureFlags.js`
- **Frontend**: `frontend/src/hooks/useFeatureFlags.ts`, `frontend/src/utils/featureFlags.ts`
- **Database**: `databases/feature_flags` (if persistent storage needed)
- **Analytics**: `backend/services/posthog.js` for flag tracking
- **CI/CD**: `.github/workflows/flags.yml` for validation

### Technical Standards
- **Naming**: kebab-case flag names with stage prefixes
- **Defaults**: All flags default to off/control variant
- **Performance**: Flag evaluation <10ms, cached locally
- **Security**: User targeting via Memberstack IDs, no PII in flag data
- **Accessibility**: Flag variants maintain WCAG 2.2 AA compliance

---

**Updated**: June 18, 2025  
**Version**: 2.0.0  
**Alignment**: PRD Section 17, Project Structure Mapping v1.2








