import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage'
import ApplyLeavePage from './pages/employee/ApplyLeavePage'
import MyLeavesPage from './pages/employee/MyLeavesPage'
import MyBalancePage from './pages/employee/MyBalancePage'
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage'
import TeamRequestsPage from './pages/manager/TeamRequestsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import EmployeesPage from './pages/admin/EmployeesPage'
import LeaveTypesPage from './pages/admin/LeaveTypesPage'
import AssignBalancePage from './pages/admin/AssignBalancePage'
import DepartmentsPage from './pages/admin/DepartmentsPage'
import AllLeavesPage from './pages/admin/AllLeavesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Employee */}
        <Route path="/employee/*" element={
          <ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboardPage />} />
                <Route path="apply"     element={<ApplyLeavePage />} />
                <Route path="leaves"    element={<MyLeavesPage />} />
                <Route path="balance"   element={<MyBalancePage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Manager */}
        <Route path="/manager/*" element={
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboardPage />} />
                <Route path="requests"  element={<TeamRequestsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard"    element={<AdminDashboardPage />} />
                <Route path="employees"    element={<EmployeesPage />} />
                <Route path="leave-types"  element={<LeaveTypesPage />} />
                <Route path="leaves"       element={<AllLeavesPage />} />
                <Route path="departments"  element={<DepartmentsPage />} />
                <Route path="assign-balance" element={<AssignBalancePage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App