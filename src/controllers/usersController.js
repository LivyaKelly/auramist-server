import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import fs from "fs";

// Função para buscar os dados do usuário autenticado
export async function getProtectedUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true,
        profilePictureUrl: true
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ message: "Erro interno ao buscar usuário" });
  }
}

// Função para atualizar os dados do usuário autenticado
export async function updateCurrentUser(req, res) {
  try {
    const { name, phone } = req.body;
    const userId = req.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
      select: { // Garante que a senha não seja retornada
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profilePictureUrl: true
      }
    });

    res.status(200).json({ message: "Perfil atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ message: "Erro ao atualizar o perfil." });
  }
}


export async function updateUserPicture(req, res) {
  try {
    const userId = req.userId;
    let profilePictureUrl = null;

    if (req.file) {
      const filePath = req.file.path;
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      profilePictureUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      fs.unlinkSync(filePath);
    } else {
      return res.status(400).json({ message: "Nenhum ficheiro enviado." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl },
      select: {
        id: true, name: true, email: true, phone: true, role: true, profilePictureUrl: true
      }
    });

    res.status(200).json({ message: "Foto de perfil atualizada!", user: updatedUser });

  } catch (error) {
    console.error("Erro ao atualizar a foto de perfil:", error);
    res.status(500).json({ message: "Erro ao atualizar a foto." });
  }
}
