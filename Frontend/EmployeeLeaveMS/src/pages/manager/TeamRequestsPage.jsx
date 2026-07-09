import { useState, useEffect, useCallback } from 'react'
import { leaveApi } from '../../api/leaveApi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { PartyPopper } from 'lucide-react'

function ReviewModal({ request, onClose, onDone }) {
  const [action, setAction] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (action === 'reject' && comment.trim().length < 5) {
      setError('Please provide a comment (min 5 characters) when rejecting.')
      return
    }
    setIsLoading(true)
    try {
      if (action === 'approve') {
        await leaveApi.approve(request.id, { reviewComment: comment || null })
      } else {
        await leaveApi.reject(request.id, { reviewComment: comment })
      }
      onDone()
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Action failed.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Review Leave Request</h3>
        <p className="text-sm text-gray-500 mb-4">
          {request.employeeName} — {request.leaveTypeName} ({request.totalDays} days)
        </p>

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4">
          <p><span className="font-medium">Period:</span> {request.startDate} → {request.endDate}</p>
          <p className="mt-1"><span className="font-medium">Reason:</span> {request.reason}</p>
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
          <Button variant="secondary" onClick={onClose} className="w-auto px-5">
            Cancel
          </Button>
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

export default function TeamRequestsPage() {
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async (pageNumber = 1) => {
    setIsLoading(true)
    try {
      const res = await leaveApi.getTeamRequests({ pageNumber, pageSize: 10 })
      const data = res.data.data
      setRequests(data.items || [])
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
      })
    } catch {
      //
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDone = () => {
    setSelectedRequest(null)
    setToast('Request reviewed successfully!')
    setTimeout(() => setToast(''), 3000)
    load(pagination.pageNumber)
  }

  return (
    <div>
      <PageHeader
        title="Team Requests"
        subtitle={`${pagination.totalCount} pending requests from your team`}
      />

      {toast && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
          {toast}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
     ) : requests.length === 0 ? (
  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
    <PartyPopper size={48} className="mx-auto mb-3 text-green-400" />
    <p className="text-gray-500">No pending requests from your team.</p>
  </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.leaveTypeName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.startDate}</td>
                      <td className="px-4 py-3 text-gray-600">{r.endDate}</td>
                      <td className="px-4 py-3 text-gray-600">{r.totalDays}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{r.reason}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white
                            rounded-lg hover:bg-blue-700 transition"
                        >
                          Review
                        </button>
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
                <button
                  onClick={() => load(pagination.pageNumber - 1)}
                  disabled={pagination.pageNumber === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1">Page {pagination.pageNumber} of {pagination.totalPages}</span>
                <button
                  onClick={() => load(pagination.pageNumber + 1)}
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

      {selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDone={handleDone}
        />
      )}
    </div>
  )
}