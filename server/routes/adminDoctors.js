// server/routes/adminDoctors.js
import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { authMiddleware, adminCheck } from "../middleware/authMiddleware.js";

const r = Router();

r.use(authMiddleware, adminCheck);

const normalizeEmail = (e) => (e || "").trim().toLowerCase();

/**
 * Ensure a User with role "doctor" exists for this email.
 * If not, create one with given password.
 */
async function ensureDoctorUser({ name, email, phone, tempPassword }) {
  if (!email) return null;

  const emailNorm = normalizeEmail(email);
  let user = await User.findOne({ email: emailNorm });

  let rawPass = (tempPassword || "").trim();
  if (!rawPass) {
    // default if admin didn't provide
    rawPass = "Doc@" + Math.random().toString(36).slice(2, 8);
  }
  if (rawPass.length < 6) {
    throw new Error("Doctor password must be at least 6 characters");
  }

  const hash = await bcrypt.hash(rawPass, 10);

  if (!user) {
    const parts = (name || "").trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");

    user = await User.create({
      firstName,
      lastName,
      name: name || emailNorm,
      email: emailNorm,
      phone: phone || "",
      passwordHash: hash,
      role: "doctor",
    });

    console.log(
      `[Admin] Created doctor user: ${emailNorm} | temp password: ${rawPass}`
    );
  } else {
    // upgrade / sync existing user (if they were a patient before)
    if (user.role !== "doctor" && user.role !== "admin") {
      user.role = "doctor";
    }
    if (phone) user.phone = phone;
    if (!user.name && name) user.name = name;
    user.passwordHash = hash; // reset to new temp pass
    await user.save();

    console.log(
      `[Admin] Updated doctor user: ${emailNorm} | new temp password: ${rawPass}`
    );
  }

  return user._id;
}

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
      tempPassword, // from admin modal
    } = req.body || {};

    if (!name) return res.status(400).json({ error: "name is required" });
    if (!email) return res.status(400).json({ error: "email is required" });

    // 1) ensure login user exists with role doctor
    await ensureDoctorUser({ name, email, phone, tempPassword });

    // 2) create the Doctor profile
    const doc = await Doctor.create({
      name: name.trim(),
      specialty: specialty || "",
      email: normalizeEmail(email),
      phone,
      clinics: Array.isArray(clinics) ? clinics : [],
      status,
    });

    res.json(doc);
  } catch (e) {
    console.error("admin/doctors POST error:", e);
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
