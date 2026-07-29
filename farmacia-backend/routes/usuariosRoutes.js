const { Router } = require("express");
const controller = require("../controllers/usuariosController");
const { requiereRol } = require("../middlewares/auth");

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", requiereRol('Administrador'), controller.create);
router.put("/:id", requiereRol('Administrador'), controller.update);
router.delete("/:id", requiereRol('Administrador'), controller.remove);

module.exports = router;