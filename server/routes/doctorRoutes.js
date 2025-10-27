// server/routes/doctorRoutes.js
import express from "express";
import User from "../models/User.js";
const router = express.Router();

// PUBLIC: list doctors (only minimal fields)
router.get("/", async (_req, res) => {
  const docs = await User.find({ role: "doctor" }).select(
    "name specialty photoUrl rating"
  );
  res.json({ success: true, data: docs });
});

// PUBLIC: doctor detail (optional)
router.get("/:id", async (req, res) => {
  const doc = await User.findById(req.params.id).select(
    "name specialty photoUrl rating"
  );
  res.json(doc);
});

export default router;
