// server/routes/adminPatients.js
import { Router } from "express";
import mongoose from "mongoose";
import Patient from "../models/Patient.js";

const r = Router();

/**
 * Helpers
 */
function buildSearchQuery(q) {
  if (!q) return {};
  const rx = new RegExp(q, "i");
  return {
    $or: [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { phone: rx },
      { gender: rx },
    ],
  };
}

/**
 * GET /api/admin/patients
 * ?q=&limit=&page=
 */
r.get("/patients", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 200 } = req.query;
    const where = buildSearchQuery(q);
    const lim = Math.min(parseInt(limit || 200, 10), 1000);
    const skip = Math.max(parseInt(page || 1, 10) - 1, 0) * lim;

    const [rows, total] = await Promise.all([
      Patient.find(where).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Patient.countDocuments(where),
    ]);

    res.json({ rows, total, page: Number(page), limit: lim });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch patients" });
  }
});

/**
 * GET /api/admin/patients/:id
 */
r.get("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const row = await Patient.findById(id).lean();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch patient" });
  }
});

/**
 * POST /api/admin/patients
 */
r.post("/patients", async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      email = "",
      phone = "",
      gender = "",
      dob = null,
      address = "",
      status = "Active",
    } = req.body || {};

    if (!firstName?.trim() || !lastName?.trim())
      return res.status(400).json({ error: "firstName and lastName required" });

    // Upsert by email if provided
    let created;
    if (email) {
      created = await Patient.findOneAndUpdate(
        { email },
        {
          $set: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || "",
            gender,
            dob: dob ? new Date(dob) : null,
            address: address || "",
            status,
          },
          $setOnInsert: { email },
        },
        { new: true, upsert: true }
      );
    } else {
      created = await Patient.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: "",
        phone: phone?.trim() || "",
        gender,
        dob: dob ? new Date(dob) : null,
        address: address || "",
        status,
      });
    }

    res.json(created);
  } catch (e) {
    res.status(500).json({ error: e.message || "Create failed" });
  }
});

/**
 * PUT /api/admin/patients/:id
 */
r.put("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });

    const patch = {};
    [
      "firstName",
      "lastName",
      "email",
      "phone",
      "gender",
      "address",
      "status",
    ].forEach((k) => {
      if (req.body?.[k] !== undefined) patch[k] = req.body[k];
    });
    if (req.body?.dob !== undefined)
      patch.dob = req.body.dob ? new Date(req.body.dob) : null;

    const row = await Patient.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Patient not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Update failed" });
  }
});

/**
 * DELETE /api/admin/patients/:id
 * (soft delete via status = Disabled)
 */
r.delete("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const row = await Patient.findByIdAndUpdate(
      id,
      { $set: { status: "Disabled" } },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
});

export default r;
