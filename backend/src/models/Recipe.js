const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=Sin+Imagen';

// Modelo de receta — título único global estricto
const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: PLACEHOLDER_IMAGE,
  },
  prepTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Recipe;
