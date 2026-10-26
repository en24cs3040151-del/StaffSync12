import axiosClient from './axiosClient.js';

export const leaveApi = {
  applyLeave: async (data) => {
    const res = await axiosClient.post('/leaves/apply', data);
    return res.data;
  },
  getMyLeaves: async (params = {}) => {
    const res = await axiosClient.get('/leaves/my', { params });
    return res.data;
  },
  getTeamLeaves: async (params = {}) => {
    const res = await axiosClient.get('/leaves/team', { params });
    return res.data;
  },
  getAllLeaves: async (params = {}) => {
    const res = await axiosClient.get('/leaves/all', { params });
    return res.data;
  },
  reviewLeave: async (id, status, reviewReason) => {
    const res = await axiosClient.patch(`/leaves/${id}/review`, { status, reviewReason });
    return res.data;
  },
  cancelLeave: async (id) => {
    const res = await axiosClient.patch(`/leaves/${id}/cancel`);
    return res.data;
  }
};
