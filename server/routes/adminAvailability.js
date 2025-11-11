import { Router } from "express";
import mongoose from "mongoose";
import Availability from "../models/Availability.js";

const r = Router();

/**
 * GET /api/admin/availability?doctorId=&from=&to=&type=&clinicId=
 * Returns plain array of slots
 */
r.get("/availability", async (req, res) => {
  try {
    const { doctorId, from, to, type, clinicId } = req.query;
    if (!doctorId) return res.status(400).json({ error: "doctorId required" });
    if (!from || !to)
      return res.status(400).json({ error: "from and to ISO required" });

    const where = {
      doctorId,
      start: { $gte: new Date(from) },
      end: { $lte: new Date(to) },
    };
    if (type) where.type = type;
    if (clinicId) where.clinicId = clinicId === "null" ? null : clinicId;

    const rows = await Availability.find(where).sort({ start: 1 });
    res.json(rows);
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message || "Failed to fetch availability" });
  }
});

/**
 * POST /api/admin/availability
 * body: { doctorId, start, end, type="clinic", clinicId=null, blocked=false }
 */
r.post("/availability", async (req, res) => {
  try {
    let {
      doctorId,
      start,
      end,
      type = "clinic",
      clinicId = null,
      blocked = false,
    } = req.body || {};
    if (!doctorId || !start || !end)
      return res.status(400).json({ error: "doctorId, start, end required" });

    // Ensure clinicId = null is stored as null (not undefined/"")
    if (clinicId === "" || clinicId === undefined) clinicId = null;

    // Rely on your unique index {doctorId, clinicId, type, start}
    const slot = await Availability.create({
      doctorId,
      clinicId,
      type,
      start,
      end,
      blocked: !!blocked,
    });
    res.json(slot);
  } catch (e) {
    if (e?.code === 11000)
      return res.status(409).json({ error: "Slot already exists" });
    res.status(500).json({ error: e.message || "Create failed" });
  }
});

/**
 * PATCH /api/admin/availability/:id
 * body: { blocked?: boolean }
 */
r.patch("/availability/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const patch = {};
    if (typeof req.body?.blocked === "boolean")
      patch.blocked = req.body.blocked;

    const row = await Availability.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Update failed" });
  }
});

/**
 * DELETE /api/admin/availability/:id
 * (only allow delete when not blocked)
 */
r.delete("/availability/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });

    const row = await Availability.findById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.blocked)
      return res
        .status(400)
        .json({ error: "Cannot delete blocked/booked slot" });

    await Availability.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
});

export default r;
