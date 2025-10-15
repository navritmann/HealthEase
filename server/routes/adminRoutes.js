import express from "express";
import { authMiddleware, adminCheck } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.use(authMiddleware, adminCheck);

// List users
router.get("/users", async (_req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
});

// Update role
router.put("/users/:id", async (req, res) => {
  const { role } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  res.json({ msg: "User role updated", updated });
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

export default router;
