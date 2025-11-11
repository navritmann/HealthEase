// server/routes/adminServices.js
import { Router } from "express";
import mongoose from "mongoose";
import Service from "../models/Service.js";

const r = Router();

function buildSearch(q) {
  if (!q) return {};
  const rx = new RegExp(q, "i");
  return {
    $or: [
      { code: rx },
      { name: rx },
      { description: rx },
      { "addOns.code": rx },
      { "addOns.name": rx },
      { "addOns.description": rx },
    ],
  };
}

// GET /api/admin/services?q=&page=&limit=&active=
r.get("/services", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 200, active } = req.query;
    const where = buildSearch(q);
    if (active === "true") where.active = true;
    if (active === "false") where.active = false;

    const lim = Math.min(parseInt(limit || 200, 10), 1000);
    const skip = Math.max(parseInt(page || 1, 10) - 1, 0) * lim;

    const [rows, total] = await Promise.all([
      Service.find(where).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Service.countDocuments(where),
    ]);
    res.json({ rows, total, page: Number(page), limit: lim });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch services" });
  }
});

// GET /api/admin/services/:id
r.get("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });
    const row = await Service.findById(id).lean();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch service" });
  }
});

// POST /api/admin/services
r.post("/services", async (req, res) => {
  try {
    const {
      code = "",
      name = "",
      durationMins,
      basePrice,
      description = "",
      addOns = [],
      active = true,
    } = req.body || {};

    if (!code.trim() || !name.trim())
      return res.status(400).json({ error: "code and name are required" });

    const cleanAddOns = (Array.isArray(addOns) ? addOns : []).map((a) => ({
      code: String(a.code || "")
        .trim()
        .toUpperCase(),
      name: String(a.name || "").trim(),
      price: Number(a.price || 0),
      description: a.description || "",
      active: a.active !== false,
    }));

    const created = await Service.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      durationMins: Number(durationMins) || 30,
      basePrice: Number(basePrice) || 0,
      description,
      addOns: cleanAddOns,
      active: !!active,
    });

    res.json(created);
  } catch (e) {
    // duplicate code unique index
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Service code already exists" });
    }
    res.status(500).json({ error: e.message || "Create failed" });
  }
});

// PUT /api/admin/services/:id
r.put("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });

    const patch = {};
    if (req.body.code !== undefined)
      patch.code = String(req.body.code).trim().toUpperCase();
    if (req.body.name !== undefined) patch.name = String(req.body.name).trim();
    if (req.body.durationMins !== undefined)
      patch.durationMins = Number(req.body.durationMins) || 30;
    if (req.body.basePrice !== undefined)
      patch.basePrice = Number(req.body.basePrice) || 0;
    if (req.body.description !== undefined)
      patch.description = req.body.description || "";
    if (req.body.active !== undefined) patch.active = !!req.body.active;

    if (req.body.addOns !== undefined) {
      const arr = Array.isArray(req.body.addOns) ? req.body.addOns : [];
      patch.addOns = arr.map((a) => ({
        code: String(a.code || "")
          .trim()
          .toUpperCase(),
        name: String(a.name || "").trim(),
        price: Number(a.price || 0),
        description: a.description || "",
        active: a.active !== false,
      }));
    }

    const row = await Service.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true }
    );
    if (!row) return res.status(404).json({ error: "Service not found" });
    res.json(row);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Service code already exists" });
    }
    res.status(500).json({ error: e.message || "Update failed" });
  }
});

// DELETE /api/admin/services/:id  (soft delete → active=false)
r.delete("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "invalid id" });

    const row = await Service.findByIdAndUpdate(
      id,
      { $set: { active: false } },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
});

export default r;
