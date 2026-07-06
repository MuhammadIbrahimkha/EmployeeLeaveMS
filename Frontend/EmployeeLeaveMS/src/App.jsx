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

const ManagerDashboard = () => <div className="text-2xl font-bold text-gray-700">Manager Dashboard — Day 7</div>
const AdminDashboard   = () => <div className="text-2xl font-bold text-gray-700">Admin Dashboard — Day 8</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Employee routes */}
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

        {/* Manager routes */}
        <Route path="/manager/*" element={
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
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