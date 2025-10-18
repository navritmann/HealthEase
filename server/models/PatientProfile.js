// models/PatientProfile.js
import mongoose from "mongoose";
const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // account owner
  firstName: String,
  lastName: String,
  dob: Date,
  relation: { type: String, default: "self" }, // self, spouse, child, parent
});
export default mongoose.model("PatientProfile", patientProfileSchema);
