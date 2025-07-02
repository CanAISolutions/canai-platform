// Mock Stripe instance used by the router
let mockStripeWebhooksConstructEvent = vi.fn();
vi.mock('../../services/stripe.js', () => ({
  default: {
    webhooks: {
      constructEvent: mockStripeWebhooksConstructEvent,
    },
  },
}));

// Mock Supabase with stable mocks for update/insert/eq
const mockEq = vi.fn(() => Promise.resolve({ data: {}, error: null }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => Promise.resolve({ data: {}, error: null }));
const stableMockSupabase = {
  update: mockUpdate,
  insert: mockInsert,
};
const mockSupabaseFrom = vi.fn(() => stableMockSupabase);
vi.mock('../../supabase/client.js', () => ({
  default: {
    from: mockSupabaseFrom,
  },
}));

// Mock Sentry
const mockCaptureException = vi.fn();
vi.mock('@sentry/node', () => ({
  captureException: mockCaptureException,
}));

require('../../testEnvSetup');
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

let express, request, raw, stripeRouter, app;

beforeAll(async () => {
  express = (await import('express')).default;
  request = (await import('supertest')).default;
  raw = (await import('express')).raw;
  stripeRouter = (await import('../../routes/stripe.js')).default;

  app = express();
  app.use(express.json());
  app.use(stripeRouter);
});

// Mock fetch for Make.com webhook
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Stripe Webhook Handler', () => {
  const STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  let originalEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockClear();
    mockInsert.mockClear();
    mockEq.mockClear();
    mockSupabaseFrom.mockClear();
    originalEnv = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET;
    process.env.MAKECOM_WEBHOOK_URL = 'https://make.com/test-webhook';
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    delete process.env.MAKECOM_WEBHOOK_URL;
  });

  it('should return 500 if STRIPE_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const payload = JSON.stringify({ id: 'evt_test', type: 'some.event' });
    const signature = 't=123,v1=mock_signature';

    const res = await request(app)
      .post('/webhook')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(Buffer.from(payload));

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Webhook not configured');
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { component: 'stripe_routes', operation: 'webhook' },
      })
    );
  });

  it('should return 400 if signature verification fails', async () => {
    const payload = JSON.stringify({ id: 'evt_test', type: 'some.event' });
    const signature = 't=123,v1=invalid_signature';

    mockStripeWebhooksConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload.');
    });

    const res = await request(app)
      .post('/webhook')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(Buffer.from(payload));

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Webhook signature verification failed');
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { component: 'stripe_routes', operation: 'webhook_verification' },
        extra: { signature: signature },
      })
    );
  });

  describe('Event Handling', () => {
    it('should handle checkout.session.completed event', async () => {
      const mockSession = {
        id: 'cs_test_123',
        metadata: { user_id: 'user_123', product_track: 'business-plan-builder' },
        amount_total: 9900,
        currency: 'usd',
      };
      const mockEvent = {
        id: 'evt_session_completed',
        type: 'checkout.session.completed',
        data: { object: mockSession },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 }); // Mock Make.com success

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(mockSupabaseFrom).toHaveBeenCalledWith('payment_logs');
      expect(mockSupabaseFrom().update).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockSupabaseFrom().update().eq).toHaveBeenCalledWith('session_id', mockSession.id);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        process.env.MAKECOM_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            event: 'checkout.session.completed',
            session_id: mockSession.id,
            user_id: mockSession.metadata.user_id,
            product_track: mockSession.metadata.product_track,
            amount: 99,
            currency: 'usd',
          }),
        })
      );
      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        amount: 10000,
        currency: 'usd',
        metadata: { user_id: 'user_456' },
        charges: { data: [{ id: 'ch_test_123' }] },
      };
      const mockEvent = {
        id: 'evt_payment_succeeded',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntent },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(mockSupabaseFrom).toHaveBeenCalledWith('payment_logs');
      expect(mockSupabaseFrom().insert).toHaveBeenCalledWith({
        event_type: 'payment_succeeded',
        user_id: mockPaymentIntent.metadata.user_id,
        amount: 100,
        status: 'success',
        metadata: {
          payment_intent_id: mockPaymentIntent.id,
          charges: mockPaymentIntent.charges,
        },
      });
      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_failed_123',
        amount: 5000,
        currency: 'usd',
        metadata: { user_id: 'user_789' },
        last_payment_error: { code: 'card_declined', message: 'Your card was declined.' },
      };
      const mockEvent = {
        id: 'evt_payment_failed',
        type: 'payment_intent.payment_failed',
        data: { object: mockPaymentIntent },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(mockSupabaseFrom).toHaveBeenCalledWith('payment_logs');
      expect(mockSupabaseFrom().insert).toHaveBeenCalledWith({
        event_type: 'payment_failed',
        user_id: mockPaymentIntent.metadata.user_id,
        amount: 50,
        status: 'failed',
        metadata: {
          payment_intent_id: mockPaymentIntent.id,
          failure_code: mockPaymentIntent.last_payment_error.code,
          failure_message: mockPaymentIntent.last_payment_error.message,
        },
      });
      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should handle charge.dispute.created event', async () => {
      const mockDispute = {
        id: 'dp_test_123',
        amount: 7500,
        currency: 'usd',
        reason: 'fraudulent',
        status: 'needs_response',
        metadata: { user_id: 'user_abc' },
      };
      const mockEvent = {
        id: 'evt_dispute_created',
        type: 'charge.dispute.created',
        data: { object: mockDispute },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(mockSupabaseFrom).toHaveBeenCalledWith('payment_logs');
      expect(mockSupabaseFrom().insert).toHaveBeenCalledWith({
        event_type: 'dispute_created',
        user_id: mockDispute.metadata.user_id,
        amount: 75,
        status: 'disputed',
        metadata: {
          dispute_id: mockDispute.id,
          reason: mockDispute.reason,
          status: mockDispute.status,
        },
      });
      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should log and ignore unhandled event types', async () => {
      const mockEvent = {
        id: 'evt_unhandled',
        type: 'customer.created',
        data: { object: { id: 'cus_test_123' } },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(consoleSpy).toHaveBeenCalledWith(`Unhandled event type: ${mockEvent.type}`);
      expect(mockSupabaseFrom).not.toHaveBeenCalled(); // No database interaction for unhandled events
      expect(mockCaptureException).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should capture exception if an event handler fails', async () => {
      const mockSession = {
        id: 'cs_test_error',
        metadata: { user_id: 'user_error' },
        amount_total: 10000,
        currency: 'usd',
      };
      const mockEvent = {
        id: 'evt_session_completed_error',
        type: 'checkout.session.completed',
        data: { object: mockSession },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      mockSupabaseFrom.mockImplementationOnce(() => ({ // Make update fail
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.reject(new Error('Supabase update failed'))),
        })),
      }));

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Webhook processing failed');
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: { component: 'stripe_routes', operation: 'webhook_handling' },
          extra: { event_type: mockEvent.type, event_id: mockEvent.id },
        })
      );
    });

    it('should capture exception if Make.com webhook fails after retries', async () => {
      const mockSession = {
        id: 'cs_test_make_fail',
        metadata: { user_id: 'user_make_fail', product_track: 'business-plan-builder' },
        amount_total: 9900,
        currency: 'usd',
      };
      const mockEvent = {
        id: 'evt_make_fail',
        type: 'checkout.session.completed',
        data: { object: mockSession },
      };
      const payload = JSON.stringify(mockEvent);
      const signature = 't=123,v1=mock_signature';

      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);
      // Mock fetch to fail consistently
      mockFetch.mockRejectedValue(new Error('Make.com network error'));

      const res = await request(app)
        .post('/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(Buffer.from(payload));

      expect(res.statusCode).toBe(200); // Webhook itself should still return 200
      expect(res.body).toEqual({ received: true });
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: { component: 'makecom_integration' },
          extra: { session_id: mockSession.id },
        })
      );
    }, 15000); // Increased timeout for retries
  });
});

