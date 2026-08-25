import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // 30s: serverless backends (Laravel Cloud) may cold-start slowly on the first request
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 globally + friendly timeout/network messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      error.friendlyMessage =
        'The server is taking too long to respond (it may be waking up). Please try again in a moment.';
    }
    return Promise.reject(error);
  }
);

export default api;
