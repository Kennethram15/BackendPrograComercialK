const { Router } = require("express");
const controller = require("../controllers/comprasController");

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post('/completa', controller.crearCompraCompleta);
module.exports = router;