describe('Sensitive data redaction in payment logs', () => {
  it('should redact sensitive fields from metadata before logging', async () => {
    const { logPaymentEvent } = await import('../../services/stripeCheckout.js');
    const sensitiveMetadata = {
      card_number: '4242424242424242',
      cvc: '123',
      email: 'user@example.com',
      name: 'John Doe',
      nested: { ssn: '123-45-6789', address: '123 Main St' },
      allowed: 'safe',
    };
    await logPaymentEvent({
      event_type: 'test_event',
      user_id: 'user_test',
      amount: 100,
      status: 'success',
      session_id: 'sess_test',
      metadata: sensitiveMetadata,
    });
    // The mockSupabaseFrom().insert should have been called with redacted metadata
    const call = mockSupabaseFrom().insert.mock.calls.find(c => c[0].event_type === 'test_event');
    expect(call).toBeDefined();
    const logged = call[0];
    expect(logged.metadata.card_number).toBeUndefined();
    expect(logged.metadata.cvc).toBeUndefined();
    expect(logged.metadata.email).toBeUndefined();
    expect(logged.metadata.name).toBeUndefined();
    expect(logged.metadata.nested.ssn).toBeUndefined();
    expect(logged.metadata.nested.address).toBeUndefined();
    expect(logged.metadata.allowed).toBe('safe');
  });
});

describe('HTTP method restrictions on /webhook', () => {
  it('should return 405 for GET', async () => {
    const res = await request(app).get('/webhook');
    expect(res.statusCode).toBe(405);
    expect(res.body.error).toBe('Method Not Allowed');
  });
  it('should return 405 for PUT', async () => {
    const res = await request(app).put('/webhook');
    expect(res.statusCode).toBe(405);
    expect(res.body.error).toBe('Method Not Allowed');
  });
  it('should return 405 for DELETE', async () => {
    const res = await request(app).delete('/webhook');
    expect(res.statusCode).toBe(405);
    expect(res.body.error).toBe('Method Not Allowed');
  });
});
