const { Medicamento, Presentacion, Lote } = require('../models');
const createBaseController = require('./baseController');

const medicamentoController = createBaseController(Medicamento, {
  include: [
    { model: Presentacion, as: 'presentacion' },
    { model: Lote, as: 'lotes' },
  ],
});

module.exports = medicamentoController;
