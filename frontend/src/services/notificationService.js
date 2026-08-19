import api from '../api/axios';

const notificationService = {
  markNotificationAsRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

export default notificationService;
