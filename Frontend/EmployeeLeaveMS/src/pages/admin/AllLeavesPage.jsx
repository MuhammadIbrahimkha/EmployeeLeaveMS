import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../api/adminApi'
import { leaveApi } from '../../api/leaveApi'
import PageHeader from '../../components/PageHeader'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { ClipboardList } from 'lucide-react'

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending',      value: '0' },
  { label: 'Approved',     value: '1' },
  { label: 'Rejected',     value: '2' },
]

function AdminReviewModal({ leave, onClose, onDone }) {
  const [action, setAction] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (action === 'reject' && comment.trim().length < 5) {
      setError('Please provide a comment when rejecting.')
      return
    }
    setIsLoading(true)
    try {
      if (action === 'approve') {
        await leaveApi.approve(leave.id, { reviewComment: comment || null })
      } else {
        await leaveApi.reject(leave.id, { reviewComment: comment })
      }
      onDone()
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Action failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Review Leave Request</h3>
        <p className="text-sm text-gray-500 mb-4">
          {leave.employeeName} — {leave.leaveTypeName} ({leave.totalDays} days)
        </p>

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4">
          <p><span className="font-medium">Period:</span> {leave.startDate} → {leave.endDate}</p>
          <p className="mt-1"><span className="font-medium">Reason:</span> {leave.reason}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setAction('approve')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition
              ${action === 'approve'
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            ✅ Approve
          </button>
          <button
            onClick={() => setAction('reject')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition
              ${action === 'reject'
                ? 'bg-red-600 text-white border-red-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            ❌ Reject
          </button>
        </div>

        {action && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Comment {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder={action === 'reject' ? 'Required — explain why...' : 'Optional message...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        <Alert message={error} type="error" />

        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="w-auto px-5">Cancel</Button>
          {action && (
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              variant={action === 'approve' ? 'success' : 'danger'}
            >
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AllLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 })
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async (pageNumber = 1) => {
    setIsLoading(true)
    try {
      const params = {
        pageNumber,
        pageSize: 10,
        ...(filters.status !== ''   && { status:    filters.status    }),
        ...(filters.startDate       && { startDate: filters.startDate }),
        ...(filters.endDate         && { endDate:   filters.endDate   }),
      }
      const res = await adminApi.getAllLeaves(params)
      const data = res.data.data
      setLeaves(data.items || [])
      setPagination({
        pageNumber: data.pageNumber,
        pageSize:   data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
      })
    } catch {
      //
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleDone = () => {
    setSelectedLeave(null)
    setToast('Leave request reviewed successfully!')
    setTimeout(() => setToast(''), 3000)
    load(pagination.pageNumber)
  }

  return (
    <div>
      <PageHeader
        title="All Leave Requests"
        subtitle={`${pagination.totalCount} total requests`}
      />

      {toast && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase">From</label>
            <input type="date" name="startDate" value={filters.startDate}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase">To</label>
            <input type="date" name="endDate" value={filters.endDate}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => load(1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Apply
            </button>
            <button
              onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
              Clear
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
     ) : leaves.length === 0 ? (
  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
    <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
    No leave requests found.
  </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Reviewed By', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{l.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{l.leaveTypeName}</td>
                      <td className="px-4 py-3 text-gray-600">{l.startDate}</td>
                      <td className="px-4 py-3 text-gray-600">{l.endDate}</td>
                      <td className="px-4 py-3 text-gray-600">{l.totalDays}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                          ${STATUS_COLORS[l.status] || 'bg-gray-100'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {l.reviewedByName || '—'}
                        {l.reviewComment && (
                          <p className="text-gray-400 italic mt-0.5" title={l.reviewComment}>
                            "{l.reviewComment.length > 40
                              ? l.reviewComment.slice(0, 40) + '...'
                              : l.reviewComment}"
                          </p>
                        )}
                      </td>
                 
                    <td className="px-4 py-3">
                      {l.status === 'Pending' && (l.employeeRole === 'Manager' || l.employeeRole === 'Admin') && (
                        <button
                          onClick={() => setSelectedLeave(l)}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white
                            rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          Review
                        </button>
                      )}
                      {l.status === 'Pending' && l.employeeRole === 'Employee' && (
                        <span className="text-xs text-gray-400 italic">Manager reviews</span>
                      )}
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center
              justify-between mt-4 gap-3 text-sm text-gray-600">
              <p>
                Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1}–
                {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}
              </p>
              <div className="flex gap-2">
                <button onClick={() => load(pagination.pageNumber - 1)}
                  disabled={pagination.pageNumber === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  ← Prev
                </button>
                <span className="px-3 py-1">Page {pagination.pageNumber} of {pagination.totalPages}</span>
                <button onClick={() => load(pagination.pageNumber + 1)}
                  disabled={pagination.pageNumber === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedLeave && (
        <AdminReviewModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onDone={handleDone}
        />
      )}
    </div>
  )
}