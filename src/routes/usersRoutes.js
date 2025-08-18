import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getProtectedUser, updateCurrentUser, updateUserPicture } from "../controllers/usersController.js";

import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/protected", verifyToken, getProtectedUser);

router.put("/protected", verifyToken, updateCurrentUser);

router.put("/picture", verifyToken, upload.single('profilePicture'), updateUserPicture);

export default router;
