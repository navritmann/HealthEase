import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointments.js";
import adminRoutes from "./routes/adminRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
// import doctorRoutes from "./routes/doctorRoutes.js";

import doctors from "./routes/doctors.js";
import clinics from "./routes/clinics.js";
import availability from "./routes/availability.js";
import paymentsRoutes from "./routes/payments.js";
import servicesRoutes from "./routes/services.js";
import Appointment from "./models/Appointment.js";
import videoRoutes from "./routes/video.js";
import adminStats from "./routes/adminStats.js";
import adminAppointments from "./routes/adminAppointments.js";
import adminActions from "./routes/adminActions.js";
import adminDoctors from "./routes/adminDoctors.js";
import adminPatients from "./routes/adminPatients.js";
import adminAvailability from "./routes/adminAvailability.js";
import adminClinics from "./routes/adminClinics.js";
import adminServices from "./routes/adminServices.js";
import adminPayments from "./routes/adminPayments.js";

const app = express();
const httpServer = http.createServer(app);

// 🔐 FRONTEND ORIGIN (works for local + prod)
const rawFrontend = process.env.APP_BASE_URL || "http://localhost:3000";
const FRONTEND_ORIGIN = rawFrontend.replace(/\/$/, "");

// CORS: allow Authorization header
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Stripe webhook preflight
app.options("/api/payments/stripe/checkout", cors());

// 1) Mount the Stripe webhook route BEFORE body parsers
app.use("/api/payments", paymentsRoutes);

// Socket.IO (same origin as frontend)
const io = new SocketIOServer(httpServer, {
  cors: { origin: FRONTEND_ORIGIN, methods: ["GET", "POST"] },
});

const nsp = io.of("/video");

nsp.use(async (socket, next) => {
  const { roomId, pin } = socket.handshake.auth || socket.handshake.query || {};
  if (!roomId) return next(new Error("Missing roomId"));

  const appt = await Appointment.findOne({ "video.roomId": roomId });
  if (!appt) return next(new Error("Room not found"));
  if (appt.video?.pin && pin !== appt.video.pin) {
    return next(new Error("Invalid PIN"));
  }
  socket.data.roomId = roomId;
  socket.data.apptId = String(appt._id);
  next();
});

// --- SINGLE source of truth for /video namespace ---
nsp.on("connection", (socket) => {
  const { roomId } = socket.data;
  socket.join(roomId);

  // Notify only other peers so only an existing participant creates an offer
  socket.to(roomId).emit("peer:joined", { id: socket.id });

  // WebRTC signaling
  socket.on("signal:offer", (payload) => {
    socket.to(roomId).emit("signal:offer", { from: socket.id, ...payload });
  });
  socket.on("signal:answer", (payload) => {
    socket.to(roomId).emit("signal:answer", { from: socket.id, ...payload });
  });
  socket.on("signal:ice", (payload) => {
    socket.to(roomId).emit("signal:ice", { from: socket.id, ...payload });
  });

  // Chat (works for chat-only and alongside A/V)
  socket.on("chat:send", ({ text, displayName }) => {
    if (!text || !String(text).trim()) return;
    nsp.to(roomId).emit("chat:message", {
      from: socket.id,
      displayName: displayName || "Guest",
      text: String(text).slice(0, 2000),
      ts: Date.now(),
    });
  });

  socket.on("chat:typing", ({ typing, displayName }) => {
    socket.to(roomId).emit("chat:typing", {
      from: socket.id,
      displayName: displayName || "Guest",
      typing: !!typing,
    });
  });

  socket.on("disconnect", () => {
    socket.to(roomId).emit("peer:left", { id: socket.id });
  });
});

app.use(express.json());

// Health
app.get("/", (req, res) => res.send("HealthEase API Running 🚀"));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/clinics", clinicRoutes);
// app.use("/api/doctors", doctorRoutes);
app.use("/api/doctors", doctors);
app.use("/api/clinics", clinics);
app.use("/api/services", servicesRoutes);
app.use("/api/availability", availability);
app.use("/api/video", videoRoutes);

app.use("/api/admin", adminStats);
app.use("/api/admin", adminAppointments);
app.use("/api/admin", adminActions);
app.use("/api/admin", adminDoctors);
app.use("/api/admin", adminPatients);
app.use("/api/admin", adminAvailability);
app.use("/api/admin", adminClinics);
app.use("/api/admin", adminServices);
app.use("/api/admin", adminPayments);

// 404
app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

// DB + server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// room -> { sockets: Set<socketId> }
const roomMap = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, displayName }) => {
    socket.join(roomId);

    // track occupants
    if (!roomMap.has(roomId)) roomMap.set(roomId, new Set());
    roomMap.get(roomId).add(socket.id);

    // notify others
    socket.to(roomId).emit("user-joined", { socketId: socket.id, displayName });

    // send back current occupants (excluding the caller)
    const others = [...roomMap.get(roomId)].filter((id) => id !== socket.id);
    socket.emit("peers-in-room", { peers: others });
  });

  socket.on("signal", ({ roomId, to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    const set = roomMap.get(roomId);
    if (set) {
      set.delete(socket.id);
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      if (!set.size) roomMap.delete(roomId);
    }
  });

  socket.on("disconnect", () => {
    // clean from any room it was in
    for (const [roomId, set] of roomMap.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        socket.to(roomId).emit("user-left", { socketId: socket.id });
        if (!set.size) roomMap.delete(roomId);
      }
    }
  });

  // --- Simple chat bridge (fallback) ---
  socket.on("chat:send", ({ text, displayName }) => {
    const { roomId } = socket.data;
    if (!text || !text.trim()) return;
    nsp.to(roomId).emit("chat:message", {
      from: socket.id,
      displayName: displayName || "Guest",
      text: String(text).slice(0, 2000),
      ts: Date.now(),
    });
  });

  socket.on("chat:typing", ({ typing, displayName }) => {
    const { roomId } = socket.data;
    socket.to(roomId).emit("chat:typing", {
      from: socket.id,
      displayName: displayName || "Guest",
      typing: !!typing,
    });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
