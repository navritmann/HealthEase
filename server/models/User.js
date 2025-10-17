// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // New fields to match the design
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },

    // Keep existing 'name' for compatibility with any old UI or admin tools
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // Default to "patient" to match your Sign-up page (no role picker)
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual fullName (prefer first/last, fallback to legacy name)
userSchema.virtual("fullName").get(function () {
  if (this.firstName || this.lastName) {
    return [this.firstName, this.lastName].filter(Boolean).join(" ").trim();
  }
  return this.name || "";
});

export default mongoose.model("User", userSchema);
