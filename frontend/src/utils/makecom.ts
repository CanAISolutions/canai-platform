/**
 * Make.com workflow integration for CanAI Platform
 * Handles Webflow → Make.com → Supabase data flow
 */

import { generateCorrelationId } from './tracing';

export interface MakecomWebhookPayload {
  correlation_id: string;
  timestamp: string;
  source: string;
  event_type: string;
  data: Record<string, unknown>;
}

// Make.com webhook URLs
const MAKECOM_WEBHOOKS = {
  SESSION_LOG:
    import.meta.env['VITE_MAKECOM_SESSION_WEBHOOK'] ||
    'https://hook.integromat.com/your-session-webhook',
  USER_INTERACTION:
    import.meta.env['VITE_MAKECOM_INTERACTION_WEBHOOK'] ||
    'https://hook.integromat.com/your-interaction-webhook',
  ERROR_LOG:
    import.meta.env['VITE_MAKECOM_ERROR_WEBHOOK'] ||
    'https://hook.integromat.com/your-error-webhook',
  SPARK_GENERATION:
    import.meta.env['VITE_MAKECOM_SPARK_WEBHOOK'] ||
    'https://hook.integromat.com/your-spark-webhook',
  SPARK_REGENERATION:
    import.meta.env['VITE_MAKECOM_SPARK_REGEN_WEBHOOK'] ||
    'https://hook.integromat.com/your-spark-regen-webhook',
  PROJECT_CREATION:
    import.meta.env['VITE_MAKECOM_PROJECT_WEBHOOK'] ||
    'https://hook.integromat.com/your-project-webhook',
  DELIVERABLE_GENERATION:
    import.meta.env['VITE_MAKECOM_DELIVERABLE_WEBHOOK'] ||
    'https://hook.integromat.com/your-deliverable-webhook',
  PDF_GENERATION:
    import.meta.env['VITE_MAKECOM_PDF_WEBHOOK'] ||
    'https://hook.integromat.com/your-pdf-webhook',
  PROJECT_STATUS_UPDATE:
    import.meta.env['VITE_MAKECOM_STATUS_WEBHOOK'] ||
    'https://hook.integromat.com/your-status-webhook',
};

