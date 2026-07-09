import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { leaveApi } from '../../api/leaveApi'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/PageHeader'
import { Clock, Users, CheckCircle2 } from 'lucide-react'

export default function ManagerDashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    leaveApi.getTeamRequests({ pageNumber: 1, pageSize: 5 })
      .then(res => setRequests(res.data.data?.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    { label: 'Pending Requests',    value: requests.length, icon: Clock,        iconColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Team Members',        value: '—',             icon: Users,        iconColor: 'text-blue-600',   bgColor: 'bg-blue-50'   },
    { label: 'Approved This Month', value: '—',             icon: CheckCircle2, iconColor: 'text-green-600',  bgColor: 'bg-green-50'  },
  ]

  return (
    <div>
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome back, ${user?.fullName?.split(' ')[0]}`}
        action={
          <Link
            to="/manager/requests"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            View All Requests
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bgColor}`}>
                <Icon size={22} className={card.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500 truncate">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Team Requests</h3>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
          No pending requests from your team.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.leaveTypeName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{r.endDate}</td>
                    <td className="px-4 py-3 text-gray-600">{r.totalDays}</td>
                    <td className="px-4 py-3">
                      <Link to="/manager/requests" className="text-xs text-blue-600 hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}