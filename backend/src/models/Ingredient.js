const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Modelo de ingrediente — 'position' controla el orden de visualización
const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Ingredient;
