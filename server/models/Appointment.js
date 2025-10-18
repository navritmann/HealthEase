// models/Appointment.js
import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true }, // e.g., "Echocardiograms"
    amount: { type: Number, required: true }, // 200
    currency: { type: String, default: "USD" }, // or "CAD"
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["stripe", "cash_on_delivery"],
      default: "cash_on_delivery",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String },
    paidAt: { type: Date },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    fileUrl: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // NEW: how/where
  appointmentType: {
    type: String,
    enum: ["clinic", "video", "audio", "chat", "home_visit"],
    default: "clinic",
  },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" }, // required when type=clinic or home_visit
  // optional helper for display:
  clinicName: String,
  clinicAddress: String,

  // slot + duration
  slot: {
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "10:00"
  },
  durationMins: { type: Number, default: 30 },

  // services & pricing
  primaryService: priceSchema, // one main line
  addOnServices: [priceSchema], // optional extras
  bookingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  // patient-facing form
  contact: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  selectedPatientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientProfile",
  }, // for family accounts
  symptoms: String,
  reasonForVisit: String,
  attachments: [attachmentSchema],

  // payment
  payment: paymentSchema,

  // lifecycle
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "no_show"],
    default: "scheduled",
  },
  bookingNumber: { type: String, unique: true }, // e.g., "DCRA12565"
  rescheduleHistory: [
    {
      from: { date: Date, time: String },
      to: { date: Date, time: String },
      changedAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Appointment", appointmentSchema);
