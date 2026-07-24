const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token' });
  }

  const token = header.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.nombre_rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };