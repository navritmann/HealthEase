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
    intentId: String,
    chargeId: String,
  },
  { _id: false }
);

// Keep the field name `video` to match your existing frontend,
// but let it carry all realtime session types: video | audio | chat.
const VideoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
    },
    roomId: String,
    joinUrl: String,
    // TIP: set select:false to avoid leaking the PIN in generic queries.
    // If you need it in a specific endpoint, use .select('+video.pin').
    pin: { type: String /*, select: false */ },
    status: {
      type: String,
      enum: ["pending", "open", "ended"],
      default: "pending",
    },
    startsAt: Date,
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
      required: function () {
        return (
          this.appointmentType === "clinic" ||
          this.appointmentType === "home_visit"
        );
      },
    },
    video: VideoSchema, // holds video/audio/chat session info (joinUrl + pin)
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
    // NOTE: TTL will run on this field; unset it at confirm to avoid accidental expiry.
    holdExpiresAt: Date,
  },
  { timestamps: true }
);

// ---- Validation
AppointmentSchema.path("end").validate(function (v) {
  return v > this.start;
}, "end must be after start");

AppointmentSchema.path("clinicId").validate(function (v) {
  const needsClinic = ["clinic", "home_visit"].includes(this.appointmentType);
  return needsClinic ? !!v : true;
}, "clinicId is required for this appointment type");

// Generate bookingNo if missing
AppointmentSchema.pre("validate", function (next) {
  if (!this.bookingNo) {
    this.bookingNo =
      "DCR" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  next();
});

// ---- Indexes

// 1) Prevent double-booking (doctor+clinic+start) for *active* (held/confirmed) appts.
// Partial filter keeps historical/cancelled out of the uniqueness constraint.
AppointmentSchema.index(
  { doctorId: 1, clinicId: 1, start: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["held", "confirmed"] } },
  }
);

// 2) TTL index to auto-expire HELD drafts once holdExpiresAt passes.
// TTL indexes cannot be partial. To avoid expiring confirmed appts,
// make sure you UNSET holdExpiresAt upon confirm.
AppointmentSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Appointment", AppointmentSchema);
