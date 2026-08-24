import api from '../api/axios';

const authService = {
  csrf: async () => {
    // Need to hit the base URL, not /api
    const url = api.defaults.baseURL.replace('/api', '');
    await api.get(`${url}/sanctum/csrf-cookie`);
  },

  /**
   * POST /api/login
   * Body: { email, password }
   * Returns: { message, token, data, user }
   */
  login: async (credentials) => {
    await authService.csrf();
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * POST /api/register
   * Body: { name, email, password, password_confirmation }
   * Returns: { message, token, data, user }
   */
  register: async (data) => {
    await authService.csrf();
    const response = await api.post('/register', data);
    return response.data;
  },

  /**
   * POST /api/logout
   * Requires auth token
   * Returns: { message }
   */
  logout: async () => {
    const response = await api.post('/logout');
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
