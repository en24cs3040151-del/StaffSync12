import axiosClient from './axiosClient.js';

export const employeeApi = {
  getEmployees: async (params = {}) => {
    const res = await axiosClient.get('/employees', { params });
    return res.data;
  },
  getEmployeeById: async (id) => {
    const res = await axiosClient.get(`/employees/${id}`);
    return res.data;
  },
  createEmployee: async (data) => {
    const res = await axiosClient.post('/employees', data);
    return res.data;
  },
  updateEmployee: async (id, data) => {
    const res = await axiosClient.put(`/employees/${id}`, data);
    return res.data;
  },
  deactivateEmployee: async (id) => {
    const res = await axiosClient.patch(`/employees/${id}/deactivate`);
    return res.data;
  },
  assignManager: async (id, managerId) => {
    const res = await axiosClient.patch(`/employees/${id}/assign-manager`, { managerId });
    return res.data;
  }
};
