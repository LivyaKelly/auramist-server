export function authorizeService(req, res, next) {
  if (req.userRole && (req.userRole === 'PROFESSIONAL' || req.userRole === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({ error: 'Somente profissionais e administradores podem realizar essa ação.' });
}
