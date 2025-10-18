import Appointment from "../models/Appointment.js";
import { nanoid } from "nanoid";

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

export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      slot,
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
      slot,
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
