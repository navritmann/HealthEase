import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.use(authMiddleware); // protect all
router.post("/", createAppointment);
router.get("/", getAppointments);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
