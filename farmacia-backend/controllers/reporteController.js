const { Op, fn, col, literal } = require('sequelize');
const PDFDocument = require('pdfkit');
const { Medicamento, Lote, Venta, DetalleVenta } = require('../models');

// Alertas: medicamentos con poco stock y lotes que vencen pronto
async function obtenerAlertas(req, res) {
  try {
    const umbralStock = Number(req.query.umbral_stock) || 20;
    const diasVencimiento = Number(req.query.dias_vencimiento) || 30;

    const hoy = new Date();
    const limiteVencimiento = new Date();
    limiteVencimiento.setDate(hoy.getDate() + diasVencimiento);

    const stockBajo = await Medicamento.findAll({
      where: {
        estado_medicamento: true,
        existencia_total_medicamento: { [Op.lte]: umbralStock },
      },
      order: [['existencia_total_medicamento', 'ASC']],
    });

    const lotesPorVencer = await Lote.findAll({
      where: {
        estado_lote: true,
        existencia_lote: { [Op.gt]: 0 },
        fecha_vencimiento: {
          [Op.between]: [hoy.toISOString().slice(0, 10), limiteVencimiento.toISOString().slice(0, 10)],
        },
      },
      include: [{ model: Medicamento, as: 'medicamento' }],
      order: [['fecha_vencimiento', 'ASC']],
    });

    res.json({ stockBajo, lotesPorVencer });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alertas', error: error.message });
  }
}

async function obtenerDatosReporte(fecha_inicio, fecha_fin) {
  const ventas = await Venta.findAll({
    where: {
      fecha_venta: {
        [Op.between]: [`${fecha_inicio} 00:00:00`, `${fecha_fin} 23:59:59`],
      },
    },
    order: [['fecha_venta', 'ASC']],
  });
  const totalPeriodo = ventas.reduce((acc, v) => acc + Number(v.total_venta), 0);

  const masVendidos = await DetalleVenta.findAll({
    attributes: [
      'id_medicamento',
      [fn('SUM', col('cantidad_detalle_venta')), 'total_cantidad'],
      [fn('SUM', col('subtotal_detalle_venta')), 'total_ingresos'],
    ],
    include: [
      { model: Medicamento, as: 'medicamento', attributes: ['nombre_medicamento'] },
      {
        model: Venta,
        as: 'venta',
        attributes: [],
        where: {
          fecha_venta: {
            [Op.between]: [`${fecha_inicio} 00:00:00`, `${fecha_fin} 23:59:59`],
          },
        },
      },
    ],
    group: ['id_medicamento', 'medicamento.id_medicamento'],
    order: [[literal('total_cantidad'), 'DESC']],
    limit: 10,
  });

  return { ventas, totalPeriodo, masVendidos };
}

// Reporte: ventas en un rango de fechas, con su total acumulado
async function ventasPorPeriodo(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ mensaje: 'fecha_inicio y fecha_fin son requeridos' });
    }
    const { ventas, totalPeriodo } = await obtenerDatosReporte(fecha_inicio, fecha_fin);
    res.json({ ventas, totalPeriodo, cantidadVentas: ventas.length });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el reporte', error: error.message });
  }
}

// Reporte: medicamentos más vendidos (por cantidad) en un rango de fechas
async function medicamentosMasVendidos(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ mensaje: 'fecha_inicio y fecha_fin son requeridos' });
    }
    const { masVendidos } = await obtenerDatosReporte(fecha_inicio, fecha_fin);
    res.json(masVendidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el reporte', error: error.message });
  }
}

// Genera el reporte de ventas por período (con medicamentos más vendidos) en PDF
async function generarReportePdf(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ mensaje: 'fecha_inicio y fecha_fin son requeridos' });
    }

    const { ventas, totalPeriodo, masVendidos } = await obtenerDatosReporte(fecha_inicio, fecha_fin);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${fecha_inicio}_a_${fecha_fin}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Sistema de Farmacia', { align: 'center' });
    doc.fontSize(12).text('Reporte de ventas por período', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Período: ${fecha_inicio} a ${fecha_fin}`);
    doc.text(`Cantidad de ventas: ${ventas.length}`);
    doc.text(`Total vendido: Q${totalPeriodo.toFixed(2)}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Medicamentos más vendidos', { underline: false });
    doc.font('Helvetica');
    doc.moveDown(0.5);

    const inicioTabla = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Medicamento', 50, inicioTabla, { width: 250 });
    doc.text('Cantidad', 300, inicioTabla, { width: 100, align: 'right' });
    doc.text('Ingresos', 400, inicioTabla, { width: 140, align: 'right' });
    doc.font('Helvetica');
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);

    if (masVendidos.length === 0) {
      doc.text('No hay ventas registradas en este período.');
    }

    masVendidos.forEach((m) => {
      const y = doc.y;
      doc.text(m.medicamento?.nombre_medicamento || '—', 50, y, { width: 250 });
      doc.text(String(m.dataValues.total_cantidad), 300, y, { width: 100, align: 'right' });
      doc.text(`Q${Number(m.dataValues.total_ingresos).toFixed(2)}`, 400, y, { width: 140, align: 'right' });
      doc.moveDown();
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('gray').text('Reporte generado automáticamente.', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar el PDF', error: error.message });
  }
}

module.exports = { obtenerAlertas, ventasPorPeriodo, medicamentosMasVendidos, generarReportePdf };