require('../../testEnvSetup');
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Set environment variables first
process.env.STRIPE_SECRET_KEY_TEST = 'sk_test_123';
process.env.NODE_ENV = 'test';

// Declare mock functions first to avoid hoisting issues
const mockStripeBalance = vi.fn();
const mockStripeCheckoutSessions = {
  create: vi.fn(),
  retrieve: vi.fn(),
};
const mockStripeRefunds = {
  create: vi.fn(),
};

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    balance: {
      retrieve: mockStripeBalance,
    },
    checkout: {
      sessions: mockStripeCheckoutSessions,
    },
    refunds: mockStripeRefunds,
  })),
}));

// Mock Supabase - ensure successful responses for most tests
const mockSupabaseInsert = vi.fn().mockResolvedValue({ data: {}, error: null });
const mockSupabaseSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: {
        plan_name: 'business-plan-builder',
        price: 99.99,
        active: true,
        currency: 'USD',
        features: ['Feature 1', 'Feature 2'],
      },
      error: null,
    }),
  }),
});
const mockSupabaseFrom = vi.fn().mockImplementation((table) => {
  if (table === 'payment_logs') {
    return { insert: mockSupabaseInsert };
  }
  if (table === 'pricing') {
    return { select: mockSupabaseSelect };
  }
  return {};
});

vi.mock('../../supabase/client.js', () => ({
  default: {
    from: mockSupabaseFrom,
  },
}));

// Mock Sentry
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

