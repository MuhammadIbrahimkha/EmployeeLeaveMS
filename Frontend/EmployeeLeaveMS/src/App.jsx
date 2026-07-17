import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
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

// Redirects logged-in users away from auth pages
// Shows spinner while session is being verified
function GuestRoute({ children }) {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (role === 'Admin')   return <Navigate to="/admin/dashboard"    replace />
    if (role === 'Manager') return <Navigate to="/manager/dashboard"  replace />
    return                         <Navigate to="/employee/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute><RegisterPage /></GuestRoute>
        } />
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
                <Route path="dashboard"      element={<AdminDashboardPage />} />
                <Route path="employees"      element={<EmployeesPage />} />
                <Route path="leave-types"    element={<LeaveTypesPage />} />
                <Route path="leaves"         element={<AllLeavesPage />} />
                <Route path="departments"    element={<DepartmentsPage />} />
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