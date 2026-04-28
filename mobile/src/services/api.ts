import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/useAuthStore';

// Get the host IP dynamically from Expo Constants
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/';
  }
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift();
  // Using confirmed machine IP 10.135.143.5 as primary fallback
  return localhost ? `http://${localhost}:8000/api/` : 'http://10.135.143.5:8000/api/';
};

const BASE_URL = getBaseUrl();
console.log('DEBUG: API Base URL initialized as:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30s for slow model/DB responses
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
