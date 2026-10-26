import axiosClient from './axiosClient.js';

export const notificationApi = {
  getMyNotifications: async (params = {}) => {
    const res = await axiosClient.get('/notifications', { params });
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await axiosClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await axiosClient.patch('/notifications/read-all');
    return res.data;
  }
};
