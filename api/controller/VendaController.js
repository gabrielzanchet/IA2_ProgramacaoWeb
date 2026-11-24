const conn = require('../db/conn.js');
const Produto = require('../model/Produto.js');
const CarrinhoItem = require('../model/CarrinhoItem.js');
const Venda = require('../model/Venda.js');
const ItemVenda = require('../model/ItemVenda.js');

function validarId(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
}

const incluirItens = [{ model: ItemVenda, as: 'itens' }];

module.exports = class VendaController {
    // Finaliza a venda usando o que está no carrinho
    static async create(req, res) {
        try {
            const vendaId = await conn.transaction(async (t) => {
                const linhas = await CarrinhoItem.findAll({
                    include: Produto,
                    order: [['id', 'ASC']],
                    transaction: t
                });
                if (linhas.length === 0) return null;

                // o preço vem do banco, nunca do front
                let totalCentavos = 0;
                const itens = linhas.map((linha) => {
                    const preco = Number(linha.Produto.preco);
                    totalCentavos += Math.round(preco * 100) * linha.quantidade;
                    return {
                        produtoId: linha.produtoId,
                        nomeProduto: linha.Produto.nome,
                        precoUnitario: preco,
                        quantidade: linha.quantidade
                    };
                });

                const venda = await Venda.create({ total: totalCentavos / 100 }, { transaction: t });
                await ItemVenda.bulkCreate(
                    itens.map((item) => ({ ...item, vendaId: venda.id })),
                    { transaction: t }
                );
                await CarrinhoItem.destroy({ where: {}, transaction: t });

                return venda.id;
            });

            if (vendaId === null) {
                return res.status(422).json({ message: 'O carrinho está vazio' });
            }

            const venda = await Venda.findByPk(vendaId, { include: incluirItens });
            res.status(201).json({ message: 'Venda finalizada com sucesso', venda });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao finalizar a venda' });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({ include: incluirItens, order: [['id', 'DESC']] });
            res.status(200).json(vendas);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar as vendas' });
        }
    }

    static async getById(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const venda = await Venda.findByPk(id, { include: incluirItens });
            if (!venda) {
                return res.status(404).json({ message: 'Venda não encontrada' });
            }
            res.status(200).json(venda);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar a venda' });
        }
    }
};