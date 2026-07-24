const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
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
// descontando existencia de Medicamento y de sus Lotes vigentes (el que vence más pronto primero).
ventaController.crearVentaCompleta = async (req, res) => {
  const { id_cliente, id_usuario, id_metodo_pago, detalles } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'La venta debe tener al menos un medicamento' });
  }

  const hoy = new Date().toISOString().slice(0, 10);
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

      let cantidadPendiente = item.cantidad;
      const lotes = await Lote.findAll({
        where: {
          id_medicamento: item.id_medicamento,
          estado_lote: true,
          fecha_vencimiento: { [Op.gte]: hoy },
        },
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
        throw new Error(
          `No hay lotes vigentes suficientes de ${medicamento.nombre_medicamento} (puede que el resto de existencia esté en lotes vencidos)`
        );
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

    const detallesGuardados = await DetalleVenta.findAll({
      where: { id_venta: venta.id_venta },
      transaction: t,
    });
    const sumaDetalles = detallesGuardados.reduce((acc, d) => acc + Number(d.subtotal_detalle_venta), 0);
    if (Math.abs(sumaDetalles - totalVenta) > 0.01) {
      throw new Error('El total de la venta no cuadra con la suma de sus detalles');
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

// Genera el comprobante en PDF de una venta ya registrada
ventaController.generarComprobante = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id, { include: includeCompleto });
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=comprobante_venta_${venta.id_venta}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Sistema de Farmacia', { align: 'center' });
    doc.fontSize(12).text('Comprobante de venta', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`No. de venta: V${venta.id_venta}`);
    doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-GT')}`);
    doc.text(`Cliente: ${venta.cliente?.nombre_cliente || 'Consumidor final'} (NIT: ${venta.cliente?.nit_cliente || 'C/F'})`);
    doc.text(`Atendido por: ${venta.usuario?.nombre_usuario || '—'}`);
    doc.moveDown();

    // Encabezado de la tabla
    const inicioTabla = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Medicamento', 50, inicioTabla, { width: 220 });
    doc.text('Cantidad', 270, inicioTabla, { width: 80, align: 'right' });
    doc.text('Precio unit.', 350, inicioTabla, { width: 90, align: 'right' });
    doc.text('Subtotal', 450, inicioTabla, { width: 90, align: 'right' });
    doc.font('Helvetica');
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);

    venta.detalles.forEach((detalle) => {
      const y = doc.y;
      const cantidad = Number(detalle.cantidad_detalle_venta);
      const subtotal = Number(detalle.subtotal_detalle_venta);
      const precioUnitario = cantidad > 0 ? subtotal / cantidad : 0;

      doc.text(detalle.medicamento?.nombre_medicamento || '—', 50, y, { width: 220 });
      doc.text(String(cantidad), 270, y, { width: 80, align: 'right' });
      doc.text(`Q${precioUnitario.toFixed(2)}`, 350, y, { width: 90, align: 'right' });
      doc.text(`Q${subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      doc.moveDown();
    });

    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold');
    doc.text(`Total: Q${Number(venta.total_venta).toFixed(2)}`, { align: 'right' });
    doc.font('Helvetica');

    const metodos = venta.detalleMetodosPago.map((d) => d.metodoPago?.nombre_metodo_pago).join(', ');
    doc.text(`Método de pago: ${metodos || '—'}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('gray').text('Gracias por su compra.', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el comprobante', error: error.message });
  }
};

module.exports = ventaController;