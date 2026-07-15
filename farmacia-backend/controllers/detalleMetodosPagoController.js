const { DetalleMetodosPago, Venta, MetodosPago } = require('../models');
const createBaseController = require('./baseController');

const detalleMetodosPagoController = createBaseController(DetalleMetodosPago, {
  include: [
    { model: Venta, as: 'venta' },
    { model: MetodosPago, as: 'metodoPago' },
  ],
});

module.exports = detalleMetodosPagoController;
