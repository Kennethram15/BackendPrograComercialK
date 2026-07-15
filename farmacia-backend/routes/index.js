const { Router } = require('express');

const router = Router();

router.use('/casas-medicas', require('./casaMedicaRoutes'));
router.use('/proveedores', require('./proveedorRoutes'));
router.use('/compras', require('./comprasRoutes'));
router.use('/detalle-compras', require('./detalleCompraRoutes'));
router.use('/presentaciones', require('./presentacionRoutes'));
router.use('/medicamentos', require('./medicamentoRoutes'));
router.use('/lotes', require('./loteRoutes'));
router.use('/clientes', require('./clienteRoutes'));
router.use('/roles', require('./rolesRoutes'));
router.use('/usuarios', require('./usuariosRoutes'));
router.use('/ventas', require('./ventaRoutes'));
router.use('/detalle-ventas', require('./detalleVentaRoutes'));
router.use('/metodos-pago', require('./metodosPagoRoutes'));
router.use('/detalle-metodos-pago', require('./detalleMetodosPagoRoutes'));

module.exports = router;
