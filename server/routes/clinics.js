import { Router } from "express";
import Clinic from "../models/Clinic.js";
const r = Router();

// All clinics (optionally filter by doctorId)
r.get("/", async (req, res) => {
  const { doctorId } = req.query;
  const q = doctorId ? { doctors: doctorId } : {};
  const items = await Clinic.find(q).limit(100);
  res.json(items);
});

export default r;
