import axiosClient from './axiosClient.js';

export const reportApi = {
  getHRDashboardMetrics: async () => {
    const res = await axiosClient.get('/reports/hr-dashboard');
    return res.data;
  },
  getManagerDashboardMetrics: async () => {
    const res = await axiosClient.get('/reports/manager-dashboard');
    return res.data;
  },
  getEmployeeDashboardMetrics: async () => {
    const res = await axiosClient.get('/reports/employee-dashboard');
    return res.data;
  }
};
