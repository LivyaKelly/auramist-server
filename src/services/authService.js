import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function registerUser(data) {
  const { name, email, password, phone, role } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashedPassword, phone, role },
  });
}

export async function validateLogin(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '8h',
  });
  return { token, user };
}
