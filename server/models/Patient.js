import mongoose from "mongoose";
const PatientSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
  },
  { timestamps: true }
);

PatientSchema.index({ email: 1 });
export default mongoose.model("Patient", PatientSchema);
