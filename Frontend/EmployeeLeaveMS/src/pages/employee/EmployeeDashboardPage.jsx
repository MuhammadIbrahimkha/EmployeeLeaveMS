import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { leaveApi } from '../../api/leaveApi'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

function BalanceCard({ leaveTypeName, totalDays, usedDays, remainingDays }) {
  const percentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0

  const colors = {
    Annual:     { bg: 'bg-blue-50',   border: 'border-blue-200',   bar: 'bg-blue-500',   text: 'text-blue-700'   },
    Sick:       { bg: 'bg-red-50',    border: 'border-red-200',    bar: 'bg-red-500',    text: 'text-red-700'    },
    Casual:     { bg: 'bg-green-50',  border: 'border-green-200',  bar: 'bg-green-500',  text: 'text-green-700'  },
    Maternity:  { bg: 'bg-pink-50',   border: 'border-pink-200',   bar: 'bg-pink-500',   text: 'text-pink-700'   },
    Bereavement:{ bg: 'bg-gray-50',   border: 'border-gray-200',   bar: 'bg-gray-500',   text: 'text-gray-700'   },
  }

  const c = colors[leaveTypeName] || colors.Casual

  return (
    <div className={`rounded-xl border p-5 ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-sm ${c.text}`}>{leaveTypeName} Leave</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${c.text}`}>
          {remainingDays} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${c.bar}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Used: <strong>{usedDays}</strong></span>
        <span>Total: <strong>{totalDays}</strong></span>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth()
  const [balances, setBalances] = useState([])
  const [recentLeaves, setRecentLeaves] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balanceRes, leavesRes] = await Promise.all([
          leaveApi.getMyBalance(),
          leaveApi.getMyLeaves({ pageNumber: 1, pageSize: 5 }),
        ])
        setBalances(balanceRes.data.data || [])
        setRecentLeaves(leavesRes.data.data?.items || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const totalRemaining = balances.reduce((sum, b) => sum + b.remainingDays, 0)
  const pending  = recentLeaves.filter(l => l.status === 'Pending').length
  const approved = recentLeaves.filter(l => l.status === 'Approved').length

  const statusBadge = (status) => {
    const styles = {
      Pending:  'bg-yellow-100 text-yellow-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Here's your leave overview for 2026"
        action={
          <Link to="/employee/apply">
            <Button className="w-auto px-6">+ Apply for Leave</Button>
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Days Remaining" value={totalRemaining} icon="📅" color="bg-blue-50" />
        <StatCard label="Pending Requests"      value={pending}        icon="⏳" color="bg-yellow-50" />
        <StatCard label="Approved This Year"    value={approved}       icon="✅" color="bg-green-50" />
      </div>

      {/* Balance Cards */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Leave Balance</h3>
      {balances.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No leave balances assigned yet. Contact HR.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {balances.map((b) => (
            <BalanceCard key={b.leaveTypeId} {...b} />
          ))}
        </div>
      )}

      {/* Recent Leave Requests */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Requests</h3>
        <Link to="/employee/leaves" className="text-sm text-blue-600 hover:underline">
          View all →
        </Link>
      </div>

      {recentLeaves.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No leave requests yet.{' '}
          <Link to="/employee/apply" className="text-blue-600 hover:underline">
            Apply now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Leave Type', 'From', 'To', 'Days', 'Status', 'Applied'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{leave.leaveTypeName}</td>
                  <td className="px-4 py-3 text-gray-600">{leave.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{leave.endDate}</td>
                  <td className="px-4 py-3 text-gray-600">{leave.totalDays}</td>
                  <td className="px-4 py-3">{statusBadge(leave.status)}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(leave.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}