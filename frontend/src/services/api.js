import axios from 'axios';

// Create Axios client instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to append JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('vehicomp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
    });
  }
);

// Auth API methods
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getProfile = () => API.get('/auth/me');
export const checkHealth = () => API.get('/health');

export default API;
