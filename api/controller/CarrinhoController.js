const Produto = require('../model/Produto.js');
const CarrinhoItem = require('../model/CarrinhoItem.js');

const QTD_MAX = 99;

// ---- validações ----
function validarId(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function validarQuantidade(quantidade) {
    if (quantidade === null || quantidade === undefined || quantidade === '') return null;
    const n = Number(quantidade);
    return Number.isInteger(n) && n >= 1 && n <= QTD_MAX ? n : null;
}

// ---- monta a resposta do carrinho (preço sempre vindo do banco) ----
async function montarCarrinho() {
    const linhas = await CarrinhoItem.findAll({ include: Produto, order: [['id', 'ASC']] });

    let totalCentavos = 0;
    let totalItens = 0;
    const itens = linhas.map((linha) => {
        const preco = Number(linha.Produto.preco);
        const subtotalCentavos = Math.round(preco * 100) * linha.quantidade;
        totalCentavos += subtotalCentavos;
        totalItens += linha.quantidade;
        return {
            produtoId: linha.produtoId,
            nome: linha.Produto.nome,
            imagem: linha.Produto.imagem,
            preco,
            quantidade: linha.quantidade,
            subtotal: subtotalCentavos / 100
        };
    });

    return { itens, totalItens, total: totalCentavos / 100 };
}

module.exports = class CarrinhoController {
    static async get(req, res) {
        try {
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar o carrinho' });
        }
    }

    static async add(req, res) {
        const { produtoId: idRecebido, quantidade: qtdRecebida } = req.body ?? {};

        const produtoId = validarId(idRecebido);
        if (!produtoId) {
            return res.status(422).json({ message: 'produtoId inválido' });
        }
        const quantidade = qtdRecebida === undefined ? 1 : validarQuantidade(qtdRecebida);
        if (!quantidade) {
            return res.status(422).json({ message: `A quantidade deve ser um número inteiro entre 1 e ${QTD_MAX}` });
        }

        try {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const item = await CarrinhoItem.findOne({ where: { produtoId } });
            if (item) {
                const novaQuantidade = item.quantidade + quantidade;
                if (novaQuantidade > QTD_MAX) {
                    return res.status(422).json({ message: `Quantidade máxima por produto: ${QTD_MAX}` });
                }
                await item.update({ quantidade: novaQuantidade });
            } else {
                await CarrinhoItem.create({ produtoId, quantidade });
            }

            res.status(200).json(await montarCarrinho());
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao adicionar ao carrinho' });
        }
    }

    static async update(req, res) {
        const produtoId = validarId(req.params.produtoId);
        if (!produtoId) {
            return res.status(422).json({ message: 'produtoId inválido' });
        }
        const quantidade = validarQuantidade((req.body ?? {}).quantidade);
        if (!quantidade) {
            return res.status(422).json({ message: `A quantidade deve ser um número inteiro entre 1 e ${QTD_MAX}` });
        }

        try {
            const item = await CarrinhoItem.findOne({ where: { produtoId } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho' });
            }
            await item.update({ quantidade });
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao atualizar o carrinho' });
        }
    }

    static async remove(req, res) {
        const produtoId = validarId(req.params.produtoId);
        if (!produtoId) {
            return res.status(422).json({ message: 'produtoId inválido' });
        }

        try {
            const item = await CarrinhoItem.findOne({ where: { produtoId } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho' });
            }
            await item.destroy();
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao remover do carrinho' });
        }
    }

    static async clear(req, res) {
        try {
            await CarrinhoItem.destroy({ where: {} });
            res.status(200).json(await montarCarrinho());
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao esvaziar o carrinho' });
        }
    }
};