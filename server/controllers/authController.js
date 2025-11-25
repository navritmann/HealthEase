// server/controllers/authController.js
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helpers
const normalizeEmail = (e) => (e || "").trim().toLowerCase();
const MIN_PASS = 6;

// server/controllers/authController.js
export const registerUser = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      phone = "",
      email,
      password,
      // role,  // ❌ DO NOT accept this from public signup
      name, // legacy fallback, if any old UI still sends it
    } = req.body || {};

    const emailNorm = normalizeEmail(email);
    if (!emailNorm || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    if (password.length < MIN_PASS) {
      return res
        .status(400)
        .json({ msg: `Password must be at least ${MIN_PASS} characters` });
    }

    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const resolvedName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      (name || "").trim();
    if (!resolvedName) {
      return res
        .status(400)
        .json({ msg: "Please provide your first and last name" });
    }

    const hash = await bcrypt.hash(password, 10);

    // 1️⃣ Create USER → always PATIENT
    const user = await User.create({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      name: resolvedName,
      email: emailNorm,
      passwordHash: hash,
      role: "patient", // ✅ force patient
    });

    // 2️⃣ Upsert PATIENT (based on email)
    const patient = await Patient.findOneAndUpdate(
      { email: emailNorm },
      {
        $set: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || "",
          email: emailNorm,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      msg: "Registration successful",
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName || user.name,
        phone: user.phone || "",
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      patientId: patient?._id,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const ok = await bcrypt.compare(password || "", user.passwordHash);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, userId: user._id, role: user.role, email: user.email }, // include both keys for safety
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id, // many places use user._id (e.g., patientId)
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName || user.name, // safe display name
        phone: user.phone || "",
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: not an admin" });
    }
    const ok = await bcrypt.compare(password || "", user.passwordHash);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      msg: "Admin login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName || user.name,
        phone: user.phone || "",
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
