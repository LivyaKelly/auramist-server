import express from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getMyServices,
  uploadImageMiddleware,
} from "../controllers/serviceController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeService } from "../middlewares/authorizeService.js";

const router = express.Router();

router.post("/", verifyToken, authorizeService, uploadImageMiddleware, createService);

router.get("/", getAllServices);
router.get("/my", verifyToken, authorizeService, getMyServices);
router.put("/:id", verifyToken, authorizeService, updateService);
router.delete("/:id", verifyToken, authorizeService, deleteService);

export default router;
