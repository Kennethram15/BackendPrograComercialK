const { Router } = require('express');
const {
  obtenerAlertas,
  ventasPorPeriodo,
  medicamentosMasVendidos,
  generarReportePdf,
} = require('../controllers/reporteController');

const router = Router();

router.get('/alertas', obtenerAlertas);
router.get('/ventas-periodo', ventasPorPeriodo);
router.get('/ventas-periodo/pdf', generarReportePdf);
router.get('/medicamentos-mas-vendidos', medicamentosMasVendidos);

module.exports = router;