const { Presentacion } = require('../models');
const createBaseController = require('./baseController');

const presentacionController = createBaseController(Presentacion);

module.exports = presentacionController;
