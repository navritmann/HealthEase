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
      patientId, // NOTE: ideally read from req.user._id in protected routes
      doctorId,
      slot,
      durationMins = 30,
      appointmentType,
      clinicId,
      clinicName,
      clinicAddress,
      primaryService,
      addOnServices,
      bookingFee,
      tax,
      discount,
      contact,
      selectedPatientId,
      symptoms,
      reasonForVisit,
      attachments,
      payment,
    } = req.body;

    if (!patientId || !doctorId || !slot?.date || !slot?.time) {
      return res.status(400).json({
        msg: "patientId, doctorId, slot.date, slot.time are required",
      });
    }

    if (payment && !["stripe", "cash_on_delivery"].includes(payment.method)) {
      return res.status(400).json({ msg: "Invalid payment method" });
    }

    if (["clinic", "home_visit"].includes(appointmentType) && !clinicId) {
      return res.status(400).json({
        msg: "clinicId is required for clinic/home_visit appointments",
      });
    }

    // coerce date and basic time validation
    const dateObj = new Date(slot.date);
    if (Number.isNaN(dateObj.getTime())) {
      return res
        .status(400)
        .json({ msg: "slot.date must be a valid date (YYYY-MM-DD)" });
    }
    const startMin = hmToMin(slot.time);
    const endMin = startMin + Number(durationMins || 30);
    if (!(endMin > startMin)) {
      return res.status(400).json({ msg: "Invalid time range" });
    }

    // ensure slot start is in the future (optional)
    const startDateTime = new Date(dateObj);
    startDateTime.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
    if (startDateTime.getTime() <= Date.now()) {
      return res.status(400).json({ msg: "Selected time is in the past" });
    }

    // conflict check: same doctor or same patient on same date with overlap
    const sameDay = await Appointment.find({
      "slot.date": dateObj,
      $or: [{ doctorId }, { patientId }],
    })
      .select("slot.time durationMins doctorId patientId")
      .lean();

    const conflict = sameDay.some((a) => {
      const aStart = hmToMin(a.slot.time);
      const aEnd = aStart + (a.durationMins || 30);
      return isOverlap(aStart, aEnd, startMin, endMin);
    });

    if (conflict) {
      return res
        .status(409)
        .json({ msg: "Selected slot overlaps an existing appointment" });
    }

    const bookingNumber = `DCRA${nanoid(6).toUpperCase()}`;
    const total = calcTotal({
      primaryService,
      addOnServices,
      bookingFee,
      tax,
      discount,
    });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      slot: { date: dateObj, time: slot.time },
      durationMins,
      appointmentType,
      clinicId,
      clinicName,
      clinicAddress,
      primaryService,
      addOnServices,
      bookingFee,
      tax,
      discount,
      total,
      contact,
      selectedPatientId,
      symptoms,
      reasonForVisit,
      attachments,
      payment,
      bookingNumber,
    });

    res.status(201).json({ msg: "Appointment created", appointment });
  } catch (err) {
    res
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
