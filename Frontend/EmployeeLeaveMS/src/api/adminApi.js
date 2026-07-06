import api from './axiosInstance'

export const adminApi = {
  // Employees
  getEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),

  // Leave Balances
  assignBalance: (data) => api.post('/admin/leave-balances', data),
  updateBalance: (id, data) => api.put(`/admin/leave-balances/${id}`, data),
  getEmployeeBalances: (employeeId, year) =>
    api.get(`/admin/employees/${employeeId}/balances`, { params: { year } }),

  // Departments
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  assignManager: (deptId, managerId) =>
    api.put(`/admin/departments/${deptId}/assign-manager/${managerId}`),
}