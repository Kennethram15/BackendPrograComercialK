const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuarios, Roles } = require('../models');

async function login(req, res) {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
  }

  try {
    const usuarioEncontrado = await Usuarios.findOne({
      where: { usuario },
      include: [{ model: Roles, as: 'rol' }],
    });

    if (!usuarioEncontrado || !usuarioEncontrado.estado_usuario) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const passwordValido = await bcrypt.compare(password, usuarioEncontrado.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const payload = {
      id_usuarios: usuarioEncontrado.id_usuarios,
      nombre_usuario: usuarioEncontrado.nombre_usuario,
      usuario: usuarioEncontrado.usuario,
      id_rol: usuarioEncontrado.id_rol,
      nombre_rol: usuarioEncontrado.rol?.nombre_rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, usuario: payload });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
}

module.exports = { login };