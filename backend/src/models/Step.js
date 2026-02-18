const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Modelo de paso — 'position' controla el orden de visualización
const Step = sequelize.define('Step', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Step;
