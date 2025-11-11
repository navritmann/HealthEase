// server/routes/adminClinics.js
import { Router } from "express";
import mongoose from "mongoose";
import Clinic from "../models/Clinic.js";

const r = Router();

function buildSearch(q) {
  if (!q) return {};
  const rx = new RegExp(q, "i");
  return {
    $or: [
      { name: rx },
      { address: rx },
      { city: rx },
      { state: rx },
      { distanceLabel: rx },
    ],
  };
}

// GET /api/admin/clinics?q=&page=&limit=
r.get("/clinics", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 200 } = req.query;
    const where = buildSearch(q);
    const lim = Math.min(parseInt(limit || 200, 10), 1000);
    const skip = Math.max(parseInt(page || 1, 10) - 1, 0) * lim;

    const rows = await Clinic.find(where)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await Clinic.countDocuments(where);
    res.json({ rows, total, page: Number(page), limit: lim });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch clinics" });
  }
});

// GET /api/admin/clinics/:id
r.get("/clinics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const row = await Clinic.findById(id).lean();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch clinic" });
  }
});

// POST /api/admin/clinics
r.post("/clinics", async (req, res) => {
  try {
    const {
      name = "",
      address = "",
      city = "",
      state = "",
      logoUrl = "",
      distanceLabel = "",
      doctors = [],
    } = req.body || {};

    if (!name.trim()) return res.status(400).json({ error: "name required" });

    const created = await Clinic.create({
      name: name.trim(),
      address,
      city,
      state,
      logoUrl,
      distanceLabel,
      doctors: Array.isArray(doctors) ? doctors : [],
    });

    res.json(created);
  } catch (e) {
    res.status(500).json({ error: e.message || "Create failed" });
  }
});

// PUT /api/admin/clinics/:id
r.put("/clinics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });

    const patch = {};
    [
      "name",
      "address",
      "city",
      "state",
      "logoUrl",
      "distanceLabel",
      "doctors",
    ].forEach((k) => {
      if (req.body?.[k] !== undefined) patch[k] = req.body[k];
    });
    if (patch.name) patch.name = String(patch.name).trim();
    if (patch.doctors && !Array.isArray(patch.doctors)) patch.doctors = [];

    const row = await Clinic.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Clinic not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Update failed" });
  }
});

// DELETE /api/admin/clinics/:id  (hard delete since no status field)
r.delete("/clinics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const r1 = await Clinic.deleteOne({ _id: id });
    if (!r1.deletedCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
});

export default r;
