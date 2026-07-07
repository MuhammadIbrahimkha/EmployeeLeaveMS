import { useState, useEffect } from 'react'
import { adminApi } from '../../api/adminApi'
import { leaveTypeApi } from '../../api/leaveTypeApi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'

export default function AssignBalancePage() {
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    totalDays: '',
    year: new Date().getFullYear(),
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getEmployees({ pageNumber: 1, pageSize: 100 }),
      leaveTypeApi.getAll(),
    ])
      .then(([empRes, ltRes]) => {
        setEmployees(empRes.data.data?.items || [])
        setLeaveTypes(ltRes.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.employeeId) newErrors.employeeId = 'Please select an employee'
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Please select a leave type'
    if (!formData.totalDays) newErrors.totalDays = 'Total days is required'
    else if (Number(formData.totalDays) < 1 || Number(formData.totalDays) > 365)
      newErrors.totalDays = 'Must be between 1 and 365'
    if (!formData.year) newErrors.year = 'Year is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setApiSuccess('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setIsLoading(true)
    try {
      await adminApi.assignBalance({
        employeeId: formData.employeeId,
        leaveTypeId: formData.leaveTypeId,
        totalDays: Number(formData.totalDays),
        year: Number(formData.year),
      })
      setApiSuccess('Leave balance assigned successfully!')
      setFormData(prev => ({ ...prev, employeeId: '', leaveTypeId: '', totalDays: '' }))
    } catch (err) {
      setApiError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to assign balance.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500
    ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

  if (loadingData) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Assign Leave Balance"
        subtitle="Assign leave entitlement to an employee for a specific year"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Alert message={apiError} type="error" />
        <Alert message={apiSuccess} type="success" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Employee */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Employee <span className="text-red-500">*</span>
            </label>
            <select name="employeeId" value={formData.employeeId} onChange={handleChange}
              className={selectClass(errors.employeeId)}>
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} — {emp.departmentName}
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId}</p>}
          </div>

          {/* Leave Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select name="leaveTypeId" value={formData.leaveTypeId} onChange={handleChange}
              className={selectClass(errors.leaveTypeId)}>
              <option value="">Select leave type</option>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name} (default: {lt.defaultDays} days)</option>
              ))}
            </select>
            {errors.leaveTypeId && <p className="text-xs text-red-500">{errors.leaveTypeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Days"
              name="totalDays"
              type="number"
              value={formData.totalDays}
              onChange={handleChange}
              error={errors.totalDays}
              placeholder="e.g. 15"
              required
            />
            <Input
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              error={errors.year}
              required
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Assign Balance
          </Button>
        </form>
      </div>
    </div>
  )
}