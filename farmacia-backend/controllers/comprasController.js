const { Compras, Proveedor, DetalleCompra, Medicamento, Lote } = require('../models');
const createBaseController = require('./baseController');

const includeCompleto = [
  { model: Proveedor, as: 'proveedor' },
  { model: DetalleCompra, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] },
];

const comprasController = createBaseController(Compras, { include: includeCompleto });

// Registra una compra completa: cabecera + detalle de medicamentos,
// generando un lote nuevo por cada línea y sumando existencia al medicamento.
comprasController.crearCompraCompleta = async (req, res) => {
  const { id_proveedor, fecha_compra, detalles } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'La compra debe tener al menos un medicamento' });
  }

  const t = await Compras.sequelize.transaction();

  try {
    const compra = await Compras.create(
      { id_proveedor, fecha_compra, estado_compra: 'recibida', total_compra: 0 },
      { transaction: t }
    );

    let totalCompra = 0;

    for (const item of detalles) {
      const medicamento = await Medicamento.findByPk(item.id_medicamento, { transaction: t });
      if (!medicamento) {
        throw new Error('El medicamento seleccionado ya no existe');
      }
      if (!item.fecha_vencimiento) {
        throw new Error(`Falta la fecha de vencimiento para ${medicamento.nombre_medicamento}`);
      }

      const subtotal = Number(item.precio_lote) * item.cantidad;
      totalCompra += subtotal;

      await DetalleCompra.create(
        {
          id_compra: compra.id_compra,
          id_proveedor,
          id_medicamento: item.id_medicamento,
          cantidad_detalle_compra: item.cantidad,
          subtotal_detalle_compra: subtotal,
        },
        { transaction: t }
      );

      // Genera el lote nuevo que entra por esta compra
      await Lote.create(
        {
          id_medicamento: item.id_medicamento,
          fecha_vencimiento: item.fecha_vencimiento,
          fecha_produccion: item.fecha_produccion || null,
          precio_lote: item.precio_lote,
          existencia_lote: item.cantidad,
        },
        { transaction: t }
      );

      medicamento.existencia_total_medicamento += item.cantidad;
      await medicamento.save({ transaction: t });
    }

    compra.total_compra = totalCompra;
    await compra.save({ transaction: t });

    // Actualiza los acumulados del proveedor
    const proveedor = await Proveedor.findByPk(id_proveedor, { transaction: t });
    if (proveedor) {
      proveedor.total_adquirido_proveedor = Number(proveedor.total_adquirido_proveedor) + totalCompra;
      proveedor.cantidad_adquirido_proveedor += detalles.reduce((acc, d) => acc + Number(d.cantidad), 0);
      await proveedor.save({ transaction: t });
    }

    await t.commit();

    const compraCompleta = await Compras.findByPk(compra.id_compra, { include: includeCompleto });
    res.status(201).json(compraCompleta);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = comprasController;