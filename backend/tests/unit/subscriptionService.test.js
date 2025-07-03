import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe and Sentry
vi.mock('../../services/stripeSubscription.js', () => {
  return {
    stripe: {
      subscriptions: {
        create: vi.fn(async (params, opts) => ({ id: 'sub_test', ...params, ...opts })),
        update: vi.fn(async (id, params, opts) => ({ id, ...params, ...opts })),
        del: vi.fn(async (id, opts) => ({ id, status: 'canceled', ...opts })),
        retrieve: vi.fn(async (id) => ({ id, status: 'active' })),
      },
    },
    withStripeRetry: async (fn) => fn(),
  };
});

// Optionally mock Sentry if used directly
vi.mock('@sentry/node', () => ({ captureException: vi.fn() }));

import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  getSubscriptionStatus,
} from '../../services/subscriptionService.js';

describe('subscriptionService', () => {
  const customerId = 'cus_test';
  const priceId = 'price_test';
  const subscriptionId = 'sub_test';
  const idempotencyKey = 'idemp_test';
  const metadata = { userId: 'user_123', product: 'test' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a subscription with metadata and idempotency', async () => {
    const result = await createSubscription({ customerId, priceId, metadata, idempotencyKey });
    expect(result.customer).toBe(customerId);
    expect(result.items[0].price).toBe(priceId);
    expect(result.metadata).toEqual(metadata);
    expect(result.idempotencyKey).toBe(idempotencyKey);
  });

  it('updates a subscription (plan change/proration)', async () => {
    const result = await updateSubscription({ subscriptionId, newPriceId: priceId, idempotencyKey });
    expect(result.id).toBe(subscriptionId);
    expect(result.items[0].price).toBe(priceId);
    expect(result.idempotencyKey).toBe(idempotencyKey);
  });

  it('cancels a subscription', async () => {
    const result = await cancelSubscription({ subscriptionId, idempotencyKey });
    expect(result.id).toBe(subscriptionId);
    expect(result.status).toBe('canceled');
    expect(result.idempotencyKey).toBe(idempotencyKey);
  });

  it('pauses a subscription', async () => {
    const result = await pauseSubscription({ subscriptionId, idempotencyKey });
    expect(result.id).toBe(subscriptionId);
    expect(result.pause_collection).toBeDefined();
    expect(result.idempotencyKey).toBe(idempotencyKey);
  });

  it('retrieves subscription status', async () => {
    const result = await getSubscriptionStatus(subscriptionId);
    expect(result.id).toBe(subscriptionId);
    expect(result.status).toBe('active');
  });

  it('throws and logs error for missing required params', async () => {
    // Simulate error in createSubscription
    const { stripe } = await import('../../services/stripeSubscription.js');
    stripe.subscriptions.create.mockImplementationOnce(() => { throw new Error('Missing params'); });
    await expect(createSubscription({})).rejects.toThrow('Missing params');
  });
});