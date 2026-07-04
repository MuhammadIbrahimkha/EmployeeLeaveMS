import api from './axiosInstance'

export const leaveApi = {
  // Employee
  apply: (data) => api.post('/leaves/apply', data),
  getMyLeaves: (params) => api.get('/leaves/my-leaves', { params }),
  getMyBalance: () => api.get('/leaves/my-balance'),
  cancel: (id) => api.delete(`/leaves/${id}/cancel`),

  // Manager
  getTeamRequests: (params) => api.get('/leaves/team-requests', { params }),
  approve: (id, data) => api.put(`/leaves/${id}/approve`, data),
  reject: (id, data) => api.put(`/leaves/${id}/reject`, data),
}