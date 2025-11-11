// server/routes/adminDoctors.js
import { Router } from "express";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";

const r = Router();

/* GET /api/admin/doctors */
r.get("/doctors", async (req, res) => {
  const { q = "" } = req.query;
  const where = q
    ? {
        $or: [
          { name: new RegExp(q, "i") },
          { email: new RegExp(q, "i") },
          { phone: new RegExp(q, "i") },
          { specialty: new RegExp(q, "i") },
        ],
      }
    : {};
  const rows = await Doctor.find(where).sort({ name: 1 }).lean();
  res.json(rows);
});

/* POST /api/admin/doctors */
r.post("/doctors", async (req, res) => {
  try {
    const {
      name,
      specialty,
      email = "",
      phone = "",
      clinics = [],
      status = "Active",
    } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });

    const doc = await Doctor.create({
      name: name.trim(),
      specialty: specialty || "",
      email,
      phone,
      clinics: Array.isArray(clinics) ? clinics : [],
      status,
    });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message || "Create failed" });
  }
});

/* PUT /api/admin/doctors/:id */
r.put("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "invalid id" });
  const patch = {};
  ["name", "specialty", "email", "phone", "status"].forEach((k) => {
    if (req.body?.[k] !== undefined) patch[k] = req.body[k];
  });
  if (req.body?.clinics !== undefined)
    patch.clinics = Array.isArray(req.body.clinics) ? req.body.clinics : [];
  const doc = await Doctor.findByIdAndUpdate(
    id,
    { $set: patch },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: "Doctor not found" });
  res.json(doc);
});

export default r;
