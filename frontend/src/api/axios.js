import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
      if (!window.location.pathname.startsWith(`${basePath}/login`) && !window.location.pathname.startsWith(`${basePath}/register`)) {
        window.location.href = `${basePath}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
