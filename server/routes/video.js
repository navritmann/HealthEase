// server/routes/video.js
import { Router } from "express";
import Appointment from "../models/Appointment.js";

const r = Router();

r.post("/status", async (req, res) => {
  const { roomId, status } = req.body; // "live" | "ended"
  await Appointment.findOneAndUpdate(
    { "video.roomId": roomId },
    {
      $set: {
        "video.status": status,
        ...(status === "live" ? { "video.startedAt": new Date() } : {}),
        ...(status === "ended" ? { "video.endedAt": new Date() } : {}),
      },
    }
  );
  res.json({ ok: true });
});

export default r;
