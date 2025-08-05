// Local: auramist-server/src/middlewares/verifyToken.js

import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // Pega o cabeçalho de autorização
  const authHeader = req.headers['authorization'];
  
  // Extrai o token do cabeçalho (formato "Bearer <token>")
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Se não houver token, retorna o erro 401
    return res.status(401).json({ message: "Token não fornecido." });
  }

  // Verifica a validade do token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }

    // Se for válido, adiciona os dados à requisição e continua
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

export default verifyToken;