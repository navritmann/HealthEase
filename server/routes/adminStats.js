// routes/adminStats.js
import { Router } from "express";
import isAdmin from "../middleware/isAdmin.js";
import Appointment from "../models/Appointment.js";

const r = Router();
r.use(isAdmin);

// KPIs for dashboard
r.get("/stats", async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [totalAppointments, completedToday, pendingCount, confirmedCount] =
    await Promise.all([
      Appointment.countDocuments({}),
      Appointment.countDocuments({
        status: "confirmed",
        start: { $gte: startOfDay, $lte: endOfDay },
      }),
      Appointment.countDocuments({ status: "held" }),
      Appointment.countDocuments({ status: "confirmed" }),
    ]);

  // Revenue — sum confirmed appointments' payment.amount this week
  const startOfWeek = new Date(); // Mon 00:00
  const day = startOfWeek.getDay(); // 0-6 (Sun-Sat)
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const revenueAgg = await Appointment.aggregate([
    {
      $match: {
        status: "confirmed",
        "payment.status": "succeeded",
        start: { $gte: startOfWeek },
      },
    },
    { $group: { _id: null, revenue: { $sum: "$payment.amount" } } },
    { $project: { _id: 0, revenue: 1 } },
  ]);
  const revenueWeek = revenueAgg[0]?.revenue || 0;

  res.json({
    totalAppointments,
    completedPct: totalAppointments
      ? Math.round((confirmedCount / totalAppointments) * 100)
      : 0,
    pendingCount,
    revenueWeek,
  });
});

// Today’s schedule for side card
r.get("/today-schedule", async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const items = await Appointment.find({
    start: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("doctorId patientId")
    .sort({ start: 1 })
    .limit(30);

  res.json(
    items.map((a) => ({
      time: a.start,
      type: a.appointmentType,
      status: a.status,
      doctor: a.doctorId?.name || "-",
      patient:
        (a.patientId?.firstName || "") + " " + (a.patientId?.lastName || ""),
    }))
  );
});

// Revenue series (week|month|year)
r.get("/revenue", async (req, res) => {
  const { range = "week" } = req.query;
  const now = new Date();
  let start;
  if (range === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (range === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // week
    start = new Date();
    const d = start.getDay();
    const off = (d === 0 ? -6 : 1) - d;
    start.setDate(start.getDate() + off);
    start.setHours(0, 0, 0, 0);
  }

  const series = await Appointment.aggregate([
    {
      $match: {
        status: "confirmed",
        "payment.status": "succeeded",
        start: { $gte: start },
      },
    },
    {
      $group: {
        _id: {
          y: { $year: "$start" },
          m: { $month: "$start" },
          d: range === "year" ? null : { $dayOfMonth: "$start" },
        },
        value: { $sum: "$payment.amount" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
  ]);

  const labels = series.map((s) => {
    if (range === "year")
      return `${s._id.y}-${String(s._id.m).padStart(2, "0")}`;
    return `${s._id.y}-${String(s._id.m).padStart(2, "0")}-${String(
      s._id.d
    ).padStart(2, "0")}`;
  });
  const values = series.map((s) => s.value);
  res.json({ labels, values });
});

export default r;
