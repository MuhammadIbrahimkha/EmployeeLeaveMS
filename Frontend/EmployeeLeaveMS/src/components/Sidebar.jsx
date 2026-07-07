import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'
import { tokenManager } from '../utils/tokenManager'

const navItems = {
  Employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: '🏠' },
    { label: 'Apply Leave', path: '/employee/apply', icon: '📝' },
    { label: 'My Leaves', path: '/employee/leaves', icon: '📋' },
    { label: 'My Balance', path: '/employee/balance', icon: '📊' },
  ],
  Manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: '🏠' },
    { label: 'Team Requests', path: '/manager/requests', icon: '👥' },
    { label: 'Apply Leave', path: '/employee/apply', icon: '📝' },
    { label: 'My Leaves', path: '/employee/leaves', icon: '📋' },
    { label: 'My Balance', path: '/employee/balance', icon: '📊' },
  ],
  Admin: [
  { label: 'Dashboard',       path: '/admin/dashboard',      icon: '🏠' },
  { label: 'Employees',       path: '/admin/employees',      icon: '👤' },
  { label: 'Leave Types',     path: '/admin/leave-types',    icon: '🗂️' },
  { label: 'All Leaves',      path: '/admin/leaves',         icon: '📋' },
  { label: 'Departments',     path: '/admin/departments',    icon: '🏢' },
  { label: 'Assign Balance',  path: '/admin/assign-balance', icon: '📊' },
],
}

export default function Sidebar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // proceed with logout even if API call fails
    } finally {
      logout()
      navigate('/login')
    }
  }

  const items = navItems[role] || []

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">ELMS</h1>
        <p className="text-xs text-gray-400 mt-0.5">Leave Management</p>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-700">
        <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium
          ${role === 'Admin' ? 'bg-purple-600' :
            role === 'Manager' ? 'bg-blue-600' : 'bg-green-600'}`}>
          {role}
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
              ${isActive
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}