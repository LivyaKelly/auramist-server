import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
}
