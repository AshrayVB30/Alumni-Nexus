import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Default to Android emulator address, can be overridden by env var
// For physical device, replace with your computer's local IP (e.g., 192.168.1.XX)
// For Tunnel mode: Replace this with your localtunnel URL (e.g. https://xyz.loca.lt/api/)
const BASE_URL = 'http://YOUR_LOCAL_IP:8000/api/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      // Navigation handling will be done in the RootNavigator based on store state
    }
    return Promise.reject(error);
  }
);

export default api;
