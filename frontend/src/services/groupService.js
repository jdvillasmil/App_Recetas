import api from '../config/api';

export const getGroups = async () => {
  const response = await api.get('/api/groups');
  return response.data;
};

export const createGroup = async (name) => {
  const response = await api.post('/api/groups', { name });
  return response.data;
};

export const updateGroup = async (id, name) => {
  const response = await api.put(`/api/groups/${id}`, { name });
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/api/groups/${id}`);
  return response.data;
};
