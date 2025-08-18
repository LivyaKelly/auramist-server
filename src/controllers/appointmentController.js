import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
const prisma = new PrismaClient();

// --- FUNÇÃO DE CRIAR CORRIGIDA ---
export async function createAppointment(req, res) {
  try {
    const clientId = req.userId;
    const { serviceId, date, time } = req.body; 

    if (!serviceId || !date || !time) {
      return res.status(400).json({ mensagem: "Campos obrigatórios em falta." });
    }

    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });

    if (!service) {
      return res.status(404).json({ mensagem: "Serviço não encontrado." });
    }

    // 2. CORREÇÃO DA DATA COM LUXON
    // A Luxon entende a string, aplica o fuso horário do Brasil,
    // e converte para um objeto Date que o Prisma entende.
    const appointmentDateTime = DateTime.fromISO(`${date}T${time}:00`, { zone: 'America/Sao_Paulo' }).toJSDate();

    // O resto do código continua igual...
    const conflict = await prisma.appointment.findFirst({
      where: {
        professionalId: service.professionalId,
        date: appointmentDateTime,
      },
    });

    if (conflict) {
      return res.status(400).json({ mensagem: "Conflito de horário para este profissional." });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        clientId,
        professionalId: service.professionalId,
        serviceId: service.id,
        date: appointmentDateTime,
        time,
        status: "PENDENTE",
      },
    });

    return res.status(201).json({
      mensagem: "Agendamento criado com sucesso!",
      agendamento: newAppointment,
    });
  } catch (err) {
    console.error("Erro ao criar agendamento:", err)
    return res.status(500).json({
      mensagem: "Erro ao criar agendamento.",
      error: err.message || err,
    });
  }
}
// --- FUNÇÃO DE ATUALIZAR CORRIGIDA ---
export async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { date, time, status } = req.body;
    
    const dataToUpdate = {};

    // Se a data ou a hora estão sendo atualizadas, precisamos recalcular o timestamp
    if (date || time) {
      const currentAppointment = await prisma.appointment.findUnique({ where: { id } });
      if (!currentAppointment) {
        return res.status(404).json({ mensagem: "Agendamento não encontrado." });
      }

      // Pega a nova data/hora se ela foi enviada, senão mantém a antiga
      const newDate = date || currentAppointment.date.toISOString().split('T')[0];
      const newTime = time || currentAppointment.time;

      // Usa a Luxon para criar a nova data com o fuso horário do Brasil
      dataToUpdate.date = DateTime.fromISO(`${newDate}T${newTime}:00`, { 
        zone: 'America/Sao_Paulo' 
      }).toJSDate();
    }
    
    // Adiciona os outros campos ao objeto de atualização se eles foram enviados
    if (time !== undefined) dataToUpdate.time = time;
    if (status !== undefined) dataToUpdate.status = status;

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ mensagem: "Nenhum dado fornecido para atualização." });
    }
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      mensagem: "Agendamento atualizado com sucesso!",
      agendamento: appointment,
    });
  } catch (err) {
    console.error("Erro ao atualizar agendamento:", err);
    return res.status(500).json({ mensagem: "Erro ao atualizar agendamento.", error: err.message });
  }
}

// --- DEMAIS FUNÇÕES (SEM ALTERAÇÕES CRÍTICAS) ---

export async function getAllAppointments(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

    const appointments = await prisma.appointment.findMany({
      where: { clientId: userId },
      include: {
        service: { select: { name: true, urlImage: true } },
        professional: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    return res.status(200).json({ mensagem: "Lista de agendamentos", agendamentos: appointments });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao listar agendamentos.", error: err });
  }
}


export async function getAppointmentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ mensagem: "Agendamento não encontrado." });

    return res.status(200).json({ mensagem: "Agendamento encontrado.", agendamento: appointment });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao buscar agendamento.", error: err });
  }
}

export async function deleteAppointment(req, res) {
  try {
    const id = parseInt(req.params.id);
    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ mensagem: "Agendamento cancelado com sucesso!" });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao cancelar agendamento.", error: err });
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

// 4. MELHORIA: Unifiquei as duas funções de buscar agendamentos do profissional em uma só.
export async function getProfessionalAppointments(req, res) {
  try {
    const professionalId = req.userId;
    const role = req.userRole;

    if (role !== "PROFESSIONAL") {
      return res.status(403).json({ mensagem: "Acesso negado: não é um profissional." });
    }

    const appointments = await prisma.appointment.findMany({
      where: { professionalId },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true, duration: true, price: true, urlImage: true } },
      },
      orderBy: { date: "asc" },
    });

    res.status(200).json({ mensagem: "Agendamentos encontrados", agendamentos: appointments });
  } catch (err) {
    console.error("Erro ao buscar agendamentos do profissional:", err);
    res.status(500).json({ mensagem: "Erro interno", error: err.message || err });
  }
}