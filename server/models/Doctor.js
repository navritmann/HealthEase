import mongoose from "mongoose";
const DoctorSchema = new mongoose.Schema(
  {
    name: String,
    specialty: String,
    rating: Number,
    photoUrl: String,
    addressLine: String,
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
