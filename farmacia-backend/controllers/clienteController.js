const { Cliente } = require('../models');
const createBaseController = require('./baseController');

const clienteController = createBaseController(Cliente);

module.exports = clienteController;
