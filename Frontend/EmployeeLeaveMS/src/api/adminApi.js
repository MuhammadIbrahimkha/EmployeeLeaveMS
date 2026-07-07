import api from './axiosInstance'

export const adminApi = {
  getEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  assignBalance: (data) => api.post('/admin/leave-balances', data),
  updateBalance: (id, data) => api.put(`/admin/leave-balances/${id}`, data),
  getEmployeeBalances: (employeeId, year) =>
    api.get(`/admin/employees/${employeeId}/balances`, { params: { year } }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  assignManager: (deptId, managerId) =>
    api.put(`/admin/departments/${deptId}/assign-manager/${managerId}`),
  getAllLeaves: (params) => api.get('/admin/leaves', { params }),
}