/**
 * Stripe Checkout Session Service
 * PRD-aligned, supports multiple product tracks and dynamic pricing.
 * Production-ready with retry logic, error handling, and logging.
 */
import stripe from './stripe.js';
import crypto from 'crypto';
import supabase from '../supabase/client.js';
import { captureException } from '@sentry/node';

/**
 * Retry logic with exponential backoff for retryable errors
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise} Result of the function
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 2^attempt * baseDelay
      const delay = Math.pow(2, attempt) * baseDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Determines if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
function isRetryableError(error) {
  // Stripe API errors that are retryable
  if (error.type === 'StripeAPIError') {
    return ['rate_limit', 'api_connection_error', 'api_error'].includes(
      error.code
    );
  }

  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Supabase connection errors
  if (error.message && error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Utility to redact sensitive fields from objects before logging
 */
function redactSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const SENSITIVE_FIELDS = [
    'card_number', 'cvc', 'cvv', 'exp_month', 'exp_year', 'email', 'phone', 'address', 'name', 'full_name', 'billing_details', 'payment_method', 'source', 'customer', 'account_number', 'routing_number', 'iban', 'ssn', 'tax_id', 'password', 'token', 'authorization', 'authorization_code', 'card', 'cards', 'bank_account', 'bank_accounts', 'fingerprint', 'receipt_email', 'receipt_number', 'receipt_url', 'shipping', 'source', 'sources', 'payment_method_details', 'payment_method_data', 'payment_method_options', 'payment_intent', 'payment_intents', 'setup_intent', 'setup_intents', 'mandate', 'mandates', 'pii', 'personal_id_number', 'identity_document', 'identity_documents', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'taxpayer_id', 'taxpayer_id_number', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes', 'ssn', 'ssn_last_4', 'ssn_last4', 'ssn_first_5', 'ssn_first5', 'dob', 'date_of_birth', 'birthdate', 'birth_date', 'passport', 'passport_number', 'drivers_license', 'license_number', 'license', 'national_id', 'national_id_number', 'taxpayer_id', 'taxpayer_id_number', 'tax_id_number', 'tax_id', 'tax_info', 'tax_information', 'taxpayer_information', 'taxpayer_info', 'taxpayer', 'tax', 'taxes'];
  if (Array.isArray(obj)) return obj.map(redactSensitiveData);
  const result = {};
  for (const key in obj) {
    if (SENSITIVE_FIELDS.includes(key)) continue;
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Logs payment events to Supabase payment_logs table
 * @param {Object} logData - Data to log
 */
async function logPaymentEvent(logData) {
  try {
    await supabase.from('payment_logs').insert({
      event_type: logData.event_type,
      user_id: logData.user_id,
      amount: logData.amount,
      status: logData.status,
      metadata: redactSensitiveData(logData.metadata),
      session_id: logData.session_id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail the main operation if logging fails, but capture the error
    captureException(error, {
      tags: { component: 'payment_logging' },
      extra: logData,
    });
  }
}

/**
 * Creates a Stripe checkout session for the given product track and user.
 * @param {Object} params
 * @param {string} params.productTrack - The product track key
 * @param {string} params.userId - The user ID
 * @param {Object} params.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Stripe session object
 */
export async function createCheckoutSession({
  productTrack,
  userId,
  metadata = {},
}) {
  let pricingData;
  let sessionId;
  const startTime = Date.now();

  try {
    // Fetch product/price from Supabase with retry logic
    pricingData = await withRetry(async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('plan_name, price, active, currency, features')
        .eq('plan_name', productTrack)
        .single();

      if (error) {
        throw new Error('Pricing fetch failed: ' + error.message);
      }

      if (!data || !data.active) {
        throw new Error('Invalid or inactive product track');
      }

      return data;
    });

    const amount = Math.round(Number(pricingData.price) * 100); // Stripe expects cents
    const name = pricingData.plan_name;
    const currency = (pricingData.currency || 'USD').toLowerCase();

    // Use environment-based URLs
    const success_url =
      process.env.STRIPE_SUCCESS_URL ||
      `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url =
      process.env.STRIPE_CANCEL_URL || `${process.env.CLIENT_URL}/cancel`;

    // Generate idempotency key (user+track+timestamp or provided)
    const idempotencyKey =
      metadata.idempotency_key ||
      crypto
        .createHash('sha256')
        .update(`${userId}-${productTrack}-${Date.now()}`)
        .digest('hex');

    // Create checkout session with retry logic
    const session = await withRetry(async () => {
      return await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name,
                  description: pricingData.features
                    ? pricingData.features.join(', ')
                    : undefined,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url,
          cancel_url,
          metadata: {
            user_id: userId,
            product_track: productTrack,
            pricing_version: 'v1.0',
            ...metadata,
          },
          automatic_tax: {
            enabled: true,
          },
          billing_address_collection: 'required',
          phone_number_collection: {
            enabled: false,
          },
        },
        {
          idempotencyKey,
        }
      );
    });

    sessionId = session.id;

    // Log successful session creation
    await logPaymentEvent({
      event_type: 'checkout_session_created',
      user_id: userId,
      amount: amount / 100, // Convert back to dollars for logging
      status: 'success',
      session_id: sessionId,
      metadata: {
        product_track: productTrack,
        currency,
        features: pricingData.features,
        processing_time_ms: Date.now() - startTime,
        idempotency_key: idempotencyKey,
        ...metadata,
      },
    });

    return session;
  } catch (error) {
    // Enhanced error context for debugging
    const errorContext = {
      user_id: userId,
      product_track: productTrack,
      session_id: sessionId,
      processing_time_ms: Date.now() - startTime,
      pricing_data: pricingData,
      metadata,
    };

    // Log failed session creation attempt
    await logPaymentEvent({
      event_type: 'checkout_session_failed',
      user_id: userId,
      amount: pricingData
        ? Math.round(Number(pricingData.price) * 100) / 100
        : null,
      status: 'failed',
      session_id: sessionId,
      metadata: {
        error_message: error.message,
        error_type: error.type || error.constructor.name,
        error_code: error.code,
        ...errorContext,
      },
    });

    // Capture error in Sentry with full context
    captureException(error, {
      tags: {
        component: 'stripe_checkout',
        operation: 'create_session',
        product_track: productTrack,
      },
      user: { id: userId },
      extra: errorContext,
    });

    // Rethrow with consistent error format
    if (error.message.includes('Pricing fetch failed')) {
      throw error; // Already has good error message
    } else if (error.message.includes('Invalid or inactive product track')) {
      throw error; // Already has good error message
    } else {
      throw new Error(
        'Stripe checkout session creation failed: ' + error.message
      );
    }
  }
}

/**
 * Retrieves a checkout session by ID
 * @param {string} sessionId - The Stripe session ID
 * @returns {Promise<Object>} Stripe session object
 */
export async function retrieveCheckoutSession(sessionId) {
  try {
    return await withRetry(async () => {
      return await stripe.checkout.sessions.retrieve(sessionId);
    });
  } catch (error) {
    captureException(error, {
      tags: { component: 'stripe_checkout', operation: 'retrieve_session' },
      extra: { session_id: sessionId },
    });
    throw new Error('Failed to retrieve checkout session: ' + error.message);
  }
}

/**
 * Creates a refund for a payment
 * @param {Object} params
 * @param {string} params.paymentIntentId - The payment intent ID
 * @param {number} params.amount - Refund amount in cents (optional, defaults to full refund)
 * @param {string} params.reason - Refund reason
 * @param {string} params.userId - User ID for logging
 * @returns {Promise<Object>} Stripe refund object
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
  userId,
}) {
  try {
    const refund = await withRetry(async () => {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer',
      };

      if (amount) {
        refundData.amount = amount;
      }

      return await stripe.refunds.create(refundData);
    });

    // Log successful refund
    await logPaymentEvent({
      event_type: 'refund_created',
      user_id: userId,
      amount: refund.amount / 100,
      status: 'success',
      session_id: null,
      metadata: {
        refund_id: refund.id,
        payment_intent_id: paymentIntentId,
        reason,
        refund_status: refund.status,
      },
    });

    return refund;
  } catch (error) {
    // Log failed refund attempt
    await logPaymentEvent({
      event_type: 'refund_failed',
      user_id: userId,
      amount: amount ? amount / 100 : null,
      status: 'failed',
      session_id: null,
      metadata: {
        payment_intent_id: paymentIntentId,
        reason,
        error_message: error.message,
      },
    });

    captureException(error, {
      tags: { component: 'stripe_checkout', operation: 'create_refund' },
      user: { id: userId },
      extra: { payment_intent_id: paymentIntentId, amount, reason },
    });

    throw new Error('Refund creation failed: ' + error.message);
  }
}

export { logPaymentEvent };
