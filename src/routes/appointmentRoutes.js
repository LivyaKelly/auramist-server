import express from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByClient,
  getProfessionalAppointments
} from "../controllers/appointmentController.js";
import { authorizeAppointment } from "../middlewares/authorizeAppointment.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllAppointments);
router.post("/", verifyToken, authorizeAppointment, createAppointment);

router.get("/client/:clientId", verifyToken, getAppointmentsByClient);
router.get("/professional", verifyToken, getProfessionalAppointments);

router.get("/:id", verifyToken, getAppointmentById);
router.put("/:id", verifyToken, authorizeAppointment, updateAppointment);
router.delete("/:id", verifyToken, authorizeAppointment, deleteAppointment);
router.delete("/professional/:id", verifyToken, deleteAppointment); 

export default router;
