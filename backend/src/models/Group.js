const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Modelo de grupo — agrupa recetas de un usuario
const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Group;
