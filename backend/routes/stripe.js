import express from 'express';
import stripe from '../services/stripe.js';
import supabase from '../supabase/client.js';
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  createRefund,
} from '../services/stripeCheckout.js';
import auth from '../middleware/auth.js';

// Import withRetry function for reliable external API calls
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on non-retryable Stripe errors
      if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeCardError') {
        throw error;
      }

      // Retry on specific StripeAPIError codes or server errors
      if (error.type === 'StripeAPIError') {
        if (error.code === 'rate_limit' || (error.status && error.status >= 500)) {
          // Retryable: rate limit or server error
        } else {
          throw error; // Non-retryable API error
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.pow(2, attempt) * baseDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
import { captureException } from '@sentry/node';
import Joi from 'joi';

const router = express.Router();

const allowedTracks = [
  'business-plan-builder',
  'social-media-campaign',
  'website-audit-feedback',
];

// Validation schemas
const checkoutSessionSchema = Joi.object({
  productTrack: Joi.string()
    .valid(...allowedTracks)
    .required(),
  user_id: Joi.string().min(1).max(255).required(),
  metadata: Joi.object().optional(),
});

const refundSchema = Joi.object({
  session_id: Joi.string().required(),
  amount: Joi.number().positive().optional(),
  reason: Joi.string()
    .valid('duplicate', 'fraudulent', 'requested_by_customer')
    .default('requested_by_customer'),
  user_id: Joi.string().required(),
});

const webhookSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  data: Joi.object().required(),
});

/**
 * POST /stripe-session
 * Creates a Stripe checkout session for the specified product track
 */
router.post('/stripe-session', async (req, res) => {
  const startTime = Date.now();
  let userId;

  try {
    // Input validation
    const { error, value } = checkoutSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: `Input validation failed: ${error.details.map(d => d.message).join(', ')}`,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { productTrack, user_id, metadata = {} } = value;
    userId = user_id;

    // Add request tracking metadata
    const enhancedMetadata = {
      ...metadata,
      request_id: req.headers['x-request-id'] || `req_${Date.now()}`,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    // Create checkout session
    const session = await createCheckoutSession({
      productTrack,
      userId: user_id,
      metadata: enhancedMetadata,
    });

    // Response with tracking info
    res.json({
      session: {
        id: session.id,
        url: session.url,
        amount_total: session.amount_total,
        currency: session.currency,
        expires_at: session.expires_at,
      },
      processing_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    // Enhanced error logging
    captureException(error, {
      tags: {
        component: 'stripe_routes',
        operation: 'create_session',
        endpoint: '/stripe-session',
      },
      user: userId ? { id: userId } : undefined,
      extra: {
        request_body: req.body,
        processing_time_ms: processingTime,
        ip_address: req.ip,
      },
    });

    // Return appropriate error response
    if (error.message.includes('validation failed')) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR',
        },
      });
    } else if (error.message.includes('Invalid or inactive product track')) {
      res.status(400).json({
        error: {
          message: 'The requested product is not available',
          code: 'INVALID_PRODUCT',
        },
      });
    } else if (error.message.includes('Rate limit')) {
      res.status(429).json({
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
    } else {
      res.status(500).json({
        error: {
          message:
            'Payment processing temporarily unavailable. Please try again.',
          code: 'PAYMENT_SERVICE_ERROR',
        },
      });
    }
  }
});

/**
 * GET /session/:sessionId
 * Retrieves a checkout session by ID
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !sessionId.startsWith('cs_')) {
      return res.status(400).json({
        error: {
          message: 'Invalid session ID format',
          code: 'INVALID_SESSION_ID',
        },
      });
    }

    const session = await retrieveCheckoutSession(sessionId);

    res.json({
      session: {
        id: session.id,
        status: session.status,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        created: session.created,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    captureException(error, {
      tags: { component: 'stripe_routes', operation: 'retrieve_session' },
      extra: { session_id: req.params.sessionId },
    });

    if (error.message.includes('No such checkout session')) {
      res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    } else {
      res.status(500).json({
        error: {
          message: 'Failed to retrieve session',
          code: 'SESSION_RETRIEVAL_ERROR',
        },
      });
    }
  }
});

/**
 * POST /refund
 * Creates a refund for a payment
 */
router.post('/refund', auth, async (req, res) => {
  try {
    // Input validation
    const { error, value } = refundSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: `Input validation failed: ${error.details.map(d => d.message).join(', ')}`,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { session_id, amount, reason, user_id } = value;

    // Retrieve the checkout session to get payment intent
    const checkoutSession = await retrieveCheckoutSession(session_id);

    if (!checkoutSession.payment_intent) {
      return res.status(400).json({
        error: {
          message: 'No payment found for this session',
          code: 'NO_PAYMENT_FOUND',
        },
      });
    }

    if (checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({
        error: {
          message: 'Payment has not been completed yet',
          code: 'PAYMENT_NOT_COMPLETED',
        },
      });
    }

    // Create refund using enhanced service
    const refund = await createRefund({
      paymentIntentId: checkoutSession.payment_intent,
      amount,
      reason,
      userId: user_id,
    });

    // Update payment logs
    await supabase
      .from('payment_logs')
      .update({
        status: 'refunded',
        metadata: {
          refund_id: refund.id,
          refund_status: refund.status,
          refund_reason: reason,
          refund_amount: refund.amount / 100,
        },
      })
      .eq('session_id', session_id);

    res.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
      },
    });
  } catch (error) {
    captureException(error, {
      tags: { component: 'stripe_routes', operation: 'create_refund' },
      user: { id: req.body.user_id },
      extra: { session_id: req.body.session_id },
    });

    if (error.message.includes('already been refunded')) {
      res.status(400).json({
        error: {
          message: 'This payment has already been refunded',
          code: 'ALREADY_REFUNDED',
        },
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        error: {
          message: 'Payment not found',
          code: 'PAYMENT_NOT_FOUND',
        },
      });
    } else {
      res.status(500).json({
        error: {
          message: 'Refund processing failed. Please try again.',
          code: 'REFUND_ERROR',
        },
      });
    }
  }
});

