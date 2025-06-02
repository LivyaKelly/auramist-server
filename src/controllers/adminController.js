import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function changeRoleToAdmin(req, res) {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res.status(400).json({ mensagem: "Usuário não encontrado" });

    if (user.role === "ADMIN")
      return res.status(400).json({ mensagem: "Usuário já é admin" });

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: { role: Prisma.Role.ADMIN },
    });

    return res
      .status(200)
      .json({ mensagem: "Usuário promovido a admin", user: updateUser });
  } catch (err) {
    return res
      .status(400)
      .json({ mensagem: "Erro ao promover usuário a admin", error: err });
  }
}

export async function listAdmins(req, res) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: Prisma.Role.ADMIN },
    });
    return res.status(200).json({ mensagem: "Lista de admins", admins });
  } catch (err) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao listar admins", error: err });
  }
}

export async function changeRoleFromAdminToClient(req, res) {
  try {
    const adminId = parseInt(req.params.id);
    const admin = await prisma.user.findUnique({ where: { id: adminId } });

    if (!admin)
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    if (admin.role !== Prisma.Role.ADMIN)
      return res.status(400).json({ mensagem: "Usuário não é admin" });

    const updateUser = await prisma.user.update({
      where: { id: adminId },
      data: { role: Prisma.Role.CLIENT },
    });

    return res
      .status(200)
      .json({
        mensagem: "Usuário removido da lista de admins",
        user: updateUser,
      });
  } catch (err) {
    return res
      .status(400)
      .json({
        mensagem: "Erro ao remover usuário da lista de admins",
        error: err,
      });
  }
}
