import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../api/adminApi'
import PageHeader from '../../components/PageHeader'

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending',  value: '0' },
  { label: 'Approved', value: '1' },
  { label: 'Rejected', value: '2' },
]

export default function AllLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 })
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' })
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async (pageNumber = 1) => {
    setIsLoading(true)
    try {
      const params = {
        pageNumber,
        pageSize: 10,
        ...(filters.status !== '' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }
      const res = await adminApi.getAllLeaves(params)
      const data = res.data.data
      setLeaves(data.items || [])
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
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => load(1)

  const handleClearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' })
  }

  return (
    <div>
      <PageHeader
        title="All Leave Requests"
        subtitle={`${pagination.totalCount} total requests`}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase">From</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase">To</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          No leave requests found.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Reviewed By'].map(h => (
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
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status] || 'bg-gray-100'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {l.reviewedByName || '—'}
                      {l.reviewComment && (
                        <p className="text-gray-400 italic truncate max-w-xs">"{l.reviewComment}"</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
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
    </div>
  )
}