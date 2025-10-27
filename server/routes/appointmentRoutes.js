import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots, // <-- add
} from "../controllers/appointmentController.js";

const router = express.Router();

// PUBLIC: users can browse availability without login
router.get("/available", getAvailableSlots);

// PROTECTED: requires token
router.post("/", authMiddleware, createAppointment);
router.get("/", authMiddleware, getAppointments);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

export default router;
