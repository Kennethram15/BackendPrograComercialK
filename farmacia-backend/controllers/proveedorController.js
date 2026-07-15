const { Proveedor, CasaMedica } = require('../models');
const createBaseController = require('./baseController');

const proveedorController = createBaseController(Proveedor, {
  include: [{ model: CasaMedica, as: 'casaMedica' }],
});

module.exports = proveedorController;
