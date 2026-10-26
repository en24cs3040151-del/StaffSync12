import axiosClient from './axiosClient.js';

export const attendanceApi = {
  checkIn: async () => {
    const res = await axiosClient.post('/attendance/check-in');
    return res.data;
  },
  checkOut: async () => {
    const res = await axiosClient.post('/attendance/check-out');
    return res.data;
  },
  getTodayStatus: async () => {
    const res = await axiosClient.get('/attendance/today');
    return res.data;
  },
  getMyHistory: async (params = {}) => {
    const res = await axiosClient.get('/attendance/my-history', { params });
    return res.data;
  },
  getTeamAttendance: async (params = {}) => {
    const res = await axiosClient.get('/attendance/team', { params });
    return res.data;
  },
  getOrgAttendance: async (params = {}) => {
    const res = await axiosClient.get('/attendance/org', { params });
    return res.data;
  },
  recordManual: async (data) => {
    const res = await axiosClient.post('/attendance/manual', data);
    return res.data;
  }
};
