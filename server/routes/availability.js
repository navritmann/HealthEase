// server/routes/availability.js
import express from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";

const router = express.Router();

router.get("/slots", async (req, res) => {
  try {
    const { type = "clinic", date, clinicId, doctorId } = req.query;
    if (!date)
      return res
        .status(400)
        .json({ success: false, error: "date is required (YYYY-MM-DD)" });
    if ((type === "clinic" || type === "home_visit") && !clinicId) {
      return res
        .status(400)
        .json({ success: false, error: "clinicId required for this type" });
    }

    const matchBase = { blocked: { $ne: true } };
    if (clinicId) matchBase.clinicId = new mongoose.Types.ObjectId(clinicId);
    // if (doctorId) matchBase.doctorId = new mongoose.Types.ObjectId(doctorId);

    const pipeline = [
      { $match: matchBase },
      {
        $addFields: {
          ymdToronto: {
            $dateToString: {
              date: "$start",
              format: "%Y-%m-%d",
              timezone: "America/Toronto",
            },
          },
        },
      },
      { $match: { ymdToronto: date } },
      { $sort: { start: 1 } },
      {
        $project: {
          _id: 1,
          start: 1,
        },
      },
    ];

    const slots = await Availability.aggregate(pipeline);

    // Format time labels in Toronto so they match your UI (e.g. "10:00 AM")
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const data = slots
      .map((s) => ({
        time: fmt.format(new Date(s.start)), // e.g. "10:00 a.m." → normalize AM/PM below
        available: true,
        slotId: String(s._id),
      }))
      // normalize "a.m./p.m." to "AM/PM"
      .map((s) => ({
        ...s,
        time: s.time.replace("a.m.", "AM").replace("p.m.", "PM"),
      }));

    return res.json({
      success: true,
      data,
      meta: {
        tz: "America/Toronto",
        durationMins: type === "home_visit" ? 45 : 30,
        total: data.length,
      },
    });
  } catch (err) {
    console.error("availability/slots error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
