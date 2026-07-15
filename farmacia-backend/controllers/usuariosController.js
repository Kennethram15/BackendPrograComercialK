const { Usuarios, Roles } = require('../models');
const createBaseController = require('./baseController');

const usuariosController = createBaseController(Usuarios, {
  include: [{ model: Roles, as: 'rol' }],
});

module.exports = usuariosController;
