import api from './axiosInstance'

export const leaveTypeApi = {
  getAll: () => api.get('/leave-types'),
  getById: (id) => api.get(`/leave-types/${id}`),
  create: (data) => api.post('/leave-types', data),
  update: (id, data) => api.put(`/leave-types/${id}`, data),
  deactivate: (id) => api.delete(`/leave-types/${id}`),
}