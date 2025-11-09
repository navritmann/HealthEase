import { Router } from "express";
import Stripe from "stripe";
const r = Router();

const stripe = process.env.STRIPE_SECRET
  ? new Stripe(process.env.STRIPE_SECRET)
  : null;

// Create PaymentIntent
// POST /api/payments/intent { amount, currency, metadata }
r.post("/intent", async (req, res) => {
  const { amount, currency = "usd", metadata = {} } = req.body;
  if (!stripe) return res.status(400).json({ error: "Stripe not configured" });
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
  });
  res.json({ clientSecret: intent.client_secret, id: intent.id });
});

// Stripe webhook (optional, later)
r.post("/webhook", (req, res) => {
  // implement when needed
  res.sendStatus(200);
});

export default r;
