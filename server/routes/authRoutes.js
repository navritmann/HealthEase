import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // hide passwordHash
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
});

export default router;