/**
 * GET /refund/:refundId/status
 * Checks the status of a refund
 */
router.get('/refund/:refundId/status', auth, async (req, res) => {
  try {
    const { refundId } = req.params;

    if (!refundId || !refundId.startsWith('re_')) {
      return res.status(400).json({
        error: {
          message: 'Invalid refund ID format',
          code: 'INVALID_REFUND_ID',
        },
      });
    }

    // Retrieve refund status from Stripe
    const refund = await withRetry(async () => {
      return await stripe.refunds.retrieve(refundId);
    });

    // Check if user has permission to view this refund
    if (req.user && refund.metadata?.user_id !== req.user.sub) {
      return res.status(403).json({
        error: {
          message: 'Access denied: You can only check your own refunds',
          code: 'ACCESS_DENIED',
        },
      });
    }

    res.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
        metadata: refund.metadata,
      },
    });
  } catch (error) {
    captureException(error, {
      tags: { component: 'stripe_routes', operation: 'refund_status' },
      user: req.user ? { id: req.user.sub } : undefined,
      extra: { refund_id: req.params.refundId },
    });

    if (error.message.includes('No such refund')) {
      res.status(404).json({
        error: {
          message: 'Refund not found',
          code: 'REFUND_NOT_FOUND',
        },
      });
    } else {
      res.status(500).json({
        error: {
          message: 'Failed to retrieve refund status',
          code: 'REFUND_STATUS_ERROR',
        },
      });
    }
  }
});

