/**
 * Genera un controlador CRUD estándar para un modelo de Sequelize.
 * Cada controlador de entidad usa esta fábrica y puede añadir métodos propios.
 *
 * @param {import('sequelize').ModelStatic} model
 * @param {{ include?: any[] }} [options]
 */
function createBaseController(model, options = {}) {
  const include = options.include || [];

  return {
    async getAll(req, res) {
      try {
        const registros = await model.findAll({ include });
        res.json(registros);
      } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros', error: error.message });
      }
    },

    async getById(req, res) {
      try {
        const registro = await model.findByPk(req.params.id, { include });
        if (!registro) {
          return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
        res.json(registro);
      } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el registro', error: error.message });
      }
    },

    async create(req, res) {
      try {
        const nuevoRegistro = await model.create(req.body);
        res.status(201).json(nuevoRegistro);
      } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el registro', error: error.message });
      }
    },

    async update(req, res) {
      try {
        const registro = await model.findByPk(req.params.id);
        if (!registro) {
          return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
        await registro.update(req.body);
        res.json(registro);
      } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar el registro', error: error.message });
      }
    },

    async remove(req, res) {
      try {
        const registro = await model.findByPk(req.params.id);
        if (!registro) {
          return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
        await registro.destroy();
        res.json({ mensaje: 'Registro eliminado correctamente' });
      } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el registro', error: error.message });
      }
    },
  };
}

module.exports = createBaseController;
