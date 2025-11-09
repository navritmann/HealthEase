import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointments.js";
import adminRoutes from "./routes/adminRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

import doctors from "./routes/doctors.js";
import clinics from "./routes/clinics.js";
import availability from "./routes/availability.js";
import payments from "./routes/payments.js";
import servicesRoutes from "./routes/services.js";
import Appointment from "./models/Appointment.js";
import videoRoutes from "./routes/video.js";
dotenv.config();
const app = express();
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
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

nsp.on("connection", (socket) => {
  const { roomId } = socket.data;
  socket.join(roomId);
  nsp.to(roomId).emit("peer:joined", { id: socket.id });

  socket.on("signal:offer", (payload) =>
    socket.to(roomId).emit("signal:offer", { from: socket.id, ...payload })
  );
  socket.on("signal:answer", (payload) =>
    socket.to(roomId).emit("signal:answer", { from: socket.id, ...payload })
  );
  socket.on("signal:ice", (payload) =>
    socket.to(roomId).emit("signal:ice", { from: socket.id, ...payload })
  );

  socket.on("disconnect", () => {
    nsp.to(roomId).emit("peer:left", { id: socket.id });
  });
});
// CORS: allow Authorization header
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health
app.get("/", (req, res) => res.send("HealthEase API Running 🚀"));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctors", doctors);
app.use("/api/clinics", clinics);
app.use("/api/services", servicesRoutes);
app.use("/api/availability", availability);
app.use("/api/payments", payments);
app.use("/api/video", videoRoutes);

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
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
