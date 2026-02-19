import api from '../config/api';

export const getRecipes = async (mine = false, search = '') => {
  const params = {};
  if (mine) params.mine = true;
  if (search) params.search = search;
  const response = await api.get('/api/recipes', { params });
  return response.data;
};

export const getRecipeById = async (id) => {
  const response = await api.get(`/api/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post('/api/recipes', recipeData);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await api.put(`/api/recipes/${id}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/api/recipes/${id}`);
  return response.data;
};

export const addRecipeToGroups = async (recipeId, groupIds) => {
  const response = await api.post(`/api/recipes/${recipeId}/groups`, { groupIds });
  return response.data;
};

export const removeRecipeFromGroup = async (recipeId, groupId) => {
  const response = await api.delete(`/api/recipes/${recipeId}/groups/${groupId}`);
  return response.data;
};
