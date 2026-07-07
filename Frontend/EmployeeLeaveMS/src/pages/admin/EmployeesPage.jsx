import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../api/adminApi'
import PageHeader from '../../components/PageHeader'

const ROLE_COLORS = {
  Admin:    'bg-purple-100 text-purple-700',
  Manager:  'bg-blue-100 text-blue-700',
  Employee: 'bg-green-100 text-green-700',
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [balances, setBalances] = useState([])
  const [loadingBalances, setLoadingBalances] = useState(false)

  const load = useCallback(async (pageNumber = 1, searchTerm = search) => {
    setIsLoading(true)
    try {
      const res = await adminApi.getEmployees({
        pageNumber,
        pageSize: 10,
        search: searchTerm || undefined,
      })
      const data = res.data.data
      setEmployees(data.items || [])
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
  }, [search])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    load(1, searchInput)
  }

  const handleViewBalances = async (employee) => {
    setSelectedEmployee(employee)
    setLoadingBalances(true)
    try {
      const res = await adminApi.getEmployeeBalances(employee.id, new Date().getFullYear())
      setBalances(res.data.data || [])
    } catch {
      setBalances([])
    } finally {
      setLoadingBalances(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${pagination.totalCount} total employees`}
      />

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm
            outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Search
          </button>
          {search && (
            <button type="button"
              onClick={() => { setSearch(''); setSearchInput(''); load(1, '') }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
              Clear
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          No employees found.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name', 'Email', 'Role', 'Department', 'Manager', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{emp.fullName}</td>
                      <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[emp.role] || 'bg-gray-100'}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{emp.departmentName || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{emp.managerName || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewBalances(emp)}
                          className="text-xs px-3 py-1.5 border border-blue-300 text-blue-600
                            rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
                        >
                          View Balance
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

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full sm:max-w-md h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{selectedEmployee.fullName}</h3>
                <p className="text-xs text-gray-500 truncate">{selectedEmployee.email}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Leave Balance — {new Date().getFullYear()}
              </h4>

              {loadingBalances ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : balances.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No balances assigned.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {balances.map(b => (
                    <div key={b.leaveTypeId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm text-gray-800">{b.leaveTypeName}</span>
                        <span className="text-xs text-gray-500">{b.remainingDays} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${b.totalDays > 0 ? (b.usedDays / b.totalDays) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Used: {b.usedDays}</span>
                        <span>Total: {b.totalDays}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}