const { Venta, Cliente, Usuarios, DetalleVenta, Medicamento, DetalleMetodosPago, MetodosPago } = require('../models');
const createBaseController = require('./baseController');

const includeCompleto = [
  { model: Cliente, as: 'cliente' },
  { model: Usuarios, as: 'usuario' },
  { model: DetalleVenta, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] },
  { model: DetalleMetodosPago, as: 'detalleMetodosPago', include: [{ model: MetodosPago, as: 'metodoPago' }] },
];

const ventaController = createBaseController(Venta, { include: includeCompleto });

module.exports = ventaController;
