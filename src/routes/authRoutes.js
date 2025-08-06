import express from "express";
import { login, register, getCurrentUser } from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";
import multer from "multer"; // 1. Importe o multer

// 2. Configure o multer para salvar arquivos temporariamente
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// 3. Adicione o middleware 'upload' ANTES da função 'register'
//    Ele vai processar o campo 'profilePicture' do seu formulário
router.post('/register', upload.single('profilePicture'), register);

router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);


export default router;