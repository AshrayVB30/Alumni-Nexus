import api from './api';
import { User } from '../store/useAuthStore';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: 'Student' | 'Alumni';
  name: string;
}

export const authService = {
  login: async (email: string, password: string, usn?: string): Promise<LoginResponse> => {
    const payload: any = { password };
    if (email) payload.email = email;
    if (usn) payload.usn = usn;
    
    const response = await api.post<LoginResponse>('auth/login', payload);
    return response.data;
  },

  register: async (data: any): Promise<{ message: string, user_id: string }> => {
    const response = await api.post('auth/register', data);
    return response.data;
  },
};
