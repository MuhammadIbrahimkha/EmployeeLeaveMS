import { useState, useEffect } from 'react'
import { leaveApi } from '../../api/leaveApi'
import PageHeader from '../../components/PageHeader'

export default function MyBalancePage() {
  const [balances, setBalances] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    leaveApi.getMyBalance()
      .then(res => setBalances(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const getBarColor = (used, total) => {
    const pct = total > 0 ? (used / total) * 100 : 0
    if (pct >= 80) return 'bg-red-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Leave Balance"
        subtitle={`Leave entitlements for ${new Date().getFullYear()}`}
      />

      {balances.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 text-sm">No leave balances assigned. Contact HR Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {balances.map(b => {
            const percentage = b.totalDays > 0
              ? Math.round((b.usedDays / b.totalDays) * 100)
              : 0

            return (
              <div key={b.leaveTypeId} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{b.leaveTypeName} Leave</h3>
                  <span className="text-xs text-gray-400">{b.year}</span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-5xl font-bold text-gray-800">{b.remainingDays}</p>
                  <p className="text-sm text-gray-400 mt-1">days remaining</p>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all ${getBarColor(b.usedDays, b.totalDays)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 text-center text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{b.totalDays}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-500">{b.usedDays}</p>
                    <p className="text-xs text-gray-400">Used</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">{b.remainingDays}</p>
                    <p className="text-xs text-gray-400">Remaining</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}