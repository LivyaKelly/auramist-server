import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";

const prisma = new PrismaClient();

const upload = multer({ dest: "uploads/" });
export const uploadImageMiddleware = upload.single("image");

export async function createService(req, res) {
  try {
    const { name, description, duration, price } = req.body;
    const professionalId = req.userId;

    if (!name || !duration || !price || !professionalId || !req.file) {
      return res.status(400).json({
        message: "Campos obrigatórios ausentes (nome, duração, preço, profissional ou imagem).",
      });
    }

    const profissional = await prisma.user.findUnique({
      where: { id: Number(professionalId) },
      select: { name: true },
    });

    if (!profissional) {
      return res.status(404).json({ message: "Profissional não encontrado." });
    }

    const filePath = req.file.path;
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    fs.unlinkSync(filePath);

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        urlImage: imageUrl,
        duration: Number(duration),
        price: parseFloat(price),
        professionalId: Number(professionalId),
        professionalName: profissional.name,
      },
    });

    return res.status(201).json({
      message: "Serviço criado com sucesso",
      servico: newService,
    });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Erro ao criar serviço.", error: error.message });
  }
}

export async function getAllServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      include: {
        professional: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ servicos: services });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({ message: "Erro ao listar serviços." });
  }
}

export async function getServiceById(req, res) {
  try {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

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
    const serviceId = parseInt(req.params.id);
    const { name, description, duration, price, professionalId } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        duration: Number(duration),
        price: parseFloat(price),
        professionalId: Number(professionalId),
      },
    });

    res.json({ message: "Serviço atualizado com sucesso", servico: updated });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ message: "Erro ao atualizar serviço." });
  }
}

export async function deleteService(req, res) {
  const serviceId = parseInt(req.params.id);

  try {
    // Usamos uma transação para garantir que ambas as operações (apagar agendamentos e depois o serviço)
    // aconteçam juntas. Se uma falhar, a outra é desfeita.
    await prisma.$transaction(async (tx) => {
      // 1. Apaga todos os agendamentos associados a este serviço
      await tx.appointment.deleteMany({
        where: {
          serviceId: serviceId,
        },
      });

      // 2. Agora que não há mais agendamentos, apaga o serviço
      await tx.service.delete({
        where: {
          id: serviceId,
        },
      });
    });

    res.status(200).json({ message: "Serviço e agendamentos associados foram deletados com sucesso." });

  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    // Verifica se o erro foi porque o serviço não foi encontrado
    if (error.code === 'P2025') {
       return res.status(404).json({ message: "Serviço não encontrado." });
    }
    res.status(500).json({ message: "Erro ao deletar serviço." });
  }
}

export async function getMyServices(req, res) {
  try {
    const professionalId = req.userId;
    if (!professionalId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const services = await prisma.service.findMany({
      where: { professionalId },
    });
    res.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços do profissional:", error);
    res.status(500).json({ message: "Erro ao buscar serviços." });
  }
}
