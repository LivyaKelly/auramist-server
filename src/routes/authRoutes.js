import express from "express";
import { login, register, getCurrentUser } from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken, getCurrentUser);

export default router;