// routes/adminActions.js
import { Router } from "express";
import isAdmin from "../middleware/isAdmin.js";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import mongoose from "mongoose";

const r = Router();
r.use(isAdmin);

// POST /api/admin/appointments/reschedule { id, start, end }
r.post("/appointments/reschedule", async (req, res) => {
  const { id, start, end } = req.body;
  if (!id || !start || !end)
    return res.status(400).json({ error: "Missing fields" });

  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("Appointment not found");

      // free old availability
      await Availability.updateOne(
        {
          doctorId: appt.doctorId,
          clinicId: appt.clinicId,
          start: appt.start,
          end: appt.end,
        },
        { $set: { blocked: false } },
        { session }
      );

      // block new slot (must exist in availability)
      const newSlot = await Availability.findOne({
        doctorId: appt.doctorId,
        clinicId: appt.clinicId,
        start,
        end,
        blocked: { $ne: true },
      }).session(session);
      if (!newSlot) throw new Error("New slot not available");

      await Availability.updateOne(
        { _id: newSlot._id },
        { $set: { blocked: true } },
        { session }
      );

      appt.start = new Date(start);
      appt.end = new Date(end);
      await appt.save({ session });
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(409).json({ error: e.message });
  } finally {
    if (session) await session.endSession();
  }
});

// POST /api/admin/appointments/cancel { id, reason }
r.post("/appointments/cancel", async (req, res) => {
  const { id, reason } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw new Error("Appointment not found");

      appt.status = "cancelled";
      appt.cancellation = { at: new Date(), reason: reason || "admin_cancel" };
      await appt.save({ session });

      await Availability.updateOne(
        {
          doctorId: appt.doctorId,
          clinicId: appt.clinicId,
          start: appt.start,
          end: appt.end,
        },
        { $set: { blocked: false } },
        { session }
      );
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(409).json({ error: e.message });
  } finally {
    if (session) await session.endSession();
  }
});

export default r;
