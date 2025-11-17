// server/routes/adminStats.js
import { Router } from "express";
import isAdmin from "../middleware/isAdmin.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const r = Router();
r.use(isAdmin);

// helper: strip time (start of day)
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/* ---------------- 1) /api/admin/stats ---------------- */
r.get("/stats", async (req, res) => {
  try {
    const [
      totalAppointments,
      confirmedCount,
      pendingCount,
      cancelledCount,
      rescheduledCount,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "held" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Appointment.countDocuments({ status: "rescheduled" }),
    ]);

    const completedPct = totalAppointments
      ? Math.round((confirmedCount / totalAppointments) * 100)
      : 0;

    // Revenue this week (paid + confirmed)
    const weekStart = startOfDay(daysAgo(6));
    const now = new Date();
    const revAgg = await Appointment.aggregate([
      {
        $match: {
          status: "confirmed",
          start: { $gte: weekStart, $lte: now },
          "payment.status": "paid",
          "payment.amount": { $gt: 0 },
        },
      },
      { $group: { _id: null, total: { $sum: "$payment.amount" } } },
    ]);
    const revenueWeek = revAgg[0]?.total || 0;

    // Department breakdown based on doctor specialty in confirmed appts (last 30 days)
    const monthStart = startOfDay(daysAgo(29));
    const recent = await Appointment.find({
      status: "confirmed",
      start: { $gte: monthStart, $lte: now },
    })
      .populate("doctorId")
      .select("doctorId")
      .lean();

    const deptCounts = {};
    for (const a of recent) {
      const doc = a.doctorId;
      const key = doc?.specialty || "Other";
      deptCounts[key] = (deptCounts[key] || 0) + 1;
    }
    const deptTotal = Object.values(deptCounts).reduce((s, v) => s + v, 0);
    const departmentBreakdown = Object.entries(deptCounts).map(
      ([name, count]) => ({
        name,
        count,
        pct: deptTotal ? Math.round((count / deptTotal) * 100) : 0,
      })
    );

    return res.json({
      totalAppointments,
      completedPct,
      pendingCount,
      revenueWeek,
      statusCounts: {
        confirmed: confirmedCount,
        held: pendingCount,
        cancelled: cancelledCount,
        rescheduled: rescheduledCount,
      },
      departmentBreakdown,
      deptTotal,
    });
  } catch (e) {
    console.error("admin /stats error:", e);
    res
      .status(500)
      .json({ error: e.message || "Failed to fetch dashboard stats" });
  }
});

/* ---------------- 2) /api/admin/today-schedule ---------------- */
r.get("/today-schedule", async (req, res) => {
  try {
    const start = startOfDay(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const rows = await Appointment.find({
      start: { $gte: start, $lt: end },
    })
      .populate("doctorId patientId")
      .sort({ start: 1 })
      .lean();

    const data = rows.map((a) => ({
      id: a._id,
      patient:
        (a.patientId &&
          `${a.patientId.firstName || ""} ${
            a.patientId.lastName || ""
          }`.trim()) ||
        "Unknown patient",
      doctor:
        a.doctorId?.name ||
        (a.doctorId &&
          `${a.doctorId.firstName || ""} ${
            a.doctorId.lastName || ""
          }`.trim()) ||
        "Doctor",
      time: a.start,
      type: a.appointmentType,
      status: a.status,
    }));

    res.json(data);
  } catch (e) {
    console.error("admin /today-schedule error:", e);
    res
      .status(500)
      .json({ error: e.message || "Failed to fetch today schedule" });
  }
});

/* ---------------- 3) /api/admin/revenue?range=week|month|year ---------------- */
r.get("/revenue", async (req, res) => {
  try {
    const range = (req.query.range || "week").toLowerCase();
    const now = new Date();

    let start;
    let buckets = [];
    let stepDays = 1; // days per bucket

    if (range === "month") {
      start = startOfDay(daysAgo(29));
      stepDays = 1;
      buckets = Array.from({ length: 30 }).map((_, i) => {
        const d = startOfDay(daysAgo(29 - i));
        return d;
      });
    } else if (range === "year") {
      // last 12 months
      const d = new Date(now);
      d.setMonth(d.getMonth() - 11);
      d.setDate(1);
      start = startOfDay(d);
      stepDays = 30; // just approximate
      buckets = Array.from({ length: 12 }).map((_, i) => {
        const m = new Date(d);
        m.setMonth(d.getMonth() + i);
        return m;
      });
    } else {
      // default: week (last 7 days)
      start = startOfDay(daysAgo(6));
      stepDays = 1;
      buckets = Array.from({ length: 7 }).map((_, i) => {
        const d = startOfDay(daysAgo(6 - i));
        return d;
      });
    }

    const rows = await Appointment.find({
      status: "confirmed",
      start: { $gte: start, $lte: now },
      "payment.status": "paid",
      "payment.amount": { $gt: 0 },
    })
      .select("start payment.amount")
      .lean();

    const bucketTotals = buckets.map(() => 0);

    const msPerDay = 24 * 60 * 60 * 1000;

    if (range === "year") {
      // by month index
      rows.forEach((a) => {
        const d = new Date(a.start);
        const monthDiff =
          (d.getFullYear() - buckets[0].getFullYear()) * 12 +
          (d.getMonth() - buckets[0].getMonth());
        if (monthDiff >= 0 && monthDiff < bucketTotals.length) {
          bucketTotals[monthDiff] += a.payment.amount || 0;
        }
      });
    } else {
      rows.forEach((a) => {
        const d = new Date(a.start);
        const diffDays = Math.floor((d - start) / msPerDay);
        if (diffDays >= 0 && diffDays < bucketTotals.length) {
          bucketTotals[diffDays] += a.payment.amount || 0;
        }
      });
    }

    let labels;
    if (range === "year") {
      labels = buckets.map((d) =>
        d.toLocaleDateString("en-US", { month: "short" })
      );
    } else {
      labels = buckets.map((d) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
    }

    res.json({
      labels,
      values: bucketTotals,
    });
  } catch (e) {
    console.error("admin /revenue error:", e);
    res
      .status(500)
      .json({ error: e.message || "Failed to fetch revenue data" });
  }
});

export default r;
