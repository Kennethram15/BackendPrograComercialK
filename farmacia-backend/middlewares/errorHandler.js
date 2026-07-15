// Middleware de manejo de errores no controlados (debe ir al final de la cadena)
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor', error: err.message });
}

module.exports = errorHandler;
