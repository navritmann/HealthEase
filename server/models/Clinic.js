import mongoose from "mongoose";
const ClinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    logoUrl: String,
    distanceLabel: String,
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
  },
  { timestamps: true }
);

export default mongoose.model("Clinic", ClinicSchema);
