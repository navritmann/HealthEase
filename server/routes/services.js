import express from "express";
import Service from "../models/Service.js";
import Doctor from "../models/Doctor.js";
import mongoose from "mongoose";

const r = express.Router();

// GET /api/services  -> list all active services (optionally filter by code)
r.get("/", async (req, res) => {
  const { code } = req.query;
  const q = { active: true, ...(code ? { code: code.toUpperCase() } : {}) };
  const list = await Service.find(q).sort({ name: 1 });
  res.json(list);
});

// GET /api/services/:id  -> single service
r.get("/:id", async (req, res) => {
  const s = await Service.findById(req.params.id);
  if (!s) return res.status(404).json({ error: "Service not found" });
  res.json(s);
});

// GET /api/doctors/:doctorId/services  -> services offered by doctor
r.get("/doctor/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  // Try ObjectId population first
  if (mongoose.isValidObjectId(doctorId)) {
    const doc = await Doctor.findById(doctorId).populate("services");
    if (doc?.services?.length) return res.json(doc.services);
  }

  // If your Doctor has service CODES (strings), resolve them:
  const doc2 = await Doctor.findById(doctorId);
  if (doc2?.services?.length && typeof doc2.services[0] === "string") {
    const svc = await Service.find({
      code: { $in: doc2.services.map((s) => s.toUpperCase()) },
    });
    return res.json(svc);
  }

  res.json([]); // no services configured for this doctor
});

export default r;
