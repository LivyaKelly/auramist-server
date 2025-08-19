import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";

const prisma = new PrismaClient();

const upload = multer({ dest: "uploads/" });
export const uploadImageMiddleware = upload.single("image");

function fileToDataUrlAndCleanup(file) {
  const filePath = file.path;
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.mimetype};base64,${base64}`;
  fs.unlinkSync(filePath); 
  return dataUrl;
}

export async function createService(req, res) {
  try {
    const { name, description, duration, price } = req.body;
    const professionalId = Number(req.userId);

    if (!name || !duration || !price || !professionalId || !req.file) {
      return res.status(400).json({
        message:
          "Campos obrigatórios ausentes (nome, duração, preço, profissional ou imagem).",
      });
    }

    const profissional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: { name: true },
    });
    if (!profissional) {
      return res.status(404).json({ message: "Profissional não encontrado." });
    }

    const imageUrl = fileToDataUrlAndCleanup(req.file);

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        urlImage: imageUrl,
        duration: Number(duration),
        price: parseFloat(price),
        professionalId: professionalId,
        professionalName: profissional.name,
      },
    });

    return res
      .status(201)
      .json({ message: "Serviço criado com sucesso", servico: newService });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar serviço.", error: error.message });
  }
}

export async function getAllServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      include: {
        professional: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ servicos: services });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({ message: "Erro ao listar serviços." });
  }
}

export async function getServiceById(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    res.json(service);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ message: "Erro ao buscar serviço." });
  }
}

export async function updateService(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const existing = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!existing) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    const userId = Number(req.userId);
    if (existing.professionalId !== userId) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para editar este serviço." });
    }

    const { name, description, duration, price } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (duration !== undefined) data.duration = Number(duration);
    if (price !== undefined) data.price = parseFloat(price);
    if (req.file) {
      data.urlImage = fileToDataUrlAndCleanup(req.file);
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return res.json({ message: "Serviço atualizado com sucesso", servico: updated });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar serviço.", error: error.message });
  }
}

export async function deleteService(req, res) {
  const serviceId = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.appointment.deleteMany({ where: { serviceId } });
      await tx.service.delete({ where: { id: serviceId } });
    });

    res.status(200).json({
      message: "Serviço e agendamentos associados foram deletados com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }
    res.status(500).json({ message: "Erro ao deletar serviço." });
  }
}

export async function getMyServices(req, res) {
  try {
    const professionalId = Number(req.userId);
    if (!professionalId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const services = await prisma.service.findMany({
      where: { professionalId },
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços do profissional:", error);
    res.status(500).json({ message: "Erro ao buscar serviços." });
  }
}
