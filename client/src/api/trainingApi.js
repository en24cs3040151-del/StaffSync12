import axiosClient from './axiosClient.js';

export const trainingApi = {
  getTrainings: async (params = {}) => {
    const res = await axiosClient.get('/trainings', { params });
    return res.data;
  },
  getTrainingById: async (id) => {
    const res = await axiosClient.get(`/trainings/${id}`);
    return res.data;
  },
  createTraining: async (data) => {
    const res = await axiosClient.post('/trainings', data);
    return res.data;
  },
  updateTraining: async (id, data) => {
    const res = await axiosClient.put(`/trainings/${id}`, data);
    return res.data;
  },
  deleteTraining: async (id) => {
    const res = await axiosClient.delete(`/trainings/${id}`);
    return res.data;
  },
  enroll: async (id) => {
    const res = await axiosClient.post(`/trainings/${id}/enroll`);
    return res.data;
  },
  cancelEnrollment: async (id) => {
    const res = await axiosClient.post(`/trainings/${id}/cancel`);
    return res.data;
  }
};
