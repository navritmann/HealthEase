// routes/adminAppointments.js
import { Router } from "express";
import isAdmin from "../middleware/isAdmin.js";
import Appointment from "../models/Appointment.js";

const r = Router();
r.use(isAdmin);

// GET /api/admin/appointments?status=&q=&page=1&limit=25
r.get("/appointments", async (req, res) => {
  const { status = "", q = "", page = 1, limit = 25 } = req.query;
  const where = {};
  if (status) where.status = status;

  // text filters over bookingNo, patientName, doctorName
  const text = q?.trim();
  if (text) {
    where.$or = [
      { bookingNo: new RegExp(text, "i") },
      { notes: new RegExp(text, "i") },
    ];
  }

  const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
  const [rows, total] = await Promise.all([
    Appointment.find(where)
      .populate("patientId doctorId clinicId")
      .sort({ start: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Appointment.countDocuments(where),
  ]);

  res.json({
    rows: rows.map((a) => ({
      id: a._id,
      bookingNo: a.bookingNo,
      patient: a.patientId
        ? `${a.patientId.firstName || ""} ${a.patientId.lastName || ""}`.trim()
        : "-",
      date: a.start,
      time: a.start,
      doctor: a.doctorId?.name || "-",
      treatment: a.serviceName || a.appointmentType,
      status: a.status,
      videoJoin: a.video?.joinUrl || null,
    })),
    total,
  });
});

export default r;
