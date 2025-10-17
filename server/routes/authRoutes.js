// server/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// List users (secured)
router.get("/users", authMiddleware, async (_req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
});

// Doctors list (public for booking dropdown)
router.get("/doctors", async (_req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "firstName lastName name _id email"
    );
    // Prefer full name on the wire for UI
    const shaped = doctors.map((d) => ({
      _id: d._id,
      name:
        d.firstName || d.lastName
          ? `${d.firstName || ""} ${d.lastName || ""}`.trim()
          : d.name || "",
      email: d.email,
    }));
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching doctors", error: err.message });
  }
});

// Admin login
router.post("/admin-login", adminLogin);

export default router;
