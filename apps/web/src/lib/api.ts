import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/utils/toast';
import { API_BASE_URL } from '@/config/api';

/**
 * Optimized Axios instance for Grelinhealth API calls.
 * Automatically handles:
 * 1. Base URL configuration
 * 2. JWT Authentication headers
 * 3. Global error handling & toast notifications
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Global error notifications for non-2xx responses
    if (error.response?.status === 401) {
      showToast.error('Session Expired', 'Please log in again.');
      useAuthStore.getState().logout();
    } else if (error.response?.status !== 404) {
      // Don't show toast for 404s (usually handled by the component)
      showToast.error('API Error', message);
    }

    return Promise.reject(error);
  }
);

export default api;
