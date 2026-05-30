import api from '../api/axios';

export const getIngredients = async () => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const getAdminIngredients = async (search = '') => {
  const response = await api.get('/admin/ingredients', {
    params: { search },
  });

  return response.data;
};

export const createIngredient = async (data) => {
  const response = await api.post('/ingredients', data);
  return response.data;
};

export const updateIngredient = async (id, data) => {
  const response = await api.put(`/ingredients/${id}`, data);
  return response.data;
};

export const updateIngredientStatus = async (id, isActive) => {
  const response = await api.patch(`/ingredients/${id}/status`, {
    is_active: isActive,
  });

  return response.data;
};