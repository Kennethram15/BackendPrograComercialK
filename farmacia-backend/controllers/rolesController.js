const { Roles } = require('../models');
const createBaseController = require('./baseController');

const rolesController = createBaseController(Roles);

module.exports = rolesController;
