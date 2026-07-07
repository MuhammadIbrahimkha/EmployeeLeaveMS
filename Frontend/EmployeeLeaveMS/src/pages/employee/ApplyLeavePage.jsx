import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { leaveApi } from '../../api/leaveApi'
import { leaveTypeApi } from '../../api/leaveTypeApi'
import PageHeader from '../../components/PageHeader'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

export default function ApplyLeavePage() {
  const navigate = useNavigate()
  const [leaveTypes, setLeaveTypes] = useState([])
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    leaveTypeApi.getAll()
      .then(res => setLeaveTypes(res.data.data || []))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Please select a leave type'
    if (!formData.startDate)   newErrors.startDate   = 'Start date is required'
    if (!formData.endDate)     newErrors.endDate     = 'End date is required'
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate)
      newErrors.endDate = 'End date cannot be before start date'
    if (!formData.reason.trim())
      newErrors.reason = 'Reason is required'
    else if (formData.reason.trim().length < 5)
      newErrors.reason = 'Reason must be at least 5 characters'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setApiSuccess('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsLoading(true)
    try {
      await leaveApi.apply(formData)
      setApiSuccess('Leave request submitted successfully!')
      setTimeout(() => navigate('/employee/leaves'), 1500)
    } catch (err) {
      setApiError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Failed to submit leave request.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit a new leave request for approval"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <Alert message={apiError} type="error" />
        <Alert message={apiSuccess} type="success" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.leaveTypeId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
            {errors.leaveTypeId && (
              <p className="text-xs text-red-500">{errors.leaveTypeId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Briefly describe the reason for your leave..."
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none
                resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.reason ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.reason && (
              <p className="text-xs text-red-500">{errors.reason}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="sm:w-auto px-6"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}