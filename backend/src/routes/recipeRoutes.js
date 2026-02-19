const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuth');

// Rutas públicas (auth opcional para filtrar ?mine=true)
router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);

// Rutas protegidas
router.post('/', authMiddleware, recipeController.createRecipe);
router.put('/:id', authMiddleware, recipeController.updateRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);

// Gestión de grupos de una receta
router.post('/:id/groups', authMiddleware, recipeController.addRecipeToGroups);
router.delete('/:recipeId/groups/:groupId', authMiddleware, recipeController.removeRecipeFromGroup);

module.exports = router;
