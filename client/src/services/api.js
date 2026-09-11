import axios from 'axios';

// Create Axios client instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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

export default API;
