const sequelize = require('../config/db');
const User = require('./User');
const Group = require('./Group');
const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const Step = require('./Step');

// ── Asociaciones ──

// Un usuario tiene muchos grupos y recetas
User.hasMany(Group, { foreignKey: 'userId', onDelete: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Recipe, { foreignKey: 'userId', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'userId' });

// Un grupo tiene muchas recetas — borrado en cascada obligatorio
Group.hasMany(Recipe, { foreignKey: 'groupId', onDelete: 'CASCADE' });
Recipe.belongsTo(Group, { foreignKey: 'groupId' });

// Una receta tiene muchos ingredientes y pasos — borrado en cascada
Recipe.hasMany(Ingredient, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Ingredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

Recipe.hasMany(Step, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Step.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = { sequelize, User, Group, Recipe, Ingredient, Step };
