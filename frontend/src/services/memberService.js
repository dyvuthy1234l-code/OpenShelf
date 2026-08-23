import api from '../api/axios';

export const memberService = {
  // Profile
  getProfile: async () => {
    const res = await api.get('/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/profile', data);
    return res.data;
  },

  updateProfileWithAvatar: async (formData) => {
    // Let the browser/Axios add the multipart boundary automatically.
    const res = await api.post('/profile/update', formData);
    return res.data;
  },

  removeAvatar: async () => {
    const res = await api.post('/profile/remove-avatar');
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/change-password', data);
    return res.data;
  },

  // Borrowings
  getBorrowings: async (params = {}) => {
    const res = await api.get('/member/borrowings', { params });
    return res.data;
  },

  getBorrowingDetails: async (id) => {
    const res = await api.get(`/member/borrowings/${id}`);
    return res.data;
  },

  requestBorrowing: async (bookId) => {
    const res = await api.post('/member/borrowings', { book_id: bookId });
    return res.data;
  },

  payFine: async (id) => {
    const res = await api.post(`/member/borrowings/${id}/pay-fine`);
    return res.data;
  },

  extendBorrowing: async (id) => {
    const res = await api.post(`/member/borrowings/${id}/extend`);
    return res.data;
  },

  requestReturn: async (id) => {
    const res = await api.post(`/member/borrowings/${id}/request-return`);
    return res.data;
  },

  // Favorites
  getFavorites: async (params = {}) => {
    const res = await api.get('/member/favorites', { params });
    return res.data;
  },

  addFavorite: async (bookId) => {
    const res = await api.post('/member/favorites', { book_id: bookId });
    return res.data;
  },

  removeFavorite: async (bookId) => {
    const res = await api.delete(`/member/favorites/${bookId}`);
    return res.data;
  },

  // Waitlist
  joinWaitlist: async (bookId) => {
    const res = await api.post(`/member/books/${bookId}/waitlist`);
    return res.data;
  },

  leaveWaitlist: async (bookId) => {
    const res = await api.delete(`/member/books/${bookId}/waitlist`);
    return res.data;
  },

  getWaitlistPosition: async (bookId) => {
    const res = await api.get(`/member/books/${bookId}/waitlist`);
    return res.data;
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  markNotificationAsRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  clearAllNotifications: async () => {
    const res = await api.delete('/notifications');
    return res.data;
  },

  // Subscriptions & Payments
  subscribePlan: async (planId) => {
    const res = await api.post('/subscriptions', { plan_id: planId });
    return res.data;
  },

  // Reviews
  submitBookReview: async (bookId, data) => {
    const res = await api.post(`/books/${bookId}/reviews`, data);
    return res.data;
  },

  deleteBookReview: async (reviewId) => {
    const res = await api.delete('/member/reviews/' + reviewId);
    return res.data;
  },

  submitLibraryReview: async (libraryId, data) => {
    const res = await api.post(`/libraries/${libraryId}/reviews`, data);
    return res.data;
  },

  deleteLibraryReview: async (libraryId, reviewId) => {
    const res = await api.delete(`/member/libraries/${libraryId}/reviews/${reviewId}`);
    return res.data;
  },
};

export default memberService;
