import { PrismaClient } from "@prisma/client";
import multer from "multer";

const prisma = new PrismaClient();

const upload = multer({ dest: "uploads/" });
export const uploadImageMiddleware = upload.single("image");

export async function createService(req, res) {
  try {
    const { name, description, urlImage, duration, price, professionalId } =
      req.body;

    if (!name || !urlImage || !duration || !price || !professionalId) {
      return res.status(400).json({
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        urlImage,
        duration: Number(duration),
        price: parseFloat(price),
        professionalId: Number(professionalId),
      },
    });

    res
      .status(201)
      .json({ message: "Serviço criado com sucesso", servico: newService });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ message: "Erro ao criar serviço." });
  }
}

export async function getAllServices(req, res) {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
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
  try {
    const serviceId = parseInt(req.params.id);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    await prisma.service.delete({ where: { id: serviceId } });
    res.json({ message: "Serviço deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
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
