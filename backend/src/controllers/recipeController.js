const { Op } = require('sequelize');
const { sequelize, Recipe, Ingredient, Step, Group, User } = require('../models');

// Includes reutilizables para queries de recetas
const fullIncludes = [
  { model: Ingredient, order: [['position', 'ASC']] },
  { model: Step, order: [['position', 'ASC']] },
  { model: Group, through: { attributes: [] } },
  { model: User, attributes: ['id', 'username'] },
];

// ── POST /api/recipes ──
const createRecipe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, imageUrl, prepTime, servings, ingredients, steps, groupIds } = req.body;

    // Validaciones
    if (!title) {
      await t.rollback();
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }
    if (!ingredients || ingredients.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debe incluir al menos un ingrediente.' });
    }
    if (!steps || steps.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debe incluir al menos un paso.' });
    }

    // Verificar título único
    const existing = await Recipe.findOne({ where: { title }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: 'Ya existe una receta con ese título.' });
    }

    // Crear receta
    const recipe = await Recipe.create(
      { title, description, imageUrl, prepTime, servings, userId: req.user.id },
      { transaction: t },
    );

    // Crear ingredientes con position basada en el índice del array
    await Ingredient.bulkCreate(
      ingredients.map((ing, i) => ({
        name: ing.name,
        quantity: ing.quantity,
        position: i,
        recipeId: recipe.id,
      })),
      { transaction: t },
    );

    // Crear pasos con position basada en el índice del array
    await Step.bulkCreate(
      steps.map((step, i) => ({
        description: step.description,
        position: i,
        recipeId: recipe.id,
      })),
      { transaction: t },
    );

    // Vincular a grupos si se enviaron
    if (groupIds && groupIds.length > 0) {
      const groups = await Group.findAll({
        where: { id: groupIds, userId: req.user.id },
        transaction: t,
      });
      await recipe.setGroups(groups, { transaction: t });
    }

    await t.commit();

    // Retornar receta completa
    const full = await Recipe.findByPk(recipe.id, {
      include: fullIncludes,
      order: [
        [Ingredient, 'position', 'ASC'],
        [Step, 'position', 'ASC'],
      ],
    });
    return res.status(201).json(full);
  } catch (error) {
    await t.rollback();
    console.error('Error en createRecipe:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recipes ──
const getRecipes = async (req, res) => {
  try {
    const { mine, search } = req.query;
    const where = {};

    // Filtrar por usuario si ?mine=true y hay token
    if (mine === 'true' && req.user) {
      where.userId = req.user.id;
    }

    // Filtrar por búsqueda en título
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const recipes = await Recipe.findAll({
      where,
      include: fullIncludes,
      order: [
        ['title', 'ASC'],
        [Ingredient, 'position', 'ASC'],
        [Step, 'position', 'ASC'],
      ],
    });

    return res.json(recipes);
  } catch (error) {
    console.error('Error en getRecipes:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recipes/:id ──
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: fullIncludes,
      order: [
        [Ingredient, 'position', 'ASC'],
        [Step, 'position', 'ASC'],
      ],
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('Error en getRecipeById:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PUT /api/recipes/:id ──
const updateRecipe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const recipe = await Recipe.findByPk(req.params.id, { transaction: t });
    if (!recipe) {
      await t.rollback();
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    // Solo el owner puede editar
    if (recipe.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes permiso para editar esta receta.' });
    }

    const { title, description, imageUrl, prepTime, servings, ingredients, steps, groupIds } = req.body;

    // Verificar título único si cambió
    if (title && title !== recipe.title) {
      const duplicate = await Recipe.findOne({
        where: { title, id: { [Op.ne]: recipe.id } },
        transaction: t,
      });
      if (duplicate) {
        await t.rollback();
        return res.status(409).json({ error: 'Ya existe otra receta con ese título.' });
      }
    }

    // Actualizar campos de la receta
    await recipe.update(
      { title, description, imageUrl, prepTime, servings },
      { transaction: t },
    );

    // Reemplazar ingredientes si se enviaron
    if (ingredients) {
      if (ingredients.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Debe incluir al menos un ingrediente.' });
      }
      await Ingredient.destroy({ where: { recipeId: recipe.id }, transaction: t });
      await Ingredient.bulkCreate(
        ingredients.map((ing, i) => ({
          name: ing.name,
          quantity: ing.quantity,
          position: i,
          recipeId: recipe.id,
        })),
        { transaction: t },
      );
    }

    // Reemplazar pasos si se enviaron
    if (steps) {
      if (steps.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Debe incluir al menos un paso.' });
      }
      await Step.destroy({ where: { recipeId: recipe.id }, transaction: t });
      await Step.bulkCreate(
        steps.map((step, i) => ({
          description: step.description,
          position: i,
          recipeId: recipe.id,
        })),
        { transaction: t },
      );
    }

    // Reemplazar grupos si se enviaron
    if (groupIds !== undefined) {
      const groups = await Group.findAll({
        where: { id: groupIds, userId: req.user.id },
        transaction: t,
      });
      await recipe.setGroups(groups, { transaction: t });
    }

    await t.commit();

    const full = await Recipe.findByPk(recipe.id, {
      include: fullIncludes,
      order: [
        [Ingredient, 'position', 'ASC'],
        [Step, 'position', 'ASC'],
      ],
    });
    return res.json(full);
  } catch (error) {
    await t.rollback();
    console.error('Error en updateRecipe:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /api/recipes/:id ──
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta receta.' });
    }

    // CASCADE borra ingredientes, pasos y filas de RecipeGroups
    await recipe.destroy();
    return res.json({ message: 'Receta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error en deleteRecipe:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── POST /api/recipes/:id/groups ──
const addRecipeToGroups = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta receta.' });
    }

    const { groupIds } = req.body;
    if (!groupIds || groupIds.length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un groupId.' });
    }

    // Validar que los grupos existen y pertenecen al usuario
    const groups = await Group.findAll({
      where: { id: groupIds, userId: req.user.id },
    });

    // addGroups evita duplicados automáticamente
    await recipe.addGroups(groups);

    return res.json({ message: `Receta agregada a ${groups.length} grupo(s).` });
  } catch (error) {
    console.error('Error en addRecipeToGroups:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /api/recipes/:recipeId/groups/:groupId ──
const removeRecipeFromGroup = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta receta.' });
    }

    const group = await Group.findByPk(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }

    await recipe.removeGroup(group);
    return res.json({ message: 'Receta removida del grupo.' });
  } catch (error) {
    console.error('Error en removeRecipeFromGroup:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addRecipeToGroups,
  removeRecipeFromGroup,
};
