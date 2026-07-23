const { Venta, Cliente, Usuarios, DetalleVenta, Medicamento, DetalleMetodosPago, MetodosPago, Lote } = require('../models');
const createBaseController = require('./baseController');

const includeCompleto = [
  { model: Cliente, as: 'cliente' },
  { model: Usuarios, as: 'usuario' },
  { model: DetalleVenta, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] },
  { model: DetalleMetodosPago, as: 'detalleMetodosPago', include: [{ model: MetodosPago, as: 'metodoPago' }] },
];

const ventaController = createBaseController(Venta, { include: includeCompleto });

// Registra una venta completa: cabecera + detalle de medicamentos + método de pago,
// descontando existencia de Medicamento y de sus Lotes (el que vence más pronto primero).
ventaController.crearVentaCompleta = async (req, res) => {
  const { id_cliente, id_usuario, id_metodo_pago, detalles } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'La venta debe tener al menos un medicamento' });
  }

  const t = await Venta.sequelize.transaction();

  try {
    const venta = await Venta.create(
      { id_cliente, id_usuario, estado_venta: 'completada', total_venta: 0 },
      { transaction: t }
    );

    let totalVenta = 0;

    for (const item of detalles) {
      const medicamento = await Medicamento.findByPk(item.id_medicamento, { transaction: t });
      if (!medicamento) {
        throw new Error(`El medicamento seleccionado ya no existe`);
      }
      if (medicamento.existencia_total_medicamento < item.cantidad) {
        throw new Error(`No hay existencia suficiente de ${medicamento.nombre_medicamento}`);
      }

      // Descontar de los lotes activos, el de vencimiento más próximo primero (FEFO)
      let cantidadPendiente = item.cantidad;
      const lotes = await Lote.findAll({
        where: { id_medicamento: item.id_medicamento, estado_lote: true },
        order: [['fecha_vencimiento', 'ASC']],
        transaction: t,
      });

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) break;
        if (lote.existencia_lote <= 0) continue;
        const tomar = Math.min(lote.existencia_lote, cantidadPendiente);
        lote.existencia_lote -= tomar;
        await lote.save({ transaction: t });
        cantidadPendiente -= tomar;
      }

      if (cantidadPendiente > 0) {
        throw new Error(`Los lotes de ${medicamento.nombre_medicamento} no cubren la cantidad solicitada`);
      }

      const subtotal = Number(medicamento.precio_venta) * item.cantidad;
      totalVenta += subtotal;

      await DetalleVenta.create(
        {
          id_medicamento: item.id_medicamento,
          id_venta: venta.id_venta,
          cantidad_detalle_venta: item.cantidad,
          subtotal_detalle_venta: subtotal,
        },
        { transaction: t }
      );

      medicamento.existencia_total_medicamento -= item.cantidad;
      await medicamento.save({ transaction: t });
    }

    venta.total_venta = totalVenta;
    await venta.save({ transaction: t });

    await DetalleMetodosPago.create(
      {
        id_venta: venta.id_venta,
        id_metodo_pago,
        cantidad_detalle_metodos_pago: totalVenta,
      },
      { transaction: t }
    );

    await t.commit();

    const ventaCompleta = await Venta.findByPk(venta.id_venta, { include: includeCompleto });
    res.status(201).json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = ventaController;