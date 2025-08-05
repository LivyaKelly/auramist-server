import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';

// Importações de Swagger, middlewares e rotas
const swaggerDocument = JSON.parse(fs.readFileSync('./config/swagger-output.json', 'utf8'));
import swaggerUi from 'swagger-ui-express';
import logger from './middlewares/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/usersRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

// --- Middlewares Globais ---
app.use(express.json());
app.use(cookieParser());

// Configuração de CORS para aceitar local e produção
const allowedOrigins = [
  process.env.FRONTEND_URL, // Sua URL de produção (ex: https://auramist.vercel.app)
  'http://localhost:3000'   // CORRIGIDO: URL de desenvolvimento do seu front-end
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS não permite acesso desta origem.'));
    }
  },
  credentials: true,
}));

app.use(logger);

// Documentação da API com Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Rotas da Aplicação ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);


// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001; // CORRIGIDO: A porta padrão do back-end local agora é 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação da API: http://localhost:${PORT}/api-docs`);
});
