import mongoose from "mongoose";

const AddOnSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true }, // e.g., "ECHO"
    name: { type: String, required: true }, // "Echocardiogram"
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    }, // e.g., "CARDIO_30"
    name: { type: String, required: true }, // "Cardiology Consultation"
    durationMins: { type: Number, required: true, min: 1 }, // 30
    basePrice: { type: Number, required: true, min: 0 }, // 200
    description: { type: String },
    addOns: [AddOnSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);
