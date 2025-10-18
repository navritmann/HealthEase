// models/Clinic.js
import mongoose from "mongoose";
const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  zip: String,
  geo: { lat: Number, lng: Number }, // optional
  phone: String,
  logoUrl: String,
});
export default mongoose.model("Clinic", clinicSchema);
