const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Venda = require('./Venda.js');
const Produto = require('./Produto.js');

// guarda o nome e o preço do produto no momento da compra,
// assim a venda não muda se o produto for editado ou excluído depois
const ItemVenda = db.define('ItemVenda', {
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    }
});

Venda.hasMany(ItemVenda, { as: 'itens', foreignKey: { name: 'vendaId', allowNull: false }, onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: { name: 'vendaId', allowNull: false } });

Produto.hasMany(ItemVenda, { foreignKey: { name: 'produtoId', allowNull: true }, onDelete: 'SET NULL' });
ItemVenda.belongsTo(Produto, { foreignKey: { name: 'produtoId', allowNull: true } });

module.exports = ItemVenda;