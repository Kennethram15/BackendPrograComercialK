const { Router } = require("express");
const controller = require("../controllers/rolesController");
const { requiereRol } = require("../middlewares/auth");

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", requiereRol('Administrador'), controller.remove);

module.exports = router;