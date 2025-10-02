import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicines: [
    {
      name: String,
      dosage: String,
      duration: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Prescription", prescriptionSchema);
