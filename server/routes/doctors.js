import { Router } from "express";
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import Clinic from "../models/Clinic.js";
const r = Router();

r.get("/:id", async (req, res) => {
  const d = await Doctor.findById(req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  res.json(d);
});

r.get("/by-clinic/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!mongoose.isValidObjectId(clinicId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid clinicId" });
    }

    // fetch clinic with doctors populated
    const clinic = await Clinic.findById(clinicId)
      .populate({
        path: "doctors",
        select: "_id name specialty rating photoUrl addressLine",
      })
      .lean();

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, error: "Clinic not found" });
    }

    const doctors = clinic.doctors || [];
    return res.json({ success: true, data: doctors });
  } catch (err) {
    console.error("by-clinic error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
export default r;
