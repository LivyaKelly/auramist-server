import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

const prisma = new PrismaClient();

export async function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;
    let profilePictureUrl = null;

    // Processa a imagem se ela foi enviada
    if (req.file) {
      const filePath = req.file.path;
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      profilePictureUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      fs.unlinkSync(filePath); // Apaga o arquivo temporário
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário com a URL da foto
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        profilePictureUrl, // Salva a imagem no campo correto
      },
    });

    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({ message: "Usuário registrado com sucesso!", user: userResponse });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao registrar usuário." });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // CORRETO: Envia o token na resposta para ser salvo no localStorage.
    res.status(200).json({
      message: "Login realizado com sucesso!",
      token: token,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login." });
  }
}

export async function getCurrentUser(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário logado:", error);
    res.status(500).json({ message: "Erro interno ao buscar usuário." });
  }
}
