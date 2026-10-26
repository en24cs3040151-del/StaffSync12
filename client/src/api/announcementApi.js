import axiosClient from './axiosClient.js';

export const announcementApi = {
  getAnnouncements: async (params = {}) => {
    const res = await axiosClient.get('/announcements', { params });
    return res.data;
  },
  createAnnouncement: async (data) => {
    const res = await axiosClient.post('/announcements', data);
    return res.data;
  },
  updateAnnouncement: async (id, data) => {
    const res = await axiosClient.put(`/announcements/${id}`, data);
    return res.data;
  },
  deleteAnnouncement: async (id) => {
    const res = await axiosClient.delete(`/announcements/${id}`);
    return res.data;
  }
};
