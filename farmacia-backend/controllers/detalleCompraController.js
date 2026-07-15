const { DetalleCompra, Compras, Proveedor, Medicamento } = require('../models');
const createBaseController = require('./baseController');

const detalleCompraController = createBaseController(DetalleCompra, {
  include: [
    { model: Compras, as: 'compra' },
    { model: Proveedor, as: 'proveedor' },
    { model: Medicamento, as: 'medicamento' },
  ],
});

module.exports = detalleCompraController;
