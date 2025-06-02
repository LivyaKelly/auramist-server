export function authorizeAppointment(req, res, next) {
  if (req.userRole && req.userRole === 'CLIENT') {
    return next();
  }
  return res.status(403).json({ error: 'Apenas clientes podem realizar essa ação.' });
}
