require('../../testEnvSetup');
require('dotenv').config();

// Set required environment variables before any imports
process.env.STRIPE_SECRET_KEY_TEST = process.env.STRIPE_SECRET_KEY_TEST || 'sk_test_123';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'https://test.example.com';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Stripe completely
vi.mock('stripe', () => {
  const mockStripeInstance = {
    balance: {
      retrieve: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    refunds: {
      create: vi.fn(),
    },
  };

  return {
    default: vi.fn(() => mockStripeInstance),
  };
});

// Mock Supabase
vi.mock('../../supabase/client.js', () => ({
  default: {
    from: vi.fn((table) => {
      if (table === 'pricing') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  plan_name: 'business-plan-builder',
                  price: 99,
                  active: true,
                  currency: 'USD',
                  features: ['AI-powered business plan', 'Financial projections', 'Market analysis'],
                },
                error: null,
              }),
            })),
          })),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn(() => ({ eq: vi.fn(() => vi.fn().mockResolvedValue({ data: {}, error: null })) })),
      };
    }),
  },
}));

// Mock Sentry
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

// Import after mocks are set up
import { createCheckoutSession } from '../../services/stripeCheckout.js';
import Stripe from 'stripe';
import supabase from '../../supabase/client.js';

describe('Stripe Payment Integration', () => {
  let mockStripe;
  let mockSupabase;

  const mockSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/cs_test_123',
    amount_total: 9900,
    currency: 'usd',
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Get mocked instances
    mockStripe = vi.mocked(new Stripe(''));
    mockSupabase = vi.mocked(supabase);

    // Set up default responses
    mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);
    mockStripe.balance.retrieve.mockResolvedValue({ available: [{ amount: 1000 }] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-end checkout session creation', () => {
    it('creates session and logs to payment_logs successfully', async () => {
      const result = await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: { source: 'web_app', version: '1.0' },
      });

      // Verify session creation
      expect(result).toEqual(mockSession);
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'usd',
                product_data: expect.objectContaining({
                  name: 'business-plan-builder',
                  description: 'AI-powered business plan, Financial projections, Market analysis',
                }),
                unit_amount: 9900,
              }),
              quantity: 1,
            }),
          ]),
          mode: 'payment',
          success_url: expect.stringContaining('success'),
          cancel_url: expect.stringContaining('cancel'),
          metadata: expect.objectContaining({
            user_id: 'user_test_123',
            product_track: 'business-plan-builder',
            pricing_version: 'v1.0',
            source: 'web_app',
            version: '1.0',
          }),
          automatic_tax: {
            enabled: true,
          },
          billing_address_collection: 'required',
          phone_number_collection: {
            enabled: false,
          },
        }),
        expect.objectContaining({
          idempotencyKey: expect.any(String),
        })
      );

      // Verify Supabase logging was called
      expect(mockSupabase.from).toHaveBeenCalledWith('payment_logs');
    });

    it('handles all supported product tracks correctly', async () => {
      const productTracks = ['business-plan-builder', 'social-media-campaign', 'website-audit-feedback'];

      for (const track of productTracks) {
        // Reset and configure mock for this specific product track
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  plan_name: track,
                  price: 49.99,
                  active: true,
                  currency: 'USD',
                  features: ['Feature 1', 'Feature 2'],
                },
                error: null,
              }),
            })),
          })),
        });

        const result = await createCheckoutSession({
          productTrack: track,
          userId: 'user_test_456',
          metadata: {},
        });

        expect(result).toEqual(mockSession);
      }
    });
  });

  describe('Error handling and resilience', () => {
    it('handles Supabase database errors gracefully', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          })),
        })),
      });

      await expect(createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      })).rejects.toThrow('Pricing fetch failed: Database connection failed');
    }, 10000);

    it('handles Stripe API errors', async () => {
      // Use a non-retryable error to avoid retry delays in tests
      const stripeError = new Error('Your card was declined.');
      stripeError.type = 'StripeCardError';
      stripeError.code = 'card_declined';

      mockStripe.checkout.sessions.create.mockRejectedValueOnce(stripeError);

      await expect(createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      })).rejects.toThrow('Stripe checkout session creation failed: Your card was declined.');
    });

    it('handles invalid or inactive product configurations', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                plan_name: 'business-plan-builder',
                price: 99,
                active: false, // Inactive product
              },
              error: null,
            }),
          })),
        })),
      });

      await expect(createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      })).rejects.toThrow('Invalid or inactive product track');
    });
  });

  describe('Payment logging integration', () => {
    it('logs successful session creation to payment_logs', async () => {
      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: { campaign: 'test' },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('payment_logs');
    });

    it('logs failed session creation attempts', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Product not found' },
            }),
          })),
        })),
      });

      try {
        await createCheckoutSession({
          productTrack: 'business-plan-builder',
          userId: 'user_test_123',
          metadata: {},
        });
      } catch (error) {
        // Expected to fail
      }

      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });

  describe('Idempotency and session management', () => {
    it('generates unique idempotency keys for different requests', async () => {
      vi.clearAllMocks();

      // First request
      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second request with different user
      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_456',
        metadata: {},
      });

      // Verify different idempotency keys were used
      const calls = mockStripe.checkout.sessions.create.mock.calls;
      expect(calls[0][1].idempotencyKey).not.toBe(calls[1][1].idempotencyKey);
    });

    it('uses provided idempotency key when specified', async () => {
      const customKey = 'custom_idempotency_key_123';

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: { idempotency_key: customKey },
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          idempotencyKey: customKey,
        })
      );
    });
  });

  describe('URL configuration', () => {
    it('uses environment-based success and cancel URLs', async () => {
      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://test.example.com/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'https://test.example.com/cancel',
        }),
        expect.anything()
      );
    });

    it('falls back to CLIENT_URL when specific URLs not set', async () => {
      // Test when specific stripe URLs are not set
      delete process.env.STRIPE_SUCCESS_URL;
      delete process.env.STRIPE_CANCEL_URL;

      await createCheckoutSession({
        productTrack: 'business-plan-builder',
        userId: 'user_test_123',
        metadata: {},
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('https://test.example.com/success'),
          cancel_url: expect.stringContaining('https://test.example.com/cancel'),
        }),
        expect.anything()
      );
    });
  });
});