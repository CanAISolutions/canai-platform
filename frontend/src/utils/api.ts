import { generateCorrelationId, retryWithBackoff } from './tracing';
import { insertSessionLog, insertErrorLog, insertPromptLog } from './supabase';
import { logSessionToMakecom } from './makecom';

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface MessageResponse {
  messages: { text: string }[];
  error: null | string;
}

export interface LogInteractionRequest {
  user_id?: string;
  interaction_type: string;
  interaction_details: Record<string, any>;
}

export interface PreviewSparkRequest {
  business_type?: string;
  challenge?: string;
  target_audience?: string;
}

export interface PreviewSparkResponse {
  spark: {
    title: string;
    tagline: string;
  };
  error: null | string;
}

export interface SaveProgressRequest {
  prompt_id?: string;
  payload: Record<string, any>;
}

export interface SaveProgressResponse {
  prompt_id: string;
  error: null | string;
}

export interface IntentMirrorRequest {
  businessName: string;
  targetAudience: string;
  primaryGoal: string;
  competitiveContext: string;
  brandVoice: string;
  resourceConstraints: string;
  currentStatus: string;
  businessDescription: string;
  revenueModel: string;
  planPurpose: string;
  location: string;
  uniqueValue: string;
}

export interface IntentMirrorResponse {
  summary: string;
  confidenceScore: number;
  clarifyingQuestions: string[];
  error: null | string;
}

// Base API configuration
const API_BASE = import.meta.env.VITE_API_BASE || '/v1';
const DEFAULT_TIMEOUT = 5000;

// Generic fetch wrapper with retry logic and correlation ID
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;

  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'X-Correlation-ID': generateCorrelationId(),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  });
};

// API Functions
export const getMessages = async (): Promise<MessageResponse> => {
  try {
    // TODO: Replace with actual backend endpoint
    const response = await apiCall<MessageResponse>('/messages');
    console.log('[API] GET /v1/messages response:', response);
    return response;
  } catch (error) {
    console.warn('[API] GET /v1/messages failed, using fallback:', error);

    // Fallback: Return static trust indicator messages
    return {
      messages: [
        { text: 'CanAI launched my bakery with a $50K plan!' },
        { text: 'Generated 847 high-quality business plans' },
        { text: '500+ founders trust CanAI for growth' },
        { text: 'Average funding increase: 73%' },
      ],
      error: null,
    };
  }
};

export const logInteraction = async (
  data: LogInteractionRequest
): Promise<ApiResponse> => {
  console.log('[API] POST /v1/log-interaction called with:', data);

  try {
    // Primary: Log to Supabase directly
    await insertSessionLog({
      user_id: data.user_id,
      interaction_type: data.interaction_type,
      interaction_details: data.interaction_details,
    });

    // Secondary: Trigger Make.com workflow
    await logSessionToMakecom(data);

    console.log('[API] Interaction logged successfully');
    return { error: null };
  } catch (error) {
    console.error('[API] logInteraction failed:', error);

    // Error logging
    await logError({
      user_id: data.user_id,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'log_interaction',
      error_type: 'timeout',
    });

    return { error: 'Failed to log interaction' };
  }
};

// Generate contextual spark based on business context
const generateContextualSpark = (
  data: PreviewSparkRequest
): { title: string; tagline: string } => {
  const businessType = data.business_type?.toLowerCase() || '';
  const challenge = data.challenge?.toLowerCase() || '';

  // Generate contextual sparks based on business type and challenge
  if (businessType.includes('bakery') || businessType.includes('food')) {
    return {
      title: 'Sweet Success Strategy',
      tagline: 'Recipe for bakery growth and community connection',
    };
  } else if (
    businessType.includes('tech') ||
    businessType.includes('software')
  ) {
    return {
      title: 'Digital Innovation Blueprint',
      tagline: 'Scale your tech vision with strategic planning',
    };
  } else if (
    businessType.includes('retail') ||
    businessType.includes('store')
  ) {
    return {
      title: 'Retail Excellence Plan',
      tagline: 'Transform your store into a customer magnet',
    };
  } else if (
    challenge?.includes('funding') ||
    challenge?.includes('investment')
  ) {
    return {
      title: 'Investor-Ready Strategy',
      tagline: 'Position your business for successful funding',
    };
  } else if (challenge?.includes('growth') || challenge?.includes('scale')) {
    return {
      title: 'Growth Acceleration Plan',
      tagline: 'Strategic roadmap for sustainable expansion',
    };
  } else {
    return {
      title: 'Business Success Blueprint',
      tagline: 'Comprehensive strategy for your unique venture',
    };
  }
};

