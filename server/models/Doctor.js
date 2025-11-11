// server/models/Doctor.js
import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    photoUrl: { type: String, default: "" },
    addressLine: { type: String, default: "" },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],

    // Added fields for admin management:
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    clinics: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["Active", "On Leave", "Disabled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
