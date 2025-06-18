import { generateCorrelationId, retryWithBackoff } from './tracing';
import { insertSessionLog, insertErrorLog } from './supabase';
import { triggerMakecomWorkflow } from './makecom';

// API Response Types
export interface StripeSessionRequest {
  spark: {
    title: string;
    product_id: string;
    price: number;
  };
  user_id?: string;
}

export interface StripeSessionResponse {
  session: {
    id: string;
    url?: string;
  };
  error: null | string;
}

export interface RefundRequest {
  session_id: string;
  reason: string;
}

export interface RefundResponse {
  status: 'success' | 'failed';
  error: null | string;
}

export interface SwitchProductRequest {
  session_id: string;
  new_product: string;
}

export interface SwitchProductResponse {
  new_session_id: string;
  error: null | string;
}

// Base API configuration
const API_BASE = import.meta.env.VITE_API_BASE || '/v1';
const DEFAULT_TIMEOUT = 5000;

// Generic fetch wrapper with retry logic
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

// Create Stripe checkout session
export const createStripeSession = async (
  data: StripeSessionRequest
): Promise<StripeSessionResponse> => {
  console.log('[Purchase API] POST /v1/stripe-session called with:', data);

  try {
    // TODO: Replace with actual Stripe integration
    const response = await apiCall<StripeSessionResponse>('/stripe-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Stripe session created:', response);

    // Log payment initiation to Supabase
    await logPaymentInitiation({
      user_id: data.user_id,
      stripe_payment_id: response.session.id,
      interaction_details: {
        product: data.spark.product_id,
        price: data.spark.price,
        spark_title: data.spark.title,
      },
    });

    // Trigger Make.com add_project.json workflow
    await triggerMakecomWorkflow('PROJECT_CREATION', {
      action: 'create_project',
      stripe_session_id: response.session.id,
      product: data.spark.product_id,
      user_id: data.user_id,
    });

    return response;
  } catch (error) {
    console.warn(
      '[Purchase API] createStripeSession failed, using fallback:',
      error
    );

    // Fallback: Generate mock session for development
    const mockSessionId = `stripe_mock_${Date.now()}`;

    // Log error
    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'create_stripe_session',
      error_type: 'timeout',
      user_id: data.user_id,
    });

    return {
      session: {
        id: mockSessionId,
        url: `https://checkout.stripe.com/pay/${mockSessionId}`,
      },
      error: null,
    };
  }
};

// Process refund
export const processRefund = async (
  data: RefundRequest
): Promise<RefundResponse> => {
  console.log('[Purchase API] POST /v1/refund called with:', data);

  try {
    // TODO: Replace with actual Stripe refund integration
    const response = await apiCall<RefundResponse>('/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Refund processed:', response);

    // Log refund to Supabase
    await insertSessionLog({
      stripe_payment_id: data.session_id,
      interaction_type: 'refund_requested',
      interaction_details: {
        reason: data.reason,
        refund_status: response.status,
      },
    });

    return response;
  } catch (error) {
    console.warn('[Purchase API] processRefund failed:', error);

    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'process_refund',
      error_type: 'timeout',
    });

    return {
      status: 'failed',
      error: 'Refund processing failed',
    };
  }
};

// Switch product during checkout
export const switchProduct = async (
  data: SwitchProductRequest
): Promise<SwitchProductResponse> => {
  console.log('[Purchase API] POST /v1/switch-product called with:', data);

  try {
    // TODO: Replace with actual Stripe product switching
    const response = await apiCall<SwitchProductResponse>('/switch-product', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Product switched:', response);

    // Log product switch to Supabase
    await insertSessionLog({
      stripe_payment_id: data.session_id,
      interaction_type: 'product_switched',
      interaction_details: {
        old_session_id: data.session_id,
        new_session_id: response.new_session_id,
        new_product: data.new_product,
      },
    });

    return response;
  } catch (error) {
    console.warn('[Purchase API] switchProduct failed:', error);

    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'switch_product',
      error_type: 'timeout',
    });

    return {
      new_session_id: '',
      error: 'Product switch failed',
    };
  }
};

// Log payment initiation with F4-E1 retry logic
export const logPaymentInitiation = async (paymentData: {
  user_id?: string;
  stripe_payment_id: string;
  interaction_details: Record<string, any>;
}): Promise<void> => {
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await insertSessionLog({
        user_id: paymentData.user_id,
        stripe_payment_id: paymentData.stripe_payment_id,
        interaction_type: 'payment_initiated',
        interaction_details: paymentData.interaction_details,
      });

      console.log('[Purchase API] Payment initiation logged successfully');
      return;
    } catch (error) {
      console.warn(
        `[F4-E1] Payment logging attempt ${attempt + 1} failed:`,
        error
      );

      if (attempt === maxRetries) {
        // Final attempt failed, log error
        await logPurchaseError({
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
          action: 'log_payment_initiation',
          error_type: 'timeout',
          user_id: paymentData.user_id,
        });

        // F4-E1: Fallback to localStorage
        try {
          const fallbackData = {
            ...paymentData,
            timestamp: new Date().toISOString(),
            fallback_reason: 'supabase_logging_failed',
          };

          const existingData = JSON.parse(
            localStorage.getItem('canai_payment_fallback') || '[]'
          );
          existingData.push(fallbackData);
          localStorage.setItem(
            'canai_payment_fallback',
            JSON.stringify(existingData)
          );

          console.log('[F4-E1] Payment data saved to localStorage fallback');
        } catch (storageError) {
          console.error('[F4-E1] localStorage fallback failed:', storageError);
        }

        throw error;
      }

      // Exponential backoff delay
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Error logging specific to purchase operations
const logPurchaseError = async (errorData: {
  error_message: string;
  action: string;
  error_type: 'timeout' | 'stripe_failure' | 'invalid_input';
  user_id?: string;
}): Promise<void> => {
  try {
    await insertErrorLog({
      ...errorData,
      support_request: false,
    });
  } catch (error) {
    console.error('[Purchase API] Failed to log purchase error:', error);
  }
};
