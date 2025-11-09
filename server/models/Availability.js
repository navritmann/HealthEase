// server/models/Availability.js
import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      default: null,
    }, // null for video/audio/chat
    type: {
      type: String,
      enum: ["clinic", "video", "audio", "chat", "home_visit"],
      default: "clinic",
      index: true,
    },
    // slot start/end in UTC
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true },
    // if true → hide from search
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AvailabilitySchema.index(
  { doctorId: 1, clinicId: 1, type: 1, start: 1 },
  { unique: true }
);

export default mongoose.model("Availability", AvailabilitySchema);
