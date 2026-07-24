require('dotenv').config();
const { Usuarios, Roles } = require('../models');

async function main() {
  const [usuario, password, nombreCompleto, nombreRol] = process.argv.slice(2);

  if (!usuario || !password || !nombreCompleto || !nombreRol) {
    console.log('Uso: node scripts/crearUsuario.js <usuario> <password> "<nombre completo>" <nombre_rol>');
    console.log('Ejemplo: node scripts/crearUsuario.js kenneth 12345678 "Kenneth Garcia" Administrador');
    process.exit(1);
  }

  const rol = await Roles.findOne({ where: { nombre_rol: nombreRol } });
  if (!rol) {
    console.log(`No existe el rol "${nombreRol}". Roles disponibles: Administrador, Vendedor, Bodeguero`);
    process.exit(1);
  }

  const nuevo = await Usuarios.create({
    usuario,
    password,
    nombre_usuario: nombreCompleto,
    id_rol: rol.id_rol,
  });

  console.log(`Usuario "${nuevo.usuario}" creado correctamente con rol ${nombreRol}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Error al crear el usuario:', error.message);
  process.exit(1);
});