export const generatePreviewSpark = async (
  data: PreviewSparkRequest
): Promise<PreviewSparkResponse> => {
  console.log('[API] POST /v1/generate-preview-spark called with:', data);

  try {
    // TODO: Replace with actual GPT-4o integration
    const response = await apiCall<PreviewSparkResponse>(
      '/generate-preview-spark',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    console.log('[API] Preview spark generated:', response);
    return response;
  } catch (error) {
    console.warn('[API] generatePreviewSpark failed, using fallback:', error);

    // Fallback: Generate contextual spark based on input
    const contextualSpark = generateContextualSpark(data);

    return {
      spark: contextualSpark,
      error: null,
    };
  }
};

// New save-progress API endpoint
export const saveProgress = async (
  data: SaveProgressRequest
): Promise<SaveProgressResponse> => {
  console.log('[API] POST /v1/save-progress called with:', data);

  try {
    const startTime = Date.now();

    // Primary: Save to Supabase prompt_logs
    const promptId = data.prompt_id || crypto.randomUUID();

    await insertSessionLog({
      user_id: undefined, // Anonymous user
      interaction_type: 'save_progress',
      interaction_details: {
        prompt_id: promptId,
        payload: data.payload,
        timestamp: new Date().toISOString(),
        correlation_id: generateCorrelationId(),
      },
    });

    // Secondary: Trigger Make.com workflow for processing
    await logSessionToMakecom({
      user_id: undefined,
      interaction_type: 'save_progress',
      interaction_details: {
        prompt_id: promptId,
        payload: data.payload,
        action: 'save_detailed_input',
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[API] save-progress completed in ${duration}ms`);

    // Ensure response time < 500ms target
    if (duration > 500) {
      console.warn(`[API] save-progress exceeded 500ms target: ${duration}ms`);
    }

    return {
      prompt_id: promptId,
      error: null,
    };
  } catch (error) {
    console.error('[API] saveProgress failed:', error);

    // Error logging
    await logError({
      user_id: undefined,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'save_progress',
      error_type: 'timeout',
    });

    return {
      prompt_id: data.prompt_id || '',
      error: 'Failed to save progress',
    };
  }
};

// Enhanced tooltip generation with GPT-4o integration
export const generateTooltipContent = async (data: {
  field: string;
  business_type?: string;
  context?: string;
}): Promise<{ content: string; error: null | string }> => {
  console.log('[API] POST /v1/generate-tooltip called with:', data);

  try {
    const startTime = Date.now();

    // TODO: Replace with actual GPT-4o API integration
    const response = await apiCall<{ content: string; error: null | string }>(
      '/generate-tooltip',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    const duration = Date.now() - startTime;

    // Ensure response time < 100ms target
    if (duration > 100) {
      console.warn(
        `[API] generate-tooltip exceeded 100ms target: ${duration}ms`
      );
    }

    console.log(`[API] Tooltip generated in ${duration}ms:`, response);
    return response;
  } catch (error) {
    console.warn('[API] generateTooltipContent failed, using fallback:', error);

    // Fallback: Generate contextual tooltip based on field and business type
    const contextualTooltip = generateContextualTooltip(data);

    return {
      content: contextualTooltip,
      error: null,
    };
  }
};

// Fallback tooltip generation based on field and business context
const generateContextualTooltip = (data: {
  field: string;
  business_type?: string;
}): string => {
  const businessType = data.business_type?.toLowerCase() || '';
  const field = data.field;

  const tooltips: Record<string, Record<string, string>> = {
    businessDescription: {
      bakery:
        "E.g., 'Artisanal bakery serving Denver with organic pastries and community gathering space'",
      tech: "E.g., 'SaaS platform helping small businesses automate their customer communication'",
      retail:
        "E.g., 'Sustainable fashion boutique offering ethically-sourced clothing for millennials'",
      default:
        'Describe your business in 10-50 words, focusing on what you do and who you serve',
    },
    revenueModel: {
      bakery:
        "E.g., 'Daily bakery sales, custom cakes, catering services, coffee bar'",
      tech: "E.g., 'Monthly SaaS subscriptions, setup fees, premium support packages'",
      retail:
        "E.g., 'Product sales, styling consultations, seasonal collections'",
      default:
        'How will your business make money? List your main revenue streams',
    },
    resourceConstraints: {
      bakery:
        "E.g., '$50k startup budget; team of 3; 6-month timeline to opening'",
      tech: "E.g., '$100k seed funding; 2 developers; 12-month MVP timeline'",
      retail:
        "E.g., '$30k initial inventory; solo founder; 3-month launch timeline'",
      default: 'What are your budget, team, and timeline constraints?',
    },
  };

  const fieldTooltips = tooltips[field];
  if (!fieldTooltips)
    return 'Additional context to help us understand your business better';

  if (businessType.includes('bakery') || businessType.includes('food')) {
    return fieldTooltips.bakery || fieldTooltips.default;
  } else if (
    businessType.includes('tech') ||
    businessType.includes('software')
  ) {
    return fieldTooltips.tech || fieldTooltips.default;
  } else if (
    businessType.includes('retail') ||
    businessType.includes('store')
  ) {
    return fieldTooltips.retail || fieldTooltips.default;
  } else {
    return fieldTooltips.default;
  }
};

// Intent Mirror API endpoint
export const generateIntentMirror = async (
  data: IntentMirrorRequest
): Promise<IntentMirrorResponse> => {
  console.log('[API] POST /v1/intent-mirror called with:', data);

  try {
    const startTime = Date.now();

    // TODO: Replace with actual GPT-4o integration
    const response = await apiCall<IntentMirrorResponse>('/intent-mirror', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const duration = Date.now() - startTime;

    // Log to Supabase prompt_logs
    await insertPromptLog({
      user_id: undefined, // Anonymous user
      payload: {
        ...data,
        summary: response.summary,
        confidence_score: response.confidenceScore,
        response_time: duration,
      },
      location: window.location.href,
      unique_value: generateCorrelationId(),
    });

    // Track PostHog event
    const { trackEvent, POSTHOG_EVENTS } = await import('./analytics');
    trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
      stepName: 'intent_mirror',
      completed: true,
      confidence_score: response.confidenceScore,
      response_time: duration,
      dropoffReason: null,
    });

    // Handle low confidence scenarios
    if (response.confidenceScore < 0.8) {
      await insertErrorLog({
        user_id: undefined,
        error_message: `Low confidence score: ${response.confidenceScore}`,
        action: 'intent_mirror_low_confidence',
        error_type: 'low_confidence',
        support_request: true,
      });

      // Track support request event
      trackEvent('support_requested', {
        reason: 'low_confidence',
        confidence_score: response.confidenceScore,
        stepName: 'intent_mirror',
      });
    }

    // Ensure response time < 300ms target
    if (duration > 300) {
      console.warn(`[API] intent-mirror exceeded 300ms target: ${duration}ms`);
    }

    console.log(`[API] Intent mirror generated in ${duration}ms:`, response);
    return response;
  } catch (error) {
    console.error('[API] generateIntentMirror failed:', error);

    // Error logging
    await logError({
      user_id: undefined,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'intent_mirror_generation',
      error_type: 'timeout',
    });

    // Fallback: Generate contextual intent mirror
    const fallbackResponse = generateContextualIntentMirror(data);

    return {
      ...fallbackResponse,
      error: 'Fallback response due to API failure',
    };
  }
};

// Fallback intent mirror generation
const generateContextualIntentMirror = (
  data: IntentMirrorRequest
): IntentMirrorResponse => {
  const businessName = data.businessName || 'your business';
  const primaryGoal = data.primaryGoal?.toLowerCase() || '';
  const businessType = data.businessDescription?.toLowerCase() || '';

  let summary = `Create a comprehensive business plan for ${businessName}`;
  let confidenceScore = 0.75;
  let clarifyingQuestions: string[] = [];

  // Enhance summary based on primary goal
  if (primaryGoal.includes('funding') || primaryGoal.includes('investment')) {
    summary += ` focused on securing investor funding`;
    confidenceScore += 0.1;
  } else if (primaryGoal.includes('growth') || primaryGoal.includes('scale')) {
    summary += ` targeting strategic growth and market expansion`;
    confidenceScore += 0.05;
  } else if (primaryGoal.includes('launch') || primaryGoal.includes('start')) {
    summary += ` for successful market launch`;
  }

  // Add business context
  if (data.targetAudience) {
    summary += `, targeting ${data.targetAudience}`;
    confidenceScore += 0.05;
  }

  if (data.location) {
    summary += ` in ${data.location}`;
  }

  // Add unique value proposition
  if (data.uniqueValue) {
    summary += `, emphasizing ${data.uniqueValue}`;
    confidenceScore += 0.05;
  }

  // Generate clarifying questions for low confidence
  if (confidenceScore < 0.8) {
    clarifyingQuestions = [
      `What specific funding amount are you targeting for ${businessName}?`,
      'How will you differentiate from existing competitors in your market?',
      "What's your projected monthly revenue for the first year?",
      'Do you have any existing partnerships or supplier relationships?',
      'What permits or certifications do you need for your business?',
    ];
  }

  return {
    summary: summary + '.',
    confidenceScore: Math.min(confidenceScore, 0.95),
    clarifyingQuestions,
    error: null,
  };
};

// Track field edit events
export const trackFieldEdit = async (
  field: string,
  value: string
): Promise<void> => {
  try {
    const { trackEvent } = await import('./analytics');
    trackEvent('field_edited', {
      field,
      value_length: value.length,
      stepName: 'intent_mirror',
      timestamp: new Date().toISOString(),
    });

    console.log(`[API] Field edit tracked: ${field}`);
  } catch (error) {
    console.warn('[API] Failed to track field edit:', error);
  }
};

// Error logging to Supabase and Make.com
export const logError = async (errorData: {
  user_id?: string;
  error_message: string;
  action: string;
  error_type:
    | 'timeout'
    | 'invalid_input'
    | 'stripe_failure'
    | 'low_confidence'
    | 'contradiction'
    | 'nsfw'
    | 'token_limit';
}): Promise<void> => {
  try {
    // Log to Supabase
    await insertErrorLog(errorData);

    // Log to Make.com workflow
    const { logErrorToMakecom } = await import('./makecom');
    await logErrorToMakecom(errorData);

    console.log('[API] Error logged successfully:', errorData);
  } catch (error) {
    console.error('[API] Failed to log error:', error);
  }
};
