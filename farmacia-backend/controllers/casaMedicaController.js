const { CasaMedica } = require('../models');
const createBaseController = require('./baseController');

const casaMedicaController = createBaseController(CasaMedica);

module.exports = casaMedicaController;