describe('Stripe Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY_TEST = 'sk_test_123';
    process.env.NODE_ENV = 'test';

    // Reset Supabase mock to successful responses for each test
    mockSupabaseSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            plan_name: 'business-plan-builder',
            price: 99.99,
            active: true,
            currency: 'USD',
            features: ['Feature 1', 'Feature 2'],
          },
          error: null,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Stripe Client Initialization', () => {
    it('initializes Stripe client successfully', async () => {
      const stripeModule = await import('../../services/stripe.js');
      expect(stripeModule.default).toBeDefined();
    });

    it('tests Stripe connection successfully', async () => {
      mockStripeBalance.mockResolvedValue({
        available: [{ amount: 1000 }],
      });

      const { testStripeConnection } = await import('../../services/stripe.js');
      const result = await testStripeConnection();
      expect(result).toBe(true);
      expect(mockStripeBalance).toHaveBeenCalled();
    });

    it('handles connection failures', async () => {
      mockStripeBalance.mockRejectedValue(new Error('Network error'));

      const { testStripeConnection } = await import('../../services/stripe.js');
      await expect(testStripeConnection()).rejects.toThrow('Stripe connection test failed: Network error');
    });
  });

  describe('Stripe Checkout Service', () => {
    let createCheckoutSession;

    beforeEach(async () => {
      const module = await import('../../services/stripeCheckout.js');
      createCheckoutSession = module.createCheckoutSession;
    });

    it('creates checkout session successfully', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const result = await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      expect(result.id).toBe('cs_test_123');
      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'usd',
                unit_amount: 9999,
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          idempotencyKey: expect.any(String),
        })
      );
    });

    it('handles different product tracks', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      });

      const productTracks = [
        'business-plan-builder',
        'social-media-campaign',
        'website-audit-feedback',
      ];

      for (const track of productTracks) {
        await createCheckoutSession({
          productTrack: track,
          userId: 'user_test_123',
          metadata: {},
        });
      }

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledTimes(3);
    });

    it('includes metadata in checkout session', async () => {
      const metadata = {
        customField: 'customValue',
        userId: 'user_test_123',
      };

      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/pay/cs_test_789',
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata,
      });

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            user_id: 'user_test_123',
            product_track: 'business-plan-builder',
            customField: 'customValue',
          }),
        }),
        expect.anything()
      );
    });

    it('handles Stripe API errors', async () => {
      mockStripeCheckoutSessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      await expect(
        createCheckoutSession({
          productTrack: 'business-plan-builder',
          userId: 'user_test_123',
          metadata: {},
        })
      ).rejects.toThrow('Stripe checkout session creation failed');
    });

    it('validates pricing data from Supabase', async () => {
      // Override the default successful mock for this specific test
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Product not found' },
          }),
        }),
      });

      await expect(
        createCheckoutSession({
          productTrack: 'invalid-product',
          userId: 'user_test_123',
          metadata: {},
        })
      ).rejects.toThrow('Pricing fetch failed');
    });

    it('logs payment events to Supabase', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_logging',
        url: 'https://checkout.stripe.com/pay/cs_test_logging',
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'checkout_session_created',
          user_id: 'user_test_123',
          amount: 99.99,
          status: 'success',
          session_id: 'cs_test_logging',
        })
      );
    });

    it('generates unique idempotency keys', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_idempotency',
        url: 'https://checkout.stripe.com/pay/cs_test_idempotency',
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_456',
        metadata: {},
      });

      const calls = mockStripeCheckoutSessions.create.mock.calls;
      const idempotencyKey1 = calls[0][1].idempotencyKey;
      const idempotencyKey2 = calls[1][1].idempotencyKey;

      expect(idempotencyKey1).not.toBe(idempotencyKey2);
    });

    it('uses provided idempotency key when specified', async () => {
      const customIdempotencyKey = 'custom_key_123';
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_custom_key',
        url: 'https://checkout.stripe.com/pay/cs_test_custom_key',
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: { idempotency_key: customIdempotencyKey },
      });

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          idempotencyKey: customIdempotencyKey,
        })
      );
    });

    it('configures automatic tax and billing address collection', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_config',
        url: 'https://checkout.stripe.com/pay/cs_test_config',
      });

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          automatic_tax: { enabled: true },
          billing_address_collection: 'required',
          phone_number_collection: { enabled: false },
        }),
        expect.anything()
      );
    });

    describe('Correlation ID propagation', () => {
      it('passes metadata.correlation_id through to Stripe', async () => {
        const correlationId = 'corr_123';
        mockStripeCheckoutSessions.create.mockResolvedValue({
          id: 'cs_test_correlation',
          url: 'https://checkout.stripe.com/pay/cs_test_correlation',
        });

        await createCheckoutSession({
          productTrack: 'business-plan-builder',
          userId: 'user_123',
          metadata: { correlation_id: correlationId },
        });

        expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({ correlation_id: correlationId }),
          }),
          expect.any(Object)
        );
      });

      it('handles missing correlation_id gracefully', async () => {
        mockStripeCheckoutSessions.create.mockResolvedValue({
          id: 'cs_test_no_correlation',
          url: 'https://checkout.stripe.com/pay/cs_test_no_correlation',
        });

        await createCheckoutSession({
          productTrack: 'business-plan-builder',
          userId: 'user_123',
          metadata: {},
        });

        expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              user_id: 'user_123',
              product_track: 'business-plan-builder',
            }),
          }),
          expect.any(Object)
        );
      });
    });

    describe('Retry logic on transient failures', () => {
      it('retries once when a transient error is thrown', async () => {
        const transientError = new Error('Temporary failure');
        transientError.type = 'StripeAPIError';
        transientError.code = 'rate_limit';

        mockStripeCheckoutSessions.create
          .mockRejectedValueOnce(transientError)
          .mockResolvedValueOnce({ id: 'cs_test_retry', url: 'https://checkout.stripe.com/pay/cs_test_retry' });

        const result = await createCheckoutSession({
          productTrack: 'business-plan-builder',
          userId: 'user_123',
          metadata: {},
        });

        expect(result.id).toBe('cs_test_retry');
        expect(mockStripeCheckoutSessions.create).toHaveBeenCalledTimes(2);
      });

      it('does not retry on non-retryable errors', async () => {
        const nonRetryableError = new Error('Card declined');
        nonRetryableError.type = 'StripeCardError';
        nonRetryableError.code = 'card_declined';

        mockStripeCheckoutSessions.create.mockRejectedValue(nonRetryableError);

        await expect(
          createCheckoutSession({
            productTrack: 'business-plan-builder',
            userId: 'user_123',
            metadata: {},
          })
        ).rejects.toThrow('Card declined');

        expect(mockStripeCheckoutSessions.create).toHaveBeenCalledTimes(1);
      });

      it('exhausts retry attempts and throws final error', async () => {
        const transientError = new Error('Rate limit exceeded');
        transientError.type = 'StripeAPIError';
        transientError.code = 'rate_limit';

        mockStripeCheckoutSessions.create.mockRejectedValue(transientError);

        await expect(
          createCheckoutSession({
            productTrack: 'business-plan-builder',
            userId: 'user_123',
            metadata: {},
          })
        ).rejects.toThrow('Rate limit exceeded');

        // Should be called 4 times: initial + 3 retries
        expect(mockStripeCheckoutSessions.create).toHaveBeenCalledTimes(4);
      }, 10000); // Increase timeout to 10 seconds to account for retry delays
    });
  });
});
