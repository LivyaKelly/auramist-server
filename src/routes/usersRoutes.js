import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getProtectedUser, updateCurrentUser, updateUserPicture } from "../controllers/usersController.js";

// --- CORREÇÃO AQUI ---
// 1. Importa o multer para lidar com o upload de ficheiros.
import multer from "multer";

// 2. Configura o multer para guardar os ficheiros temporariamente.
const upload = multer({ dest: "uploads/" });
// --------------------

const router = express.Router();

// Rota para buscar os dados do utilizador (GET)
router.get("/protected", verifyToken, getProtectedUser);

// Rota para atualizar os dados do perfil (nome, telefone, email)
router.put("/protected", verifyToken, updateCurrentUser);

// Rota para atualizar apenas a foto de perfil
router.put("/picture", verifyToken, upload.single('profilePicture'), updateUserPicture);

export default router;
