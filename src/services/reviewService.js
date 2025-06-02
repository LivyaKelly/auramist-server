import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createReview(clientId, rating, comment) {
  return prisma.review.create({
    data: {
      rating,
      comment,
      clientId,
    },
  });
}
