import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/protected", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno ao buscar usuário" });
  }
});

export default router;
