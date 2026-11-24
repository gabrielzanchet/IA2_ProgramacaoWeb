const router = require("express").Router();
const ProdutoController = require("../controller/ProdutoController.js");
const uploadImagem = require("../middleware/upload.js");

router.post('/create', uploadImagem, ProdutoController.create);
router.get('/getAll', ProdutoController.getAll);
router.get('/getById/:id', ProdutoController.getById);
router.patch('/update/:id', uploadImagem, ProdutoController.update);
router.delete('/delete/:id', ProdutoController.delete);

module.exports = router;
