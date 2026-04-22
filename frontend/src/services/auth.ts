import api from './api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (email: string, password: string, name: string, role: string) => {
  const res = await api.post('/auth/register', { email, password, name, role });
  return res.data;
};
