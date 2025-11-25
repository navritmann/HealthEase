// server/routes/doctorPanel.js
import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { authMiddleware, doctorCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here require doctor login
router.use(authMiddleware, doctorCheck);

/**
 * GET /api/doctor/appointments?range=today|upcoming|past
 * Returns appointments for the logged-in doctor
 */
router.get("/appointments", async (req, res) => {
  try {
    const { range = "upcoming" } = req.query;
    const now = new Date();

    // We know the logged-in doctor from JWT email
    const email = (req.user?.email || "").toLowerCase().trim();

    // Doctor model already has 'email' + 'status'
    const doctor = await Doctor.findOne({ email, status: "Active" }).lean();
    if (!doctor) {
      return res
        .status(404)
        .json({ msg: "Doctor profile not found for this user" });
    }

    let filter = {
      doctorId: doctor._id,
      status: { $in: ["held", "confirmed"] }, // ignore cancelled/rescheduled for panel
    };

    if (range === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.start = { $gte: startOfDay, $lte: endOfDay };
    } else if (range === "past") {
      filter.start = { $lt: now };
    } else {
      // upcoming (default)
      filter.start = { $gte: now };
    }

    const appts = await Appointment.find(filter)
      .populate("patientId", "firstName lastName email phone")
      .populate("clinicId", "name addressLine")
      .lean()
      .sort({ start: 1 });

    // Shape a clean payload for the UI (optional but nice)
    const shaped = appts.map((a) => ({
      id: a._id,
      bookingNo: a.bookingNo,
      status: a.status,
      appointmentType: a.appointmentType,
      start: a.start,
      end: a.end,
      clinic: a.clinicId
        ? {
            id: a.clinicId._id,
            name: a.clinicId.name,
            addressLine: a.clinicId.addressLine,
          }
        : null,
      patient: a.patientId
        ? {
            id: a.patientId._id,
            firstName: a.patientId.firstName,
            lastName: a.patientId.lastName,
            email: a.patientId.email,
            phone: a.patientId.phone,
          }
        : null,
      video: a.video
        ? {
            type: a.video.type,
            roomId: a.video.roomId,
            joinUrl: a.video.joinUrl,
            status: a.video.status,
            startsAt: a.video.startsAt,
            endsAt: a.video.endsAt,
            // ⚠︎ PIN intentionally NOT returned here
          }
        : null,
    }));

    return res.json({ doctorId: doctor._id, appointments: shaped });
  } catch (err) {
    console.error("Doctor appointments error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
