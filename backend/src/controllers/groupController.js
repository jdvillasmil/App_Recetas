const { sequelize, Group, Recipe } = require('../models');

// ── POST /api/groups ──
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    }

    const group = await Group.create({ name: name.trim(), userId: req.user.id });
    return res.status(201).json(group);
  } catch (error) {
    console.error('Error en createGroup:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/groups ──
const getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      where: { userId: req.user.id },
      include: {
        model: Recipe,
        attributes: ['id'],
        through: { attributes: [] },
      },
      order: [['name', 'ASC']],
    });

    // Mapear para incluir recipeCount en lugar del array completo
    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      userId: g.userId,
      recipeCount: g.Recipes.length,
      createdAt: g.createdAt,
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error en getGroups:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PUT /api/groups/:id ──
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }

    if (group.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este grupo.' });
    }

    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    }

    group.name = name.trim();
    await group.save();

    return res.json(group);
  } catch (error) {
    console.error('Error en updateGroup:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /api/groups/:id ──
// BORRADO DESTRUCTIVO: elimina el grupo Y todas las recetas asociadas.
// Las recetas se borran físicamente (CASCADE elimina ingredientes, pasos y vínculos).
const deleteGroup = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const group = await Group.findByPk(req.params.id, {
      include: { model: Recipe, attributes: ['id'], through: { attributes: [] } },
      transaction: t,
    });

    if (!group) {
      await t.rollback();
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    }

    if (group.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes permiso para eliminar este grupo.' });
    }

    // Obtener IDs de recetas asociadas antes de borrar
    const recipeIds = group.Recipes.map((r) => r.id);
    const deletedRecipesCount = recipeIds.length;

    // Borrar físicamente las recetas (CASCADE borra ingredientes, pasos y filas de RecipeGroups)
    if (recipeIds.length > 0) {
      await Recipe.destroy({ where: { id: recipeIds }, transaction: t });
    }

    // Borrar el grupo
    await group.destroy({ transaction: t });

    await t.commit();

    return res.json({
      message: 'Group and associated recipes deleted successfully.',
      deletedRecipesCount,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en deleteGroup:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { createGroup, getGroups, updateGroup, deleteGroup };
