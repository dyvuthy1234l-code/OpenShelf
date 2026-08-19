import api from '../api/axios';

export const librarianService = {
  getMyLibrary: async () => {
    const response = await api.get('/librarian/my-library');
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get('/librarian/reports', { params });
    return response.data;
  },

  getBooks: async (params = {}) => {
    const response = await api.get('/librarian/books', { params });
    return response.data;
  },

  getBorrowings: async (params = {}) => {
    const response = await api.get('/librarian/borrowings', { params });
    return response.data;
  },

  getBorrowing: async (id) => {
    const response = await api.get(`/librarian/borrowings/${id}`);
    return response.data;
  },

  approveBorrowing: async (id) => {
    const response = await api.post(`/librarian/borrowings/${id}/approve`);
    return response.data;
  },

  rejectBorrowing: async (id, rejection_reason) => {
    const response = await api.post(`/librarian/borrowings/${id}/reject`, { rejection_reason });
    return response.data;
  },

  pickupBorrowing: async (id) => {
    const response = await api.post(`/librarian/borrowings/${id}/pickup`);
    return response.data;
  },

  returnBook: async (id, data = {}) => {
    const response = await api.post(`/librarian/borrowings/${id}/return`, data);
    return response.data;
  },

  getMembers: async (params = {}) => {
    const response = await api.get('/librarian/members', { params });
    return response.data;
  },

  getMember: async (id) => {
    const response = await api.get(`/librarian/members/${id}`);
    return response.data;
  },

  createLibrary: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/librarian/library', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateLibrary: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/librarian/library/update', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  toggleLibraryStatus: async (status = null) => {
    const response = await api.post('/librarian/library/toggle-status', status ? { status } : {});
    return response.data;
  },
  getCategories: async (params = {}) => {
    const response = await api.get('/librarian/categories', { params });
    return response.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/librarian/categories/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/librarian/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.patch(`/librarian/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/librarian/categories/${id}`);
    return response.data;
  },

  getBook: async (id) => {
    const response = await api.get(`/librarian/books/${id}`);
    return response.data;
  },

  createBook: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/librarian/books', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateBook: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post(`/librarian/books/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await api.delete(`/librarian/books/${id}`);
    return response.data;
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    const response = await api.get('/notification-preferences');
    return response.data;
  },

  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/notification-preferences', { preferences });
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },
};

export default librarianService;
