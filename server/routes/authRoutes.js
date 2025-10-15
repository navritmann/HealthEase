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

// List users (for dropdowns etc.)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
});

// Admin login (only admins pass)
router.post("/admin-login", adminLogin);

export default router;
