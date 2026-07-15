require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Carga los modelos y asociaciones antes de sincronizar
    require('./models');

    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    await sequelize.sync({ force: forceSync, alter: !forceSync });
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
