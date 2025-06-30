import express from 'express';
import stripe from '../services/stripe.js';
import supabase from '../supabase/client.js';

const router = express.Router();

router.post('/stripe-session', async (req, res) => {
  try {
    const { spark, user_id, spark_log_id } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: spark.title,
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        user_id,
        spark_log_id,
      },
    });

    await supabase.from('payment_logs').insert([
      {
        user_id,
        spark_log_id,
        stripe_session_id: session.id,
        product_track: spark.product_track,
        amount: 99.0,
        status: 'pending',
      },
    ]);

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
