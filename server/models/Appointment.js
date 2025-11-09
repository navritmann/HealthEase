import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "requires_payment", "paid", "failed", "refunded"],
      default: "pending",
    },
    currency: { type: String, default: "USD" },
    amount: Number,
    gateway: { type: String, default: "stripe" },
    intentId: String, // Stripe PaymentIntent id
    chargeId: String, // Stripe charge id
  },
  { _id: false }
);

const VideoSchema = new mongoose.Schema(
  {
    roomId: String,
    joinUrl: String,
    pin: String, // simple shared secret
    status: {
      type: String,
      enum: ["pending", "open", "ended"],
      default: "pending",
    },
    startsAt: Date, // optional: window checks
    endsAt: Date,
  },
  { _id: false }
);

const AppointmentSchema = new mongoose.Schema(
  {
    bookingNo: { type: String, unique: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      // Only enforce a doctor for in-person or home-visit appointments
      required: function () {
        return (
          this.appointmentType === "clinic" ||
          this.appointmentType === "home_visit"
        );
      },
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      // Require clinic only when it's an in-person or home-visit appointment
      required: function () {
        return (
          this.appointmentType === "clinic" ||
          this.appointmentType === "home_visit"
        );
      },
    },
    video: VideoSchema,
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: function () {
        // require a patient only when it's not a 'held' draft
        return this.status !== "held";
      },
    },
    appointmentType: {
      type: String,
      enum: ["clinic", "video", "audio", "chat", "home_visit"],
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["held", "confirmed", "cancelled", "rescheduled"],
      default: "held",
    },
    payment: PaymentSchema,
    holdExpiresAt: Date, // for temporary holds before payment
  },
  { timestamps: true }
);

// Prevent double booking: unique on confirmed/held active slots
AppointmentSchema.index(
  { doctorId: 1, clinicId: 1, start: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["held", "confirmed"] } },
  },
  { holdExpiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "held" } }
);

AppointmentSchema.path("end").validate(function (v) {
  return v > this.start;
}, "end must be after start");

AppointmentSchema.path("clinicId").validate(function (v) {
  const needsClinic = ["clinic", "home_visit"].includes(this.appointmentType);
  return needsClinic ? !!v : true;
}, "clinicId is required for this appointment type");

AppointmentSchema.pre("validate", function (next) {
  if (!this.bookingNo) {
    this.bookingNo =
      "DCR" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model("Appointment", AppointmentSchema);
