import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: { type: String, required: true }, // GridFS or cloud storage
  description: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Record", recordSchema);
