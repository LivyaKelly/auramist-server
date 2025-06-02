export function authorizeAdmin(req, res, next) {
  if (req.userRole && req.userRole === "ADMIN") {
    return next();
  }
  return res
    .status(403)
    .json({ error: "Apenas admins podem realizar essa ação." });
}
