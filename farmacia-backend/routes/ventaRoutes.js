const { Router } = require("express");
const controller = require("../controllers/ventaController");

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/:id/comprobante", controller.generarComprobante);
router.post("/", controller.create);
router.post("/completa", controller.crearVentaCompleta);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;