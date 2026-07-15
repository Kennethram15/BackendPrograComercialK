const { Compras, Proveedor, DetalleCompra, Medicamento } = require('../models');
const createBaseController = require('./baseController');

const comprasController = createBaseController(Compras, {
  include: [
    { model: Proveedor, as: 'proveedor' },
    { model: DetalleCompra, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] },
  ],
});

module.exports = comprasController;
