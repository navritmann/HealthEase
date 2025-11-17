// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import { nanoid } from "nanoid";

/* ---------- helpers ---------- */
const hmToMin = (hm = "") => {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const isOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && bStart < aEnd;

/* ---------- total calc stays the same ---------- */
const calcTotal = ({
  primaryService,
  addOnServices = [],
  bookingFee = 0,
  tax = 0,
  discount = 0,
}) => {
  const base =
    (primaryService?.amount || 0) +
    addOnServices.reduce((sum, s) => sum + (s.amount || 0), 0) +
    bookingFee +
    tax -
    Math.abs(discount);
  return Math.max(0, Number(base.toFixed(2)));
};

/* ---------- CREATE (add conflict checks + date coerce) ---------- */
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      slot,
      durationMins = 30,
      appointmentType,
      clinicId,
    } = req.body;

    if (!doctorId || !slot?.date || !slot?.time) {
      return res
        .status(400)
        .json({ msg: "doctorId, slot.date, slot.time are required" });
    }
    if (["clinic", "home_visit"].includes(appointmentType) && !clinicId) {
      return res
        .status(400)
        .json({ msg: "clinicId is required for clinic/home_visit" });
    }

    // derive start/end from slot
    const d = new Date(slot.date);
    if (Number.isNaN(d.getTime()))
      return res.status(400).json({ msg: "slot.date must be YYYY-MM-DD" });
    const startMin = hmToMin(slot.time);
    const start = new Date(d);
    start.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + Number(durationMins || 30));

    const appt = await Appointment.create({
      bookingNo: "DCR" + nanoid(6).toUpperCase(),
      doctorId,
      clinicId: clinicId || null,
      patientId: patientId || null, // can be null while held
      appointmentType,
      start,
      end,
      status: "held",
      payment: { status: "pending", gateway: "stripe", currency: "USD" },
      holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return res.status(201).json({
      msg: "Appointment created (held)",
      id: appt._id,
      bookingNo: appt.bookingNo,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Error creating appointment", error: err.message });
  }
};

/* ---------- LIST / UPDATE / DELETE unchanged ---------- */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email role")
      .populate("doctorId", "name email role");
    res.json(appointments);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching appointments", error: err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ msg: "Appointment updated", updated });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error updating appointment", error: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Appointment deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error deleting appointment", error: err.message });
  }
};

/* ---------- NEW: public availability endpoint ---------- */
export const getAvailableSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    if (!date)
      return res
        .status(400)
        .json({ success: false, msg: "date is required (YYYY-MM-DD)" });

    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid date format" });
    }

    // business hours + step (adjust or move to config/DB)
    const OPEN = 9 * 60; // 09:00
    const CLOSE = 17 * 60; // 17:00
    const STEP = 30;

    const q = { "slot.date": dateObj };
    if (doctorId) q.doctorId = doctorId;

    const taken = await Appointment.find(q)
      .select("slot.time durationMins")
      .lean();

    const slots = [];
    for (let t = OPEN; t + STEP <= CLOSE; t += STEP) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      const startLabel = `${h}:${m}`;
      const endLabel = (() => {
        const tt = t + STEP;
        const hh = String(Math.floor(tt / 60)).padStart(2, "0");
        const mm = String(tt % 60).padStart(2, "0");
        return `${hh}:${mm}`;
      })();

      // past guard
      const startDateTime = new Date(dateObj);
      startDateTime.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const isPast = startDateTime.getTime() <= Date.now();

      // conflict guard
      const startMin = hmToMin(startLabel);
      const endMin = hmToMin(endLabel);
      const conflict = taken.some((a) => {
        const aStart = hmToMin(a.slot.time);
        const aEnd = aStart + (a.durationMins || 30);
        return isOverlap(aStart, aEnd, startMin, endMin);
      });

      slots.push({
        startTime: startLabel,
        endTime: endLabel,
        available: !isPast && !conflict,
      });
    }

    res.json({ success: true, data: slots });
  } catch (e) {
    res.status(500).json({ success: false, msg: "Failed to get slots" });
  }
};
