const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Registro manual y explícito de cada modelo (14 entidades del diagrama)
const modelDefiners = [
  require('./CasaMedica'),
  require('./Proveedor'),
  require('./Compras'),
  require('./DetalleCompra'),
  require('./Presentacion'),
  require('./Medicamento'),
  require('./Lote'),
  require('./Cliente'),
  require('./Roles'),
  require('./Usuarios'),
  require('./Venta'),
  require('./DetalleVenta'),
  require('./MetodosPago'),
  require('./DetalleMetodosPago'),
];

modelDefiners.forEach((definer) => {
  const model = definer(sequelize, DataTypes);
  db[model.name] = model;
});

// Ejecutar las asociaciones de cada modelo una vez que todos existen en `db`
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
