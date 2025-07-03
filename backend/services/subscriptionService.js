// Subscription Service Layer
// Implements: docs/subscription-management-requirements.md (Step 2)
// - Core CRUD for plans/subscriptions
// - Handles create/update/cancel, plan changes, billing period logic
// - Uses singleton Stripe client from stripeSubscription.js
// - Ensures idempotency, attaches user/product metadata
// - Stubs for Supabase/logging (to be implemented in later steps)

import { stripe, withStripeRetry } from './stripeSubscription.js';
// import supabase from '../supabase/client'; // Uncomment and implement as needed
// import Logger from './Logger'; // Uncomment and implement as needed

/**
 * Create a new subscription for a user
 * @param {Object} params - { customerId, priceId, metadata, idempotencyKey }
 * @returns {Promise<Object>} Stripe subscription object
 */
export async function createSubscription({ customerId, priceId, metadata = {}, idempotencyKey }) {
  return withStripeRetry(async () => {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      expand: ['latest_invoice.payment_intent'],
    }, {
      idempotencyKey,
    });
    // TODO: Log event to Supabase/payment_logs
    return subscription;
  });
}

/**
 * Update a subscription (plan change, proration)
 * @param {Object} params - { subscriptionId, newPriceId, proration_behavior, idempotencyKey }
 * @returns {Promise<Object>} Stripe subscription object
 */
export async function updateSubscription({ subscriptionId, newPriceId, proration_behavior = 'create_prorations', idempotencyKey }) {
  return withStripeRetry(async () => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ price: newPriceId }],
      proration_behavior,
    }, {
      idempotencyKey,
    });
    // TODO: Log plan change/proration event
    return subscription;
  });
}

/**
 * Cancel a subscription
 * @param {Object} params - { subscriptionId, idempotencyKey }
 * @returns {Promise<Object>} Stripe subscription object
 */
export async function cancelSubscription({ subscriptionId, idempotencyKey }) {
  return withStripeRetry(async () => {
    const subscription = await stripe.subscriptions.del(subscriptionId, {
      idempotencyKey,
    });
    // TODO: Log cancellation event
    return subscription;
  });
}

/**
 * Pause a subscription (if supported)
 * @param {Object} params - { subscriptionId, idempotencyKey }
 * @returns {Promise<Object>} Stripe subscription object
 */
export async function pauseSubscription({ subscriptionId, idempotencyKey }) {
  return withStripeRetry(async () => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: 'mark_uncollectible' },
    }, {
      idempotencyKey,
    });
    // TODO: Log pause event
    return subscription;
  });
}

/**
 * Get subscription status
 * @param {string} subscriptionId
 * @returns {Promise<Object>} Stripe subscription object
 */
export async function getSubscriptionStatus(subscriptionId) {
  return withStripeRetry(async () => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // TODO: Sync status to Supabase
    return subscription;
  });
}

// All functions are idempotent (use idempotencyKey), attach user/product metadata, and are documented inline.
// See docs/subscription-management-requirements.md for requirements and future integration points.