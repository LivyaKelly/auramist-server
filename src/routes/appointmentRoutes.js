import express from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByClient,
} from "../controllers/appointmentController.js";
import { authorizeAppointment } from "../middlewares/authorizeAppointment.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getAllAppointments);
router.get("/client/:clientId", verifyToken, getAppointmentsByClient);
router.get("/:id", getAppointmentById);
router.post("/", verifyToken, authorizeAppointment, createAppointment);
router.put("/:id", verifyToken, authorizeAppointment, updateAppointment);
router.delete("/:id", verifyToken, authorizeAppointment, deleteAppointment);

export default router;
