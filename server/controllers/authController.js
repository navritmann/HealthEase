// server/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helpers
const normalizeEmail = (e) => (e || "").trim().toLowerCase();
const MIN_PASS = 6;

export const registerUser = async (req, res) => {
  try {
    // New UI sends: firstName, lastName, email, phone, password
    // Old UI may send: name, email, password, role
    const {
      firstName = "",
      lastName = "",
      phone = "",
      name, // legacy single name (optional)
      email,
      password,
      role, // optional; defaults to "patient" in schema
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

    // Preferred display name = firstName + lastName; fallback to legacy 'name'
    const resolvedName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      (name || "").trim();
    if (!resolvedName) {
      return res
        .status(400)
        .json({ msg: "Please provide your first and last name" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      name: resolvedName, // keep for compatibility
      email: emailNorm,
      passwordHash: hash,
      role: role || "patient", // if old UI sends role, we honor it
    });

    // Return both id and _id for compatibility with any client usage
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
      { id: user._id, userId: user._id, role: user.role }, // include both keys for safety
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
