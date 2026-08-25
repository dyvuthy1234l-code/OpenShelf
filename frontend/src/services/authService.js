import api from '../api/axios';

const authService = {
  /**
   * POST /api/login
   * Body: { email, password }
   * Returns: { message, token, data, user }
   */
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    // Save token to localStorage for subsequent requests
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * POST /api/register
   * Body: { name, email, password, password_confirmation }
   * Returns: { message, token, data, user }
   */
  register: async (data) => {
    const response = await api.post('/register', data);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * POST /api/logout
   * Requires auth token
   * Returns: { message }
   */
  logout: async () => {
    const response = await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  /**
   * GET /api/me
   * Requires auth token
   * Returns: { data, user, subscription }
   */
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

export default authService;
