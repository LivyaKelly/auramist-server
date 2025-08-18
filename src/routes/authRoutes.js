import express from "express";
import { login, register, getCurrentUser } from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";
import multer from "multer"; 

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post('/register', upload.single('profilePicture'), register);

router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);

export default router;
