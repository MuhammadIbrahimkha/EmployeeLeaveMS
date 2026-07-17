import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { leaveTypeApi } from '../../api/leaveTypeApi'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import {
  Users,
  Building2,
  FolderOpen,
  ClipboardList,
  PieChart,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    employees:            0,
    departments:          0,
    leaveTypes:           0,
    allLeaves:            0,
    managerPendingLeaves: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [empRes, deptRes, ltRes, leavesRes] = await Promise.all([
          adminApi.getEmployees({ pageNumber: 1, pageSize: 1 }),
          adminApi.getDepartments(),
          leaveTypeApi.getAll(),
          adminApi.getAllLeaves({ pageNumber: 1, pageSize: 1 }),
        ])

        // Fetch ALL pending leaves (up to 100) so we can filter by role
        const pendingRes = await adminApi.getAllLeaves({
          pageNumber: 1,
          pageSize: 100,
          status: 0,
        })

        const pendingItems = pendingRes.data.data?.items || []

        // Only count pending leaves where the employee is a Manager or Admin
        // These are the ones Admin needs to review since they have no direct manager
        const managerPendingCount = pendingItems.filter(
          l => l.employeeRole === 'Manager' || l.employeeRole === 'Admin'
        ).length

        setStats({
          employees:            empRes.data.data?.totalCount   || 0,
          departments:          deptRes.data.data?.length       || 0,
          leaveTypes:           ltRes.data.data?.length         || 0,
          allLeaves:            leavesRes.data.data?.totalCount || 0,
          managerPendingLeaves: managerPendingCount,
        })
      } catch {
        //
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    { label: 'Total Employees',    value: stats.employees,   icon: Users,         iconColor: 'text-blue-600',   bgColor: 'bg-blue-50',   path: '/admin/employees'   },
    { label: 'Departments',        value: stats.departments, icon: Building2,     iconColor: 'text-purple-600', bgColor: 'bg-purple-50', path: '/admin/departments' },
    { label: 'Leave Types',        value: stats.leaveTypes,  icon: FolderOpen,    iconColor: 'text-green-600',  bgColor: 'bg-green-50',  path: '/admin/leave-types' },
    { label: 'All Leave Requests', value: stats.allLeaves,   icon: ClipboardList, iconColor: 'text-orange-600', bgColor: 'bg-orange-50', path: '/admin/leaves'      },
  ]

  const quickActions = [
    { label: 'Assign Leave Balance', path: '/admin/assign-balance', icon: PieChart   },
    { label: 'Create Department',    path: '/admin/departments',    icon: Building2  },
    { label: 'Manage Leave Types',   path: '/admin/leave-types',    icon: FolderOpen },
    { label: 'View All Employees',   path: '/admin/employees',      icon: Users      },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.fullName?.split(' ')[0]}`}
      />

      {/* Banner — only shows when managers have pending leaves needing Admin review */}
      {!isLoading && stats.managerPendingLeaves > 0 && (
        <Link to="/admin/leaves">
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-50
            border border-yellow-300 rounded-xl text-yellow-800 hover:bg-yellow-100 transition">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {stats.managerPendingLeaves} manager leave request{stats.managerPendingLeaves > 1 ? 's' : ''} need your review
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">
                These managers have no direct supervisor — only you can approve or reject their requests.
              </p>
            </div>
            <ChevronRight size={16} className="text-yellow-600 flex-shrink-0" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              to={card.path}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4
                hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bgColor}`}>
                <Icon size={22} className={card.iconColor} />
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <div className="h-7 w-10 bg-gray-200 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                )}
                <p className="text-sm text-gray-500 truncate">{card.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200
                    hover:bg-blue-50 hover:border-blue-300 transition text-sm text-gray-700"
                >
                  <Icon size={16} className="text-gray-500 flex-shrink-0" />
                  {action.label}
                  <ChevronRight size={16} className="ml-auto text-gray-400" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">System Info</h3>
          <div className="flex flex-col gap-3 text-sm">
            {[
              { label: 'API Status',              value: '✅ Online',                                    highlight: false },
              { label: 'Current Year',            value: new Date().getFullYear(),                       highlight: false },
              { label: 'Manager Pending Reviews', value: `${stats.managerPendingLeaves} requests`,       highlight: stats.managerPendingLeaves > 0 },
              { label: 'Logged in as',            value: user?.fullName,                                 highlight: false },
              { label: 'Role',                    value: 'HR Admin',                                     highlight: false },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className={`font-medium text-right ml-4 truncate
                  ${item.highlight ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}