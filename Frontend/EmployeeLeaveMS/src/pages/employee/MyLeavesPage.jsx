import { useState, useEffect, useCallback } from 'react'
import { leaveApi } from '../../api/leaveApi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadLeaves = useCallback(async (pageNumber = 1) => {
    setIsLoading(true)
    try {
      const res = await leaveApi.getMyLeaves({ pageNumber, pageSize: 10 })
      const data = res.data.data
      setLeaves(data.items || [])
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
      })
    } catch {
      setError('Failed to load leave requests.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return
    setCancellingId(id)
    setError('')
    setSuccess('')
    try {
      await leaveApi.cancel(id)
      setSuccess('Leave request cancelled.')
      loadLeaves(pagination.pageNumber)
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Failed to cancel leave request.'
      )
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Leave Requests"
        subtitle={`${pagination.totalCount} total requests`}
        action={
          <Link to="/employee/apply">
            <Button className="w-auto px-6">+ Apply for Leave</Button>
          </Link>
        }
      />

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">No leave requests yet.</p>
          <Link to="/employee/apply" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            Apply for your first leave →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Reviewer', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{leave.leaveTypeName}</td>
                    <td className="px-4 py-3 text-gray-600">{leave.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{leave.endDate}</td>
                    <td className="px-4 py-3 text-gray-600">{leave.totalDays}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[leave.status] || 'bg-gray-100 text-gray-600'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {leave.reviewedByName || '—'}
                      {leave.reviewComment && (
                        <p className="text-gray-400 italic truncate max-w-xs">"{leave.reviewComment}"</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === 'Pending' && (
                        <button
                          onClick={() => handleCancel(leave.id)}
                          disabled={cancellingId === leave.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          {cancellingId === leave.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <p>
                Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1}–
                {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => loadLeaves(pagination.pageNumber - 1)}
                  disabled={pagination.pageNumber === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1">
                  Page {pagination.pageNumber} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => loadLeaves(pagination.pageNumber + 1)}
                  disabled={pagination.pageNumber === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}