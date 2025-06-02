import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAppointmentsByUser(userId) {
  return prisma.appointment.findMany({
    where: { clientId: userId },
    include: { service: true, professional: true },
    orderBy: { date: "asc" },
  });
}