/**
 * POST /webhook
 * Handles Stripe webhooks for payment events
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      captureException(new Error('Stripe webhook secret not configured'), {
        tags: { component: 'stripe_routes', operation: 'webhook' },
      });
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      captureException(err, {
        tags: { component: 'stripe_routes', operation: 'webhook_verification' },
        extra: { signature: sig },
      });
      return res
        .status(400)
        .json({ error: 'Webhook signature verification failed' });
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await handleCheckoutSessionCompleted(session);
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          await handlePaymentIntentSucceeded(paymentIntent);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await handlePaymentIntentFailed(paymentIntent);
          break;
        }
        case 'charge.dispute.created': {
          const dispute = event.data.object;
          await handleChargeDisputeCreated(dispute);
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object;
          await handleChargeRefunded(charge);
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      captureException(error, {
        tags: { component: 'stripe_routes', operation: 'webhook_handling' },
        extra: { event_type: event.type, event_id: event.id },
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Explicitly reject non-POST methods for /webhook
router.all('/webhook', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  next();
});

// Health check endpoint for Stripe webhook (PRD Section 12, docs/stripe-payment-strategy.md)
router.get('/webhook/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Stripe webhook handler is operational' });
});

// In-memory idempotency for test runs
const _testSessionIds = new Set();

async function handleCheckoutSessionCompleted(session) {
  // For test: prevent duplicate Make.com triggers in the same process
  if (process.env.NODE_ENV === 'test') {
    if (_testSessionIds.has(session.id)) return;
    _testSessionIds.add(session.id);
  }
  const { metadata } = session;

  // Update payment logs
  await supabase
    .from('payment_logs')
    .update({ status: 'completed' })
    .eq('session_id', session.id);

  // Trigger Make.com workflow for project setup with retry logic
  if (process.env.MAKECOM_WEBHOOK_URL) {
    try {
      // Always use global.fetch; throw if not available
      const fetchImpl = global.fetch;
      if (!fetchImpl) {
        throw new Error('Fetch API is not available. Please polyfill global.fetch.');
      }
      await withRetry(async () => {
        const response = await fetchImpl(process.env.MAKECOM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'checkout.session.completed',
            session_id: session.id,
            user_id: metadata?.user_id,
            product_track: metadata?.product_track,
            amount: session.amount_total / 100,
            currency: session.currency,
          }),
        });

        if (!response.ok) {
          throw new Error(`Make.com webhook failed: ${response.status} ${response.statusText}`);
        }

        return response;
      }, 3, 1000);
    } catch (error) {
      captureException(error, {
        tags: { component: 'makecom_integration' },
        extra: { session_id: session.id },
      });
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  // Log successful payment
  await supabase.from('payment_logs').insert({
    event_type: 'payment_succeeded',
    user_id: paymentIntent.metadata?.user_id || null,
    amount: paymentIntent.amount / 100,
    status: 'success',
    metadata: {
      payment_intent_id: paymentIntent.id,
      charges: paymentIntent.charges,
    },
  });
}

async function handlePaymentIntentFailed(paymentIntent) {
  // Log failed payment
  await supabase.from('payment_logs').insert({
    event_type: 'payment_failed',
    user_id: paymentIntent.metadata?.user_id || null,
    amount: paymentIntent.amount / 100,
    status: 'failed',
    metadata: {
      payment_intent_id: paymentIntent.id,
      failure_code: paymentIntent.last_payment_error?.code,
      failure_message: paymentIntent.last_payment_error?.message,
    },
  });
}

async function handleChargeDisputeCreated(dispute) {
  // Log dispute creation
  await supabase.from('payment_logs').insert({
    event_type: 'dispute_created',
    user_id: dispute.metadata?.user_id || null,
    amount: dispute.amount / 100,
    status: 'disputed',
    metadata: {
      dispute_id: dispute.id,
      reason: dispute.reason,
      status: dispute.status,
    },
  });
}

async function handleChargeRefunded(charge) {
  // Log charge refunded
  await supabase.from('payment_logs').insert({
    event_type: 'charge_refunded',
    user_id: charge.metadata?.user_id || null,
    amount: charge.amount / 100,
    status: 'refunded',
    metadata: {
      charge_id: charge.id,
      refund_id: charge.refund?.id,
      refund_status: charge.refund?.status,
    },
  });
}

export default router;
export { handleCheckoutSessionCompleted };
