import api from './api';
import { useAuthStore } from '../store/useAuthStore';

export const chatService = {
  getConversations: async () => {
    const token = useAuthStore.getState().token;
    const response = await api.get(`chat/conversations?token=${token}`);
    return response.data;
  },

  getChatHistory: async (otherId: string) => {
    const token = useAuthStore.getState().token;
    const response = await api.get(`chat/history/${otherId}?token=${token}`);
    return response.data;
  },

  getWebSocketUrl: (token: string) => {
    // Replace 'http' with 'ws' and point to the WS endpoint
    const baseUrl = api.defaults.baseURL || 'ws://YOUR_LOCAL_IP:8000';
    const wsBase = baseUrl.replace('http', 'ws').replace('/api/', '');
    return `${wsBase}/api/chat/ws/${token}`;
  }
};
