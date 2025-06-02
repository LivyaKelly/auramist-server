import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createAppointment(req, res) {
  try {
    const { clientId, professionalId, serviceId, date, time } = req.body;
    if (!clientId || !professionalId || !serviceId || !date || !time) {
      return res
        .status(400)
        .json({ mensagem: "Todos os campos são obrigatórios." });
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        professionalId: parseInt(professionalId),
        date: new Date(date),
        time: time,
      },
    });
    if (conflict) {
      return res
        .status(400)
        .json({ mensagem: "Conflito de horário para este profissional." });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        clientId,
        professionalId,
        serviceId,
        date: new Date(date),
        time,
        status: "PENDENTE",
      },
    });

    return res
      .status(201)
      .json({
        mensagem: "Agendamento criado com sucesso!",
        agendamento: newAppointment,
      });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao criar agendamento.", error: err });
  }
}

export async function getAllAppointments(req, res) {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const appointments = await prisma.appointment.findMany({
      where: { clientId: userId },
      include: { service: true, professional: true },
      orderBy: { date: "asc" },
    });

    return res
      .status(200)
      .json({ mensagem: "Lista de agendamentos", agendamentos: appointments });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao listar agendamentos.", error: err });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ mensagem: "Agendamento não encontrado." });

    return res
      .status(200)
      .json({ mensagem: "Agendamento encontrado.", agendamento: appointment });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao buscar agendamento.", error: err });
  }
}

export async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { date, time, status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        time,
        status,
      },
    });
    return res
      .status(200)
      .json({
        mensagem: "Agendamento atualizado com sucesso!",
        agendamento: appointment,
      });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao atualizar agendamento.", error: err });
  }
}

export async function deleteAppointment(req, res) {
  try {
    const id = parseInt(req.params.id);
    await prisma.appointment.delete({ where: { id } });
    return res
      .status(200)
      .json({ mensagem: "Agendamento cancelado com sucesso!" });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao cancelar agendamento.", error: err });
  }
}

export const getAppointmentsByClient = async (req, res) => {
  const { clientId } = req.params;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        service: true,
        professional: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar agendamentos", error });
  }
};
