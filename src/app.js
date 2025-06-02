import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';

// Corrigido: carregando JSON do Swagger manualmente
const swaggerDocument = JSON.parse(fs.readFileSync('./config/swagger-output.json', 'utf8'));
import swaggerUi from 'swagger-ui-express';

// Middlewares
import logger from './middlewares/logger.js';
import verifyToken from './middlewares/verifyToken.js';

// Rotas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/usersRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import uploadImageRouter from './routes/upload-image.js';

// Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const app = express();

// Configurações globais
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(logger);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
app.use('/api/upload-image', uploadImageRouter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Rota protegida de exemplo
app.get('/api/protected', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar usuário' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Swagger disponível em http://localhost:${PORT}/api-docs`);
});
