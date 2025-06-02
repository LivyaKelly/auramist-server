import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createReview(req, res) {
  try {
    const { rating, comment, clientId } = req.body;

    if (!rating || !clientId) {
      return res
        .status(400)
        .json({ message: "Nota e ID do cliente são obrigatórios." });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        clientId,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ message: "Erro ao criar avaliação." });
  }
}

export async function getAllReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    res.status(500).json({ message: "Erro ao listar avaliações." });
  }
}
