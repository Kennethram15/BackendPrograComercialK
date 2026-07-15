const { Lote, Medicamento } = require('../models');
const createBaseController = require('./baseController');

const loteController = createBaseController(Lote, {
  include: [{ model: Medicamento, as: 'medicamento' }],
});

module.exports = loteController;
