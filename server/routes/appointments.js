import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = Router();

function makeBookingNo() {
  return "DCR" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function makeRoomId() {
  return "room_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ---------------- 1) HOLD ----------------
r.post("/hold", async (req, res) => {
  const {
    doctorId,
    clinicId,
    appointmentType,
    start,
    end,
    patientDraft,
    patientId,
  } = req.body;
  const missing = [];
  if (!appointmentType) missing.push("appointmentType");
  if (!start) missing.push("start");
  if (!end) missing.push("end");
  if (
    (appointmentType === "clinic" || appointmentType === "home_visit") &&
    !doctorId
  )
    missing.push("doctorId");

  if (missing.length)
    return res
      .status(400)
      .json({ error: `Missing fields: ${missing.join(", ")}` });

  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const where = { start, end, blocked: { $ne: true } };
      if (doctorId) where.doctorId = doctorId;
      if (clinicId) where.clinicId = clinicId;

      const slot = await Availability.findOne(where).session(session);
      if (!slot) throw new Error("Slot not available");

      // Optional patient creation/upsert
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

      const hold = new Appointment({
        bookingNo: makeBookingNo(),
        doctorId,
        clinicId: clinicId || null,
        patientId: patientId || patient?._id || null,
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
    res.status(409).json({ error: e.message || "Hold failed" });
  } finally {
    if (session) await session.endSession();
  }
});

// ---------------- 2) QUOTE ----------------
r.post("/quote", async (req, res) => {
  const { serviceCode, addOns = [] } = req.body;
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

// ---------------- 3) CONFIRM ----------------
// routes/appointments.js  (CONFIRM handler only – keep the rest)
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

      const base = process.env.APP_BASE_URL || "http://localhost:3000";
      const roomId =
        "room_" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      // Create join session for virtual types
      if (["video", "audio", "chat"].includes(appt.appointmentType)) {
        appt.video = {
          type: appt.appointmentType, // 👈 important
          roomId,
          joinUrl: `${base}/${appt.appointmentType}/${roomId}`,
          pin,
          status: "pending",
          startsAt: appt.start,
          endsAt: appt.end,
        };
      }

      // Idempotency
      if (appt.status === "confirmed") {
        return res.json({
          bookingNo: appt.bookingNo,
          id: appt._id,
          status: appt.status,
          video: appt.video || null,
        });
      }

      // optional patient upsert
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
      appt.holdExpiresAt = undefined; // 👈 prevent TTL on confirmed
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

r.get("/patient/:patientId", authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;
    const rows = await Appointment.find({ patientId })
      .populate("doctorId clinicId")
      .sort({ start: -1 });

    const data = rows.map((a) => ({
      id: a._id,
      bookingNo: a.bookingNo,
      date: a.start,
      status: a.status,
      type: a.appointmentType,
      doctor:
        a.doctorId?.name ||
        `${a.doctorId?.firstName || ""} ${a.doctorId?.lastName || ""}`.trim(),
      clinic: a.clinicId?.name || "",
      videoJoin: a.video?.joinUrl || null,
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ---------------- 4) GET /api/appointments/:id ----------------
r.get("/:id", async (req, res) => {
  const a = await Appointment.findById(req.params.id).populate(
    "doctorId clinicId patientId"
  );
  if (!a) return res.status(404).json({ error: "Not found" });
  res.json(a);
});

// ---------------- 5) PATIENT RESCHEDULE ----------------
// POST /api/appointments/:id/reschedule
r.post("/:id/reschedule", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { start } = req.body; // new start time (ISO string)

    if (!start) {
      return res.status(400).json({ error: "New start time is required" });
    }

    // Only patient accounts can reschedule
    if (req.user?.role !== "patient") {
      return res
        .status(403)
        .json({ error: "Only patient accounts can reschedule appointments" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    if (appt.status === "cancelled") {
      return res
        .status(400)
        .json({ error: "Cancelled appointments cannot be rescheduled" });
    }

    const newStart = new Date(start);
    if (isNaN(newStart.getTime())) {
      return res.status(400).json({ error: "Invalid start datetime" });
    }

    // keep same duration as before
    const durationMs = appt.end.getTime() - appt.start.getTime();
    if (!durationMs || durationMs <= 0) {
      return res.status(400).json({ error: "Invalid appointment duration" });
    }
    const newEnd = new Date(newStart.getTime() + durationMs);

    // OPTIONAL: prevent hard overlaps for same doctor
    const overlapping = await Appointment.findOne({
      _id: { $ne: appt._id },
      doctorId: appt.doctorId,
      status: { $in: ["held", "confirmed", "rescheduled"] },
      start: { $lt: newEnd },
      end: { $gt: newStart },
    });

    if (overlapping) {
      return res.status(409).json({
        error:
          "Doctor already has another appointment in this time range. Please pick another time.",
      });
    }

    // update appointment
    appt.start = newStart;
    appt.end = newEnd;
    appt.status = "rescheduled";

    if (appt.video) {
      appt.video.startsAt = newStart;
      appt.video.endsAt = newEnd;
    }

    await appt.save();

    return res.json({
      id: appt._id,
      bookingNo: appt.bookingNo,
      status: appt.status,
      start: appt.start,
      end: appt.end,
    });
  } catch (e) {
    console.error("Reschedule error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

export default r;
