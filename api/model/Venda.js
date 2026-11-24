const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

const Venda = db.define('Venda', {
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    }
});

module.exports = Venda;