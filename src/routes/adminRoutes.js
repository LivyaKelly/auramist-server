import express from "express";
import {
  changeRoleToAdmin,
  listAdmins,
  changeRoleFromAdminToClient,
} from "../controllers/adminController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeAdmin } from "../middlewares/authorizeAdmin.js";

const router = express.Router();

router.post("/", verifyToken, authorizeAdmin, changeRoleToAdmin);
router.get("/", verifyToken, authorizeAdmin, listAdmins);
router.delete("/:id", verifyToken, authorizeAdmin, changeRoleFromAdminToClient);

export default router;
