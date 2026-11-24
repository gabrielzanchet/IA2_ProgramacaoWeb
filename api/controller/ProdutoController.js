const fs = require('fs');
const path = require('path');
const Produto = require('../model/Produto.js');

const pastaUploads = path.join(__dirname, '..', 'uploads');

// ---- validações ----
function validarId(id) {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function validarNome(nome) {
    return typeof nome === 'string' && nome.trim().length > 0 && nome.trim().length <= 255;
}

function validarPreco(preco) {
    if (preco === null || preco === undefined || preco === '') return false;
    const n = Number(preco);
    return Number.isFinite(n) && n >= 0 && n < 100000000; // DECIMAL(10,2)
}

// ---- auxiliares de arquivo ----
function apagarArquivo(nomeArquivo) {
    if (!nomeArquivo) return;
    fs.unlink(path.join(pastaUploads, nomeArquivo), () => {});
}

function descartarUpload(req) {
    if (req.file) apagarArquivo(req.file.filename);
}

module.exports = class ProdutoController {
    static async create(req, res) {
        const { nome, preco } = req.body ?? {};

        if (!validarNome(nome)) {
            descartarUpload(req);
            return res.status(422).json({ message: 'O nome é obrigatório' });
        }
        if (!validarPreco(preco)) {
            descartarUpload(req);
            return res.status(422).json({ message: 'O preço é obrigatório e deve ser um número maior ou igual a zero' });
        }

        try {
            const produto = await Produto.create({
                nome: nome.trim(),
                preco: Number(preco),
                imagem: req.file ? req.file.filename : null
            });
            res.status(201).json({ message: 'Produto criado com sucesso', produto });
        } catch (err) {
            descartarUpload(req);
            console.error(err);
            res.status(500).json({ message: 'Erro ao criar o produto' });
        }
    }

    static async getAll(req, res) {
        try {
            const produtos = await Produto.findAll();
            res.status(200).json(produtos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar os produtos' });
        }
    }

    static async getById(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            res.status(200).json(produto);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar o produto' });
        }
    }

    static async update(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            descartarUpload(req);
            return res.status(422).json({ message: 'ID inválido' });
        }

        const { nome, preco } = req.body ?? {};
        const dados = {};

        if (nome !== undefined) {
            if (!validarNome(nome)) {
                descartarUpload(req);
                return res.status(422).json({ message: 'O nome não pode ser vazio' });
            }
            dados.nome = nome.trim();
        }
        if (preco !== undefined) {
            if (!validarPreco(preco)) {
                descartarUpload(req);
                return res.status(422).json({ message: 'O preço deve ser um número maior ou igual a zero' });
            }
            dados.preco = Number(preco);
        }
        if (req.file) {
            dados.imagem = req.file.filename;
        }
        if (Object.keys(dados).length === 0) {
            return res.status(422).json({ message: 'Informe nome, preco e/ou imagem para atualizar' });
        }

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                descartarUpload(req);
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            const imagemAntiga = produto.imagem;
            await produto.update(dados);
            if (req.file) apagarArquivo(imagemAntiga);
            res.status(200).json({ message: 'Produto atualizado com sucesso', produto });
        } catch (err) {
            descartarUpload(req);
            console.error(err);
            res.status(500).json({ message: 'Erro ao atualizar o produto' });
        }
    }

    static async delete(req, res) {
        const id = validarId(req.params.id);
        if (!id) {
            return res.status(422).json({ message: 'ID inválido' });
        }

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            const imagem = produto.imagem;
            await produto.destroy();
            apagarArquivo(imagem);
            res.status(200).json({ message: 'Produto deletado com sucesso' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao deletar o produto' });
        }
    }
};