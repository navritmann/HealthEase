import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, slot } = req.body;
    const appointment = new Appointment({ patientId, doctorId, slot });
    await appointment.save();
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
      .populate("patientId", "name email")
      .populate("doctorId", "name email");
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
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ msg: "Appointment deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error deleting appointment", error: err.message });
  }
};
