import axiosClient from './axiosClient.js';

export const authApi = {
  login: async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const res = await axiosClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return res.data;
  }
};
