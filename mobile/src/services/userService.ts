import api from './api';

export const userService = {
  getUser: async (userId: string) => {
    console.log(`DEBUG: userService.getUser calling users/${userId}`);
    const response = await api.get(`users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await api.put(`users/${userId}/profile`, data);
    return response.data;
  }
};