// Send data to Make.com workflow
export const triggerMakecomWorkflow = async (
  webhookType: keyof typeof MAKECOM_WEBHOOKS,
  data: Record<string, unknown>
): Promise<void> => {
  const webhookUrl = MAKECOM_WEBHOOKS[webhookType];

  if (!webhookUrl || webhookUrl.includes('your-')) {
    console.warn(
      `[Make.com] ${webhookType} webhook not configured, skipping...`
    );
    return;
  }

  const payload: MakecomWebhookPayload = {
    correlation_id: generateCorrelationId(),
    timestamp: new Date().toISOString(),
    source: 'canai_discovery_hook',
    event_type: webhookType.toLowerCase(),
    data,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': payload.correlation_id,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Make.com webhook failed: ${response.status} ${response.statusText}`
      );
    }

    console.log(`[Make.com] ${webhookType} workflow triggered successfully`);
  } catch (error) {
    console.error(
      `[Make.com] Failed to trigger ${webhookType} workflow:`,
      error
    );

    // Fallback: Log to Supabase directly if Make.com fails
    if (webhookType === 'SESSION_LOG') {
      try {
        const { insertSessionLog } = await import('./supabase');
        await insertSessionLog({
          user_id: data.user_id,
          interaction_type: 'makecom_fallback',
          interaction_details: {
            original_event: webhookType,
            fallback_reason: 'makecom_webhook_failed',
            original_data: data,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (supabaseError) {
        console.error(
          '[Make.com] Supabase fallback also failed:',
          supabaseError
        );
      }
    }
  }
};

// Specific workflow triggers
export const logSessionToMakecom = (sessionData: {
  user_id?: string;
  interaction_type: string;
  interaction_details: Record<string, unknown>;
}) => {
  return triggerMakecomWorkflow('SESSION_LOG', sessionData);
};

export const logInteractionToMakecom = (interactionData: {
  user_id?: string;
  action: string;
  details: Record<string, unknown>;
}) => {
  return triggerMakecomWorkflow('USER_INTERACTION', interactionData);
};

export const logErrorToMakecom = (errorData: {
  user_id?: string;
  error_message: string;
  action: string;
  error_type: string;
}) => {
  return triggerMakecomWorkflow('ERROR_LOG', errorData);
};

// Spark-specific workflow triggers
export const triggerSparkGeneration = (sparkData: {
  business_type: string;
  tone: string;
  outcome: string;
  prompt_id: string;
}) => {
  return triggerMakecomWorkflow('SPARK_GENERATION', {
    action: 'generate_sparks',
    spark_request: sparkData,
    gpt4o_integration: true,
  });
};

export const triggerSparkRegeneration = (sparkData: {
  business_type: string;
  tone: string;
  outcome: string;
  attempt_count: number;
  prompt_id: string;
}) => {
  return triggerMakecomWorkflow('SPARK_REGENERATION', {
    action: 'regenerate_sparks',
    spark_request: sparkData,
    gpt4o_integration: true,
  });
};

// SparkSplit specific workflow triggers
export const triggerSparkSplitWorkflow = (sparkSplitData: {
  canai_output: string;
  generic_output: string;
  trust_delta: number;
  emotional_resonance: {
    score: number;
    factors: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    emotional_triggers?: string[];
  };
  prompt_id: string;
}) => {
  return triggerMakecomWorkflow('DELIVERABLE_GENERATION', {
    action: 'spark_split_comparison',
    comparison_data: sparkSplitData,
    gpt4o_integration: true,
    hume_validation: true,
    supabase_logging: true,
  });
};

export const triggerSparkSplitFeedback = (feedbackData: {
  prompt_id: string;
  selection: string;
  feedback: string;
  trust_delta: number;
}) => {
  return triggerMakecomWorkflow('USER_INTERACTION', {
    action: 'sparksplit_feedback',
    feedback_data: feedbackData,
    supabase_logging: true,
  });
};

// Purchase Flow specific workflow triggers
export const triggerProjectCreation = (projectData: {
  stripe_session_id: string;
  product: string;
  user_id?: string;
  spark_title?: string;
}) => {
  return triggerMakecomWorkflow('PROJECT_CREATION', {
    action: 'create_project',
    project_request: projectData,
    webflow_integration: true,
    memberstack_sync: true,
  });
};

// Deliverable generation specific workflow triggers
export const triggerDeliverableGeneration = (deliverableData: {
  prompt_id: string;
  product_type: string;
  business_inputs: Record<string, unknown>;
  user_id?: string;
}) => {
  return triggerMakecomWorkflow('DELIVERABLE_GENERATION', {
    action: 'generate_deliverable',
    deliverable_request: deliverableData,
    gpt4o_integration: true,
    hume_validation: true,
    supabase_logging: true,
  });
};

export const triggerPDFGeneration = (pdfData: {
  prompt_id: string;
  product_type: string;
  canai_output: string;
  user_id?: string;
}) => {
  return triggerMakecomWorkflow('PDF_GENERATION', {
    action: 'generate_pdf',
    pdf_request: pdfData,
    storage_integration: true,
    delivery_method: 'download_link',
  });
};

export const triggerProjectStatusUpdate = (statusData: {
  prompt_id: string;
  project_id?: string;
  status: 'generating' | 'complete' | 'failed';
  user_id?: string;
}) => {
  return triggerMakecomWorkflow('PROJECT_STATUS_UPDATE', {
    action: 'update_project_status',
    status_update: statusData,
    saap_integration: true, // SAAP Update Project Blueprint.json
    webflow_sync: true,
  });
};

export const triggerRevisionWorkflow = (revisionData: {
  prompt_id: string;
  feedback: string;
  attempt_count: number;
  user_id?: string;
}) => {
  return triggerMakecomWorkflow('USER_INTERACTION', {
    action: 'process_revision',
    revision_request: revisionData,
    gpt4o_integration: true,
    supabase_logging: true,
  });
};

export const triggerRegenerationWorkflow = (regenData: {
  prompt_id: string;
  attempt_count: number;
  user_id?: string;
}) => {
  return triggerMakecomWorkflow('USER_INTERACTION', {
    action: 'process_regeneration',
    regeneration_request: regenData,
    gpt4o_integration: true,
    supabase_logging: true,
  });
};

// TODO: Configure Make.com scenarios
/*
Scenario 1: add_project.json
- Webhook trigger → Filter → Supabase insert to session_logs
- Include error handling and retry logic

Scenario 2: admin_add_project.json
- Admin webhook → Validation → Admin-specific logging

Scenario 3: SAAP Update Project Blueprint.json
- Project update webhook → Status update → Notification

Scenario 4: add_client.json
- New client webhook → Memberstack sync → Supabase user creation

Scenario 5: spark_generation.json (NEW)
- Spark webhook → GPT-4o API call → Response formatting → Supabase spark_logs insert
- Include error handling for GPT-4o timeout/failures
- Performance target: <1.5s end-to-end

Scenario 6: spark_regeneration.json (NEW)
- Regeneration webhook → GPT-4o API call with attempt_count → Response formatting → Supabase update
- Include logic for max attempts (3 + 1 extra if trust_score < 50%)

Scenario 7: add_project.json (PURCHASE FLOW)
- Purchase webhook → Stripe session validation → Webflow project creation → Memberstack sync
- Include Supabase session_logs update with stripe_payment_id
- Performance target: <2s project creation
- Error handling for Stripe failures, Webflow timeouts, Memberstack sync issues

NEW Scenario: deliverable_generation.json
- Webhook trigger → GPT-4o content generation → Hume AI validation → Supabase comparisons insert → PDF generation → Status update
- Include error handling for GPT-4o timeout/failures and Hume AI validation failures
- Performance target: <2s end-to-end for content generation
- Include fallback logic for API failures

NEW Scenario: pdf_generation.json
- PDF webhook → Content formatting → PDF creation → Cloud storage → Download URL generation
- Include error handling for PDF generation failures
- Performance target: <1s PDF creation and storage
- Support multiple product types (business_builder, social_email, site_audit)

UPDATED Scenario: SAAP Update Project Blueprint.json
- Enhanced with deliverable completion status updates
- Project status webhook → Webflow project update → Memberstack notification → Status logging
- Include logic for project completion tracking and user notifications

NEW Scenario: revision_processing.json
- Revision webhook → GPT-4o revision generation → Hume AI re-validation → Supabase update
- Include feedback analysis and improvement suggestions
- Performance target: <2s revision processing

NEW Scenario: regeneration_processing.json
- Regeneration webhook → GPT-4o alternative generation → Quality scoring → Supabase update
- Include attempt counting and max limit enforcement (2 attempts)
- Performance target: <2s regeneration processing

NEW Scenario: spark_split_comparison.json
- Webhook trigger → GPT-4o generic generation → Hume AI validation → TrustDelta calculation → Supabase comparisons insert
- Include error handling for GPT-4o timeout/failures and Hume AI validation failures
- Performance target: <500ms end-to-end for comparison generation
- Include fallback logic for API failures

UPDATED Scenario: user_interaction.json
- Enhanced with SparkSplit feedback processing
- Feedback webhook → Sentiment analysis → Supabase feedback update → Analytics logging
- Include logic for feedback categorization and user preference tracking
*/
