const { MetodosPago } = require('../models');
const createBaseController = require('./baseController');

const metodosPagoController = createBaseController(MetodosPago);

module.exports = metodosPagoController;
