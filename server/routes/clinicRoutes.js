// server/routes/clinicRoutes.js
import express from "express";
import Clinic from "../models/Clinic.js";
const router = express.Router();

// PUBLIC: list clinics
router.get("/", async (_req, res) => {
  const clinics = await Clinic.find().select(
    "name address city state zip phone logoUrl"
  );
  res.json({ success: true, data: clinics });
});

export default router;
