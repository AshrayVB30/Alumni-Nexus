import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Dynamically determine the backend URL based on environment
const getBaseURL = () => {
  // First, try to use environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback: construct from window location
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api`;
  }

  // Server-side fallback
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Try to get token from store state first
    const authState = localStorage.getItem('auth-storage');
    let token = null;

    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        token = parsed.state?.token;
      } catch (e) {
        console.error('Failed to parse auth state:', e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const authStore = useAuthStore.getState();
        authStore.logout();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
