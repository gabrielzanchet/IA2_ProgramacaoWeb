const router = require("express").Router();
const CarrinhoController = require("../controller/CarrinhoController.js");

router.get('/get', CarrinhoController.get);
router.post('/add', CarrinhoController.add);
router.patch('/update/:produtoId', CarrinhoController.update);
router.delete('/remove/:produtoId', CarrinhoController.remove);
router.delete('/clear', CarrinhoController.clear);

module.exports = router;