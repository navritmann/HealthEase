import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

const r = Router();

function makeBookingNo() {
  return "DCR" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeRoomId() {
  return "vid_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// 1) HOLD a slot (after date/time is picked; before payment)
// POST /api/appointments/hold
// body: { doctorId, clinicId, appointmentType, start, end, patientDraft? }
r.post("/hold", async (req, res) => {
  const { doctorId, clinicId, appointmentType, start, end, patientDraft } =
    req.body;
  const missing = [];
  if (!appointmentType) missing.push("appointmentType");
  if (!start) missing.push("start");
  if (!end) missing.push("end");
  if (
    (appointmentType === "clinic" || appointmentType === "home_visit") &&
    !doctorId
  ) {
    missing.push("doctorId");
  }
  if (missing.length) {
    return res
      .status(400)
      .json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // 1) validate slot
      const where = { start, end, blocked: { $ne: true } };
      if (doctorId) where.doctorId = doctorId;
      if (clinicId) where.clinicId = clinicId;
      const slot = await Availability.findOne(where).session(session);
      if (!slot) throw new Error("Slot not available");

      // 2) optional patient upsert (INSIDE tx; uses session)
      let patient = null;
      if (patientDraft?.email) {
        const { firstName, lastName, phone, email, ...rest } = patientDraft;
        patient = await Patient.findOneAndUpdate(
          { email },
          {
            $set: { firstName, lastName, phone, ...rest },
            $setOnInsert: { email },
          },
          { new: true, upsert: true, session }
        );
      }

      // 3) create hold
      const hold = new Appointment({
        bookingNo: makeBookingNo(),
        doctorId,
        clinicId: clinicId || null,
        patientId: patient?._id || null,
        appointmentType,
        start,
        end,
        status: "held",
        payment: { status: "pending" },
        holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      await hold.save({ session });
      res.json({
        id: hold._id,
        bookingNo: hold.bookingNo,
        holdExpiresAt: hold.holdExpiresAt,
      });
    });
  } catch (e) {
    return res.status(409).json({ error: e.message || "Hold failed" });
  } finally {
    if (session) await session.endSession();
  }
});

// 2) QUOTE (server-calculated pricing)
// POST /api/appointments/quote
// body: { serviceCode, addOns:[], appointmentType }
r.post("/quote", async (req, res) => {
  const { serviceCode, addOns = [], appointmentType } = req.body;
  // demo pricing
  const base = serviceCode === "CARDIO_30" ? 200 : 150;
  const addOn = addOns.includes("ECHO") ? 20 : 0;
  const bookingFee = 20;
  const tax = 18;
  const discount = -15;
  const total = base + addOn + bookingFee + tax + discount;
  res.json({
    currency: "USD",
    items: [
      { label: "Service", amount: base + addOn },
      { label: "Booking Fee", amount: bookingFee },
      { label: "Tax", amount: tax },
      { label: "Discount", amount: discount },
    ],
    total,
  });
});

// 3) CONFIRM (after successful payment)
// POST /api/appointments/confirm
// body: { appointmentId, payment: { status, currency, amount, gateway, intentId, chargeId }, patient }
r.post("/confirm", async (req, res) => {
  const { appointmentId, payment, patient } = req.body;
  if (!appointmentId || !payment?.status)
    return res.status(400).json({ error: "Missing fields" });

  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const appt = await Appointment.findById(appointmentId).session(session);
      if (!appt) throw new Error("Appointment not found");
      if (appt.appointmentType === "video") {
        const roomId = makeRoomId();
        const base = process.env.APP_BASE_URL || "http://localhost:3000";
        const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

        appt.video = {
          roomId,
          joinUrl: `${base}/video/${roomId}`,
          pin,
          status: "pending",
          startsAt: appt.start,
          endsAt: appt.end,
        };
      }
      // idempotent
      if (appt.status === "confirmed") {
        return res.json({
          bookingNo: appt.bookingNo,
          id: appt._id,
          status: appt.status,
          video: appt.video || null,
        });
      }

      // optional patient upsert (INSIDE tx)
      if (patient?.email) {
        const { firstName, lastName, phone, email, ...rest } = patient;
        const p = await Patient.findOneAndUpdate(
          { email },
          {
            $set: { firstName, lastName, phone, ...rest },
            $setOnInsert: { email },
          },
          { new: true, upsert: true, session }
        );
        appt.patientId = p?._id || appt.patientId || null;
      }

      appt.payment = payment;
      appt.status = "confirmed";
      await appt.save({ session });

      await Availability.updateOne(
        {
          doctorId: appt.doctorId,
          clinicId: appt.clinicId,
          start: appt.start,
          end: appt.end,
        },
        { $set: { blocked: true } },
        { session }
      );

      res.json({
        bookingNo: appt.bookingNo,
        id: appt._id,
        status: appt.status,
        video: appt.video || null,
      });
    });
  } catch (e) {
    return res.status(409).json({ error: e.message || "Confirm failed" });
  } finally {
    if (session) await session.endSession();
  }
});

// 4) GET /api/appointments/:id (for confirmation page)
r.get("/:id", async (req, res) => {
  const a = await Appointment.findById(req.params.id).populate(
    "doctorId clinicId patientId"
  );
  if (!a) return res.status(404).json({ error: "Not found" });
  res.json(a);
});

export default r;
