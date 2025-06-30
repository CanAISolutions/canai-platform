import express from 'express';
import stripe from '../services/stripe.js';
import supabase from '../supabase/client.js';
import { createCheckoutSession } from '../services/stripeCheckout.js';
import Joi from 'joi';

const router = express.Router();

const allowedTracks = ['business-plan-builder', 'social-media-campaign', 'website-audit-feedback'];
const checkoutSessionSchema = Joi.object({
  productTrack: Joi.string().valid(...allowedTracks).required(),
  user_id: Joi.string().required(),
  metadata: Joi.object().optional(),
});

router.post('/stripe-session', async (req, res) => {
  try {
    const { error, value } = checkoutSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: `Input validation failed: ${error.details.map(d => d.message).join(', ')}` } });
    }
    const { productTrack, user_id, metadata = {} } = value;
    const session = await createCheckoutSession({
      productTrack,
      userId: user_id,
      metadata,
    });
    // TODO: Log session in Supabase as before
    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.post('/refund', async (req, res) => {
  try {
    const { session_id, reason } = req.body;

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    const paymentIntentId = checkoutSession.payment_intent;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });

    await supabase
      .from('payment_logs')
      .update({ status: 'refunded', refund_reason: reason })
      .eq('stripe_session_id', session_id);

    res.json({ refund });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;
