import api from '../api/axios';
import { memberService } from './memberService';

export const adminService = {
  getDashboard: async (params = {}) => {
    const res = await api.get('/admin/dashboard', { params });
    return res.data;
  },

  getLibraries: async (params = {}) => {
    const res = await api.get('/admin/libraries', { params });
    return res.data;
  },

  getLibrary: async (id) => {
    const res = await api.get(`/admin/libraries/${id}`);
    return res.data;
  },

  createLibrary: async (data) => {
    const res = await api.post('/admin/libraries', data);
    return res.data;
  },

  updateLibrary: async (id, data) => {
    const res = await api.put(`/admin/libraries/${id}`, data);
    return res.data;
  },

  updateLibraryStatus: async (id, status, rejection_reason = null) => {
    const res = await api.patch(`/admin/libraries/${id}/status`, { status, rejection_reason });
    return res.data;
  },

  getLibrarians: async (params = {}) => {
    const res = await api.get('/admin/librarians', { params });
    return res.data;
  },

  getLibrarian: async (id) => {
    const res = await api.get(`/admin/librarians/${id}`);
    return res.data;
  },

  createLibrarian: async (data) => {
    const res = await api.post('/admin/librarians', data);
    return res.data;
  },

  updateLibrarian: async (id, data) => {
    const res = await api.put(`/admin/librarians/${id}`, data);
    return res.data;
  },

  getMembers: async (params = {}) => {
    const res = await api.get('/admin/members', { params });
    return res.data;
  },

  getMember: async (id) => {
    const res = await api.get(`/admin/members/${id}`);
    return res.data;
  },

  updateUserStatus: async (id, status) => {
    const res = await api.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  getSubscriptions: async (params = {}) => {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data;
  },

  getSubscription: async (id) => {
    const res = await api.get(`/admin/subscriptions/${id}`);
    return res.data;
  },

  createSubscription: async (data) => {
    const res = await api.post('/admin/subscriptions', data);
    return res.data;
  },

  updateSubscription: async (id, data) => {
    const res = await api.put(`/admin/subscriptions/${id}`, data);
    return res.data;
  },

  cancelSubscription: async (id) => {
    const res = await api.post(`/admin/subscriptions/${id}/cancel`);
    return res.data;
  },

  deleteSubscription: async (id) => {
    const res = await api.delete(`/admin/subscriptions/${id}`);
    return res.data;
  },

  deletePlan: async (id) => {
    const res = await api.delete(`/admin/plans/${id}`);
    return res.data;
  },

  getPayments: async (params = {}) => {
    const res = await api.get('/admin/payments', { params });
    return res.data;
  },

  getPayment: async (id) => {
    const res = await api.get(`/admin/payments/${id}`);
    return res.data;
  },

  getNotifications: async (params = {}) => {
    const res = await api.get('/admin/notifications', { params });
    return res.data;
  },

  markNotificationAsRead: async (id) => {
    const res = await api.post(`/admin/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.post('/admin/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/admin/notifications/${id}`);
    return res.data;
  },

  clearAllNotifications: async () => {
    const res = await api.delete('/admin/notifications');
    return res.data;
  },

  // Reused generic profile methods
  getProfile: memberService.getProfile,
  updateProfile: memberService.updateProfile,
  updateProfileWithAvatar: memberService.updateProfileWithAvatar,
  removeAvatar: memberService.removeAvatar,
  changePassword: memberService.changePassword,

  getPlans: async () => {
    const res = await api.get('/admin/plans');
    return res.data;
  },

  createPlan: async (data) => {
    const res = await api.post('/admin/plans', data);
    return res.data;
  },

  updatePlan: async (id, data) => {
    const res = await api.put(`/admin/plans/${id}`, data);
    return res.data;
  },

  archivePlan: async (id) => {
    const res = await api.patch(`/admin/plans/${id}/archive`);
    return res.data;
  },

  getReport: async () => {
    const res = await api.get('/admin/report');
    return res.data;
  },
};

export default adminService;
