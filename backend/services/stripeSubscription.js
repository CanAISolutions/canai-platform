// Stripe Subscription Service Singleton
// Implements: docs/subscription-management-requirements.md (Step 1)
// - Loads API key from environment
// - Exports singleton Stripe client
// - Adds retry logic for transient errors (max 3 attempts, exponential backoff)
// - Integrates Sentry for error tracking
// - PCI compliance: No card data stored

import Stripe from 'stripe';
import * as Sentry from '@sentry/node';

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
if (!STRIPE_API_KEY) {
  Sentry.captureException(new Error('STRIPE_API_KEY not set in environment'));
  throw new Error('STRIPE_API_KEY not set in environment');
}

// Singleton Stripe client
export const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2023-10-16', // Use latest stable Stripe API version
});

// Retry wrapper for transient errors (max 3 attempts, exponential backoff)
export async function withStripeRetry(fn, maxAttempts = 3) {
  let attempt = 0;
  let lastError;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (err.type === 'StripeAPIError' || err.code === 'rate_limit') {
        Sentry.captureException(err);
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 100));
        attempt++;
      } else {
        throw err;
      }
    }
  }
  Sentry.captureException(lastError);
  throw lastError;
}

// PCI Compliance: Never store card data. All operations use Stripe tokens/IDs only.
// For usage, see docs/subscription-management-requirements.md and stripe-payment-strategy.md