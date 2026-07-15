const { DetalleVenta, Venta, Medicamento } = require('../models');
const createBaseController = require('./baseController');

const detalleVentaController = createBaseController(DetalleVenta, {
  include: [
    { model: Venta, as: 'venta' },
    { model: Medicamento, as: 'medicamento' },
  ],
});

module.exports = detalleVentaController;
