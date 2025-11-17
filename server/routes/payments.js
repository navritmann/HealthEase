// server/routes/payments.js
import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";

const r = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing. Check your .env");
}

// UTIL: build video/audio/chat object like in /appointments/confirm
function buildVirtual(appt) {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const roomId = "room_" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  if (["video", "audio", "chat"].includes(appt.appointmentType)) {
    return {
      type: appt.appointmentType,
      roomId,
      joinUrl: `${base}/${appt.appointmentType}/${roomId}`,
      pin,
      status: "pending",
      startsAt: appt.start,
      endsAt: appt.end,
    };
  }
  return null;
}

/**
 * POST /api/payments/stripe/checkout
 * Body: { appointmentId, serviceCode, addOns, appointmentType }
 * Computes amount server-side (reuses your quote logic inline) and creates Checkout.
 */
r.post("/stripe/checkout", express.json(), async (req, res) => {
  try {
    const {
      appointmentId,
      serviceCode,
      addOns = [],
      appointmentType,
      patientId,
    } = req.body;
    if (!appointmentId)
      return res.status(400).json({ error: "Missing appointmentId" });

    const base = serviceCode === "CARDIO_30" ? 200 : 150;
    const addOn = addOns.includes("ECHO") ? 20 : 0;
    const bookingFee = 20;
    const tax = 18;
    const discount = -15;
    const total = base + addOn + bookingFee + tax + discount;

    const amount = Math.round(total * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "usd",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name:
                (appointmentType || "Clinic") +
                " Appointment – " +
                (serviceCode || "Service"),
            },
          },
        },
      ],
      metadata: {
        appointmentId,
        serviceCode: serviceCode || "",
        addOns: JSON.stringify(addOns || []),
        appointmentType: appointmentType || "",
        patientId: patientId || "", // <-- NEW
      },
      success_url: `${process.env.APP_BASE_URL}/appointments?success=1&aid=${appointmentId}&cs={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/appointments?canceled=1`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    res.status(500).json({ error: "Failed to create Stripe Checkout session" });
  }
});

r.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;

      try {
        const appt = await Appointment.findById(appointmentId);
        if (!appt) throw new Error("Appointment not found");

        // set patient if provided
        const metaPatientId = session.metadata?.patientId;
        if (!appt.patientId && metaPatientId) {
          appt.patientId = metaPatientId; // string -> ObjectId cast by Mongoose
        }

        if (appt.status === "confirmed") return res.json({ received: true });

        const paymentIntentId = session.payment_intent;
        let chargeId = "";
        if (paymentIntentId) {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          chargeId =
            Array.isArray(pi.charges?.data) && pi.charges.data[0]?.id
              ? pi.charges.data[0].id
              : "";
        }

        const virtual = buildVirtual(appt);

        appt.payment = {
          status: "paid",
          currency: session.currency?.toUpperCase() || "USD",
          amount: (session.amount_total || 0) / 100,
          gateway: "stripe",
          intentId: paymentIntentId || "",
          chargeId,
        };
        if (virtual) appt.video = virtual;
        appt.status = "confirmed";
        appt.holdExpiresAt = undefined;

        await appt.save({ validateBeforeSave: false });

        await Availability.updateOne(
          {
            doctorId: appt.doctorId,
            clinicId: appt.clinicId,
            start: appt.start,
            end: appt.end,
          },
          { $set: { blocked: true } }
        );
      } catch (e) {
        console.error("Webhook confirm error:", e);
        return res.status(500).json({ error: "Failed to confirm appointment" });
      }
    }

    res.json({ received: true });
  }
);

// GET /api/payments/stripe/verify?cs=cs_test_123&aid=<appointmentId>
r.get("/stripe/verify", async (req, res) => {
  try {
    const { cs, aid } = req.query;
    if (!cs || !aid)
      return res.status(400).json({ error: "Missing cs or aid" });

    // Get the session (and PI+charges) from Stripe
    const session = await stripe.checkout.sessions.retrieve(cs, {
      expand: ["payment_intent.charges"],
    });

    if (session.payment_status !== "paid") {
      return res
        .status(409)
        .json({ error: `Payment not completed: ${session.payment_status}` });
    }

    const appt = await Appointment.findById(aid);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    // If already confirmed, return idempotently
    if (appt.status === "confirmed")
      return res.json({ ok: true, id: appt._id });

    // Build virtual session if needed
    const virtual = (() => {
      const base = process.env.APP_BASE_URL || "http://localhost:3000";
      const roomId =
        "room_" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      if (["video", "audio", "chat"].includes(appt.appointmentType)) {
        return {
          type: appt.appointmentType,
          roomId,
          joinUrl: `${base}/${appt.appointmentType}/${roomId}`,
          pin,
          status: "pending",
          startsAt: appt.start,
          endsAt: appt.end,
        };
      }
      return null;
    })();

    // Extract PI + first charge id (if present)
    const pi = session.payment_intent;
    const paymentIntentId = typeof pi === "string" ? pi : pi?.id || "";
    const chargeId =
      (typeof pi === "object" && pi?.charges?.data && pi.charges.data[0]?.id) ||
      "";

    // Update appointment
    appt.payment = {
      status: "paid",
      currency: (session.currency || "usd").toUpperCase(),
      amount: (session.amount_total || 0) / 100,
      gateway: "stripe",
      intentId: paymentIntentId,
      chargeId,
    };
    if (virtual) appt.video = virtual;
    appt.status = "confirmed";
    appt.holdExpiresAt = undefined; // stop TTL
    await appt.save({ validateBeforeSave: false });

    // Block the slot
    await Availability.updateOne(
      {
        doctorId: appt.doctorId,
        clinicId: appt.clinicId,
        start: appt.start,
        end: appt.end,
      },
      { $set: { blocked: true } }
    );

    res.json({ ok: true, id: appt._id });
  } catch (e) {
    console.error("verify error:", e);
    res.status(500).json({ error: "Verify failed" });
  }
});

export default r;
