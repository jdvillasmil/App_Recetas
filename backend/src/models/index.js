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

// Many-to-Many: una receta puede estar en múltiples grupos y viceversa.
// Al borrar un grupo se eliminan SOLO las filas de RecipeGroups (las recetas persisten).
// Al borrar una receta se eliminan sus filas de RecipeGroups.
Recipe.belongsToMany(Group, {
  through: 'RecipeGroups',
  foreignKey: 'recipeId',
  otherKey: 'groupId',
});
Group.belongsToMany(Recipe, {
  through: 'RecipeGroups',
  foreignKey: 'groupId',
  otherKey: 'recipeId',
});

// Una receta tiene muchos ingredientes y pasos — borrado en cascada
Recipe.hasMany(Ingredient, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Ingredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

Recipe.hasMany(Step, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Step.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = { sequelize, User, Group, Recipe, Ingredient, Step };
