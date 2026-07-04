import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Placeholder routes - we'll build these in Day 4 */}
        <Route path="/employee/dashboard" element={<div className="p-10 text-2xl">Employee Dashboard - Coming Day 5</div>} />
        <Route path="/manager/dashboard" element={<div className="p-10 text-2xl">Manager Dashboard - Coming Day 7</div>} />
        <Route path="/admin/dashboard" element={<div className="p-10 text-2xl">Admin Dashboard - Coming Day 8</div>} />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App