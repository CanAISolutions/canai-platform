import './../../testEnvSetup.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Set required environment variables before any imports
process.env.STRIPE_SECRET_KEY_TEST = process.env.STRIPE_SECRET_KEY_TEST || 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'https://test.example.com';
process.env.MEMBERSTACK_JWKS_URI = 'https://api.memberstack.com/v1/jwks';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// Mock authentication middleware for testing
vi.mock('../../middleware/auth.js', () => ({
  default: (req, res, next) => {
    // In test environment, simulate authenticated user
    req.user = { sub: 'user_test_123', email: 'test@example.com' };
    next();
  },
}));

// Mock the specific Stripe instance used by stripe.js
vi.mock('../../services/stripe.js', () => ({
  default: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
    refunds: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

// Mock Supabase
vi.mock('../../supabase/client.js', () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    })),
  },
}));

// Mock Sentry
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

// Import after mocks are set up
import express from 'express';
import stripeRouter from '../../routes/stripe.js';
import stripe from '../../services/stripe.js';
import supabase from '../../supabase/client.js';

describe('Stripe Refund Integration Tests', () => {
  let app;
  let mockStripe;
  let mockSupabase;

  const mockSession = {
    id: 'cs_test_123',
    payment_intent: 'pi_test_123',
    payment_status: 'paid',
    amount_total: 9900,
    currency: 'usd',
  };

  const mockRefund = {
    id: 're_test_123',
    amount: 9900,
    currency: 'usd',
    status: 'succeeded',
    reason: 'requested_by_customer',
    created: Math.floor(Date.now() / 1000),
    metadata: {
      user_id: 'user_test_123',
      refund_reason: 'requested_by_customer',
      created_by: 'api',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    // Register /webhook with raw parser before any JSON middleware
    app.use('/webhook', express.raw({ type: 'application/json' }), stripeRouter);
    // Register all other routes with JSON parser
    app.use(express.json());
    app.use('/', stripeRouter);

    mockStripe = stripe; // Use the mocked instance directly
    mockSupabase = supabase; // Use the mocked supabase directly

    // Set up default mock responses
    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);
    mockStripe.refunds.create.mockResolvedValue(mockRefund);
    mockStripe.refunds.retrieve.mockResolvedValue(mockRefund);

    // Mock proper Supabase chaining
    const mockUpdate = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }));
    const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null });
    
    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
    });

    // Mock webhook event construction
    mockStripe.webhooks.constructEvent.mockImplementation((body, sig, secret) => {
      const payload = JSON.parse(body.toString());
      return payload;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /refund - Secure refund endpoint (Requirement 1)', () => {
    it('successfully creates a full refund with authentication', async () => {
      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(200);

      expect(response.body).toEqual({
        refund: {
          id: 're_test_123',
          amount: 9900,
          currency: 'usd',
          status: 'succeeded',
          reason: 'requested_by_customer',
        },
      });

      // Verify Stripe refund was created with correct parameters
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        reason: 'requested_by_customer',
        metadata: {
          user_id: 'user_test_123',
          refund_reason: 'requested_by_customer',
          created_by: 'api',
        },
      });

      // Verify payment logs were updated
      expect(mockSupabase.from).toHaveBeenCalledWith('payment_logs');
    });

    it('successfully creates a partial refund', async () => {
      const refundRequest = {
        session_id: 'cs_test_123',
        amount: 5000, // Partial refund of $50
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(200);

      // Verify partial refund amount was passed to Stripe
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        reason: 'requested_by_customer',
        amount: 5000,
        metadata: {
          user_id: 'user_test_123',
          refund_reason: 'requested_by_customer',
          created_by: 'api',
        },
      });
    });

    it('validates input and rejects invalid requests', async () => {
      const invalidRequest = {
        // Missing required session_id
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('session_id');
    });

    it('handles payment not found error', async () => {
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        payment_intent: null,
      });

      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(400);

      expect(response.body.error.code).toBe('NO_PAYMENT_FOUND');
    });

    it('handles payment not completed error', async () => {
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        payment_status: 'open',
      });

      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(400);

      expect(response.body.error.code).toBe('PAYMENT_NOT_COMPLETED');
    });
  });

  describe('GET /refund/:refundId/status - Refund status checking (Requirement 5)', () => {
    it('successfully retrieves refund status for authorized user', async () => {
      const response = await request(app)
        .get('/refund/re_test_123/status')
        .expect(200);

      expect(response.body).toEqual({
        refund: {
          id: 're_test_123',
          amount: 9900,
          currency: 'usd',
          status: 'succeeded',
          reason: 'requested_by_customer',
          created: expect.any(Number),
          metadata: {
            user_id: 'user_test_123',
            refund_reason: 'requested_by_customer',
            created_by: 'api',
          },
        },
      });

      expect(mockStripe.refunds.retrieve).toHaveBeenCalledWith('re_test_123');
    });

    it('validates refund ID format', async () => {
      const response = await request(app)
        .get('/refund/invalid_id/status')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_REFUND_ID');
    });

    it('handles refund not found', async () => {
      mockStripe.refunds.retrieve.mockRejectedValue(
        new Error('No such refund: re_test_456')
      );

      const response = await request(app)
        .get('/refund/re_test_456/status')
        .expect(404);

      expect(response.body.error.code).toBe('REFUND_NOT_FOUND');
    });

    it('enforces authorization - user can only view their own refunds', async () => {
      // Mock refund belonging to different user
      mockStripe.refunds.retrieve.mockResolvedValue({
        ...mockRefund,
        metadata: { user_id: 'other_user_123' },
      });

      const response = await request(app)
        .get('/refund/re_test_123/status')
        .expect(403);

      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('POST /webhook - Refund webhook handling (Requirement 4)', () => {
    // Function to generate proper webhook signature like Stripe does
    function generateWebhookSignature(payload, secret, timestamp) {
      // Remove 'whsec_' prefix if present
      const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
      
      // Create the signed payload format that Stripe uses
      const signedPayload = `${timestamp}.${payload}`;
      
      // Generate HMAC-SHA256 signature
      const signature = crypto
        .createHmac('sha256', cleanSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');
      
      // Return in Stripe's expected format
      return `t=${timestamp},v1=${signature}`;
    }

    beforeEach(() => {
      // Mock webhook event construction
      mockStripe.webhooks.constructEvent.mockImplementation((body, sig, secret) => {
        const payload = JSON.parse(body.toString());
        return payload;
      });
    });

    it('handles charge.refunded webhook event', async () => {
      const mockEvent = {
        id: 'evt_refund_123',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_123',
            amount: 5000,
            metadata: { user_id: 'user_123' },
            refund: {
              id: 're_test_123',
              status: 'succeeded'
            }
          }
        }
      };

      const payload = JSON.stringify(mockEvent);
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateWebhookSignature(payload, process.env.STRIPE_WEBHOOK_SECRET, timestamp);

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
    });

    it('handles charge.dispute.created webhook event', async () => {
      const mockEvent = {
        id: 'evt_dispute_123',
        type: 'charge.dispute.created',
        data: {
          object: {
            id: 'dp_test_123',
            amount: 5000,
            reason: 'credit_not_processed',
            status: 'warning_needs_response',
            metadata: { user_id: 'user_123' }
          }
        }
      };

      const payload = JSON.stringify(mockEvent);
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateWebhookSignature(payload, process.env.STRIPE_WEBHOOK_SECRET, timestamp);

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
    });

    it('rejects webhook with invalid signature', async () => {
      // Simulate signature verification failure
      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const mockEvent = {
        id: 'evt_invalid_123',
        type: 'charge.refunded',
        data: { object: { id: 'ch_test_invalid' } }
      };

      const payload = JSON.stringify(mockEvent);
      const invalidSignature = 't=123,v1=invalid_signature';

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', invalidSignature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Webhook signature verification failed');
    });

    it('handles unknown webhook events gracefully', async () => {
      const mockEvent = {
        id: 'evt_unknown_123',
        type: 'unknown.event.type',
        data: { object: { id: 'obj_test_123' } }
      };

      const payload = JSON.stringify(mockEvent);
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateWebhookSignature(payload, process.env.STRIPE_WEBHOOK_SECRET, timestamp);

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
    });
  });

  describe('Error handling and retry logic (Requirement 7)', () => {
    it('retries on retryable Stripe errors', async () => {
      // Mock the createRefund to use the service layer's retry mechanism
      const { createRefund } = await import('../../services/stripeCheckout.js');
      
      // Mock temporary failure followed by success
      mockStripe.refunds.create
        .mockRejectedValueOnce(Object.assign(new Error('Rate limit exceeded'), { type: 'StripeAPIError', code: 'rate_limit' }))
        .mockResolvedValueOnce(mockRefund);

      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(200);

      expect(response.body.refund.id).toBe('re_test_123');
      expect(mockStripe.refunds.create).toHaveBeenCalledTimes(2);
    });

    it('handles non-retryable errors immediately', async () => {
      mockStripe.refunds.create.mockRejectedValue(
        Object.assign(new Error('This payment has already been refunded'), {
          type: 'StripeInvalidRequestError',
          statusCode: 400,
        })
      );

      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'requested_by_customer',
        user_id: 'user_test_123',
      };

      const response = await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(400);

      expect(response.body.error.code).toBe('ALREADY_REFUNDED');
      expect(mockStripe.refunds.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audit logging (Requirement 8)', () => {
    it('logs all refund operations to Supabase', async () => {
      const refundRequest = {
        session_id: 'cs_test_123',
        reason: 'duplicate',
        user_id: 'user_test_123',
      };

      await request(app)
        .post('/refund')
        .send(refundRequest)
        .expect(200);

      // Verify comprehensive logging
      expect(mockSupabase.from).toHaveBeenCalledWith('payment_logs');
      
      // Verify update call was made for payment status
      const mockUpdateFn = mockSupabase.from().update;
      expect(mockUpdateFn).toHaveBeenCalledWith({
        status: 'refunded',
        metadata: {
          refund_id: 're_test_123',
          refund_status: 'succeeded',
          refund_reason: 'duplicate',
          refund_amount: 99,
        },
      });
    });
  });
}); 