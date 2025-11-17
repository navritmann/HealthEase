// routes/adminAppointments.js
import { Router } from "express";
import Appointment from "../models/Appointment.js";
// 🚧 TEMP: remove admin auth so it can't block us
// import isAdmin from "../middleware/isAdmin.js";

const r = Router();

// r.use(isAdmin); // 👈 comment out while debugging

// Quick ping to prove this router is mounted
r.get("/appointments/ping", (req, res) => {
  console.log("✅ HIT /api/admin/appointments/ping");
  res.json({
    ok: true,
    route: "adminAppointments",
    path: "/appointments/ping",
  });
});

// SUPER SIMPLE: return ALL appointments
r.get("/appointments", async (req, res) => {
  try {
    console.log("✅ HIT /api/admin/appointments");
    console.log("Query params:", req.query);

    const all = await Appointment.find({})
      .populate("patientId doctorId clinicId")
      .sort({ start: -1 });

    console.log("Found appointments in DB:", all.length);

    const rows = all.map((a) => ({
      id: a._id,
      bookingNo: a.bookingNo,
      patient: a.patientId
        ? `${a.patientId.firstName || ""} ${a.patientId.lastName || ""}`.trim()
        : "-",
      date: a.start,
      time: a.start,
      doctor:
        a.doctorId?.name ||
        (a.doctorId
          ? `${a.doctorId.firstName || ""} ${a.doctorId.lastName || ""}`.trim()
          : "-"),
      treatment: a.serviceName || a.appointmentType,
      status: a.status,
      videoJoin: a.video?.joinUrl || null,
    }));

    res.json({ rows, total: rows.length });
  } catch (e) {
    console.error("ADMIN /appointments error:", e);
    res.status(500).json({
      rows: [],
      total: 0,
      error: e.message || "Failed to fetch appointments",
    });
  }
});

export default r;
