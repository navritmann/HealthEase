// server/routes/adminPayments.js
import { Router } from "express";
import isAdmin from "../middleware/isAdmin.js";
import Appointment from "../models/Appointment.js";

const r = Router();

// all routes here require admin auth
r.use(isAdmin);

/**
 * GET /api/admin/payments
 * ?status=paid|pending|failed|refunded|requires_payment
 * ?q=search
 * ?page=1&limit=25
 */
r.get("/payments", async (req, res) => {
  try {
    const {
      status = "", // payment status
      q = "",
      page = 1,
      limit = 25,
    } = req.query;

    const where = {
      "payment.status": { $exists: true }, // any appointment with payment info
    };

    if (status) {
      // allow "unpaid" shortcut for pending + requires_payment
      if (status === "unpaid") {
        where["payment.status"] = { $in: ["pending", "requires_payment"] };
      } else {
        where["payment.status"] = status;
      }
    }

    const text = String(q || "").trim();
    if (text) {
      const rx = new RegExp(text, "i");
      // note: this only searches fields that exist on Appointment itself
      where.$or = [
        { bookingNo: rx },
        { appointmentType: rx },
        { "payment.gateway": rx },
        { "payment.intentId": rx },
        { "payment.chargeId": rx },
      ];
    }

    const lim = Math.min(parseInt(limit || 25, 10), 200);
    const skip = (Math.max(parseInt(page || 1, 10), 1) - 1) * lim;

    const [rows, total] = await Promise.all([
      Appointment.find(where)
        .populate("patientId doctorId clinicId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Appointment.countDocuments(where),
    ]);

    const mapped = rows.map((a) => ({
      id: a._id,
      bookingNo: a.bookingNo,
      date: a.start,
      type: a.appointmentType,
      patient: a.patientId
        ? `${a.patientId.firstName || ""} ${
            a.patientId.lastName || ""
          }`.trim() || a.patientId.email
        : "-",
      doctor: a.doctorId?.name || "-",
      clinic: a.clinicId?.name || "",
      amount: a.payment?.amount ?? null,
      currency: a.payment?.currency || "USD",
      status: a.payment?.status || "pending",
      gateway: a.payment?.gateway || "stripe",
      intentId: a.payment?.intentId || "",
      chargeId: a.payment?.chargeId || "",
    }));

    res.json({
      rows: mapped,
      total,
      page: Number(page) || 1,
      limit: lim,
    });
  } catch (e) {
    console.error("admin /payments error:", e);
    res.status(500).json({ error: e.message || "Failed to fetch payments" });
  }
});

export default r;
