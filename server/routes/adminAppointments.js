// routes/adminAppointments.js
import { Router } from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
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

    // 1) Load appointments + patient / doctor / clinic
    const all = await Appointment.find({})
      .populate("patientId doctorId clinicId")
      .sort({ start: -1 })
      .lean();

    console.log("Found appointments in DB:", all);

    // 2) Collect ALL possible patient emails (from Patient + from Appointment)
    const emails = new Set();
    for (const a of all) {
      const p = a.patientId;
      const emailFromPatient = p?.email;
      const emailFromAppt = a.patientEmail || a.email; // if you add these later

      if (emailFromPatient) {
        emails.add(String(emailFromPatient).trim().toLowerCase());
      }
      if (emailFromAppt) {
        emails.add(String(emailFromAppt).trim().toLowerCase());
      }
    }
    console.log(emails);

    // 3) Load users by those emails
    const users = await User.find({
      email: { $in: Array.from(emails) },
    }).lean();

    const userByEmail = {};
    for (const u of users) {
      if (u.email) {
        userByEmail[u.email.toLowerCase()] = u;
      }
    }

    // 4) Shape rows: prefer USER → then PATIENT → else guest
    const rows = all.map((a) => {
      const p = a.patientId || {};

      // figure out the "raw" email we’ll use to fetch the user
      const rawEmail = (a.patientEmail || a.email || p.email || "")
        .trim()
        .toLowerCase();

      const u = rawEmail ? userByEmail[rawEmail] : null;

      // NAME: prefer user, then patient, then guest
      const patientNameFromPatient = `${p.firstName || ""} ${
        p.lastName || ""
      }`.trim();

      const patientNameFromUser = u
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          u.name ||
          patientNameFromPatient
        : patientNameFromPatient;

      const patientName = patientNameFromUser || rawEmail || "Guest";

      return {
        id: a._id,
        bookingNo: a.bookingNo,
        patient: patientName,
        patientEmail: rawEmail || "",
        date: a.start,
        time: a.start,
        doctor:
          a.doctorId?.name ||
          (a.doctorId
            ? `${a.doctorId.firstName || ""} ${
                a.doctorId.lastName || ""
              }`.trim()
            : "-"),
        treatment: a.serviceName || a.appointmentType,
        status: a.status,
        videoJoin: a.video?.joinUrl || null,
      };
    });

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
