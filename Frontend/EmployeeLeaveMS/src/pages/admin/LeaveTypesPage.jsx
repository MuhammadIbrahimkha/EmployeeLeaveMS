import { useState, useEffect, useCallback } from 'react'
import { leaveTypeApi } from '../../api/leaveTypeApi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import { Plus } from 'lucide-react'

function LeaveTypeModal({ leaveType, onClose, onDone }) {
  const isEdit = !!leaveType
  const [formData, setFormData] = useState({
    name: leaveType?.name || '',
    defaultDays: leaveType?.defaultDays || '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.defaultDays) newErrors.defaultDays = 'Default days is required'
    else if (Number(formData.defaultDays) < 1 || Number(formData.defaultDays) > 365)
      newErrors.defaultDays = 'Must be between 1 and 365'
    return newErrors
  }

  const handleSubmit = async () => {
    setApiError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setIsLoading(true)
    try {
      const payload = { name: formData.name.trim(), defaultDays: Number(formData.defaultDays) }
      if (isEdit) await leaveTypeApi.update(leaveType.id, payload)
      else await leaveTypeApi.create(payload)
      onDone()
    } catch (err) {
      setApiError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to save.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {isEdit ? 'Edit Leave Type' : 'Create Leave Type'}
        </h3>
        <Alert message={apiError} />
        <div className="flex flex-col gap-4 mt-3">
          <Input label="Name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} placeholder="e.g. Maternity" required />
          <Input label="Default Days" name="defaultDays" type="number"
            value={formData.defaultDays} onChange={handleChange}
            error={errors.defaultDays} placeholder="e.g. 15" required />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="w-auto px-5">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [deactivatingId, setDeactivatingId] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await leaveTypeApi.getAll()
      setLeaveTypes(res.data.data || [])
    } catch {
      //
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleDone = () => { setModal(null); load(); showToast('Leave type saved successfully!') }

  const handleDeactivate = async (lt) => {
    if (!window.confirm(`Deactivate "${lt.name}"?`)) return
    setDeactivatingId(lt.id)
    try {
      await leaveTypeApi.deactivate(lt.id)
      showToast(`"${lt.name}" deactivated.`)
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to deactivate.')
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Leave Types"
        subtitle="Manage available leave types for employees"
        action={
  <Button onClick={() => setModal('create')} className="w-auto px-4 sm:px-6 text-sm flex items-center gap-2">
    <Plus size={16} /> New Leave Type
  </Button>
}
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
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Default Days', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaveTypes.map(lt => (
                  <tr key={lt.id} className={`hover:bg-gray-50 transition ${!lt.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{lt.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lt.defaultDays} days</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${lt.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lt.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {lt.isActive && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModal(lt)}
                            className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600
                              rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivate(lt)}
                            disabled={deactivatingId === lt.id}
                            className="text-xs px-3 py-1.5 border border-red-300 text-red-600
                              rounded-lg hover:bg-red-50 transition disabled:opacity-50 whitespace-nowrap"
                          >
                            {deactivatingId === lt.id ? '...' : 'Deactivate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <LeaveTypeModal
          leaveType={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
    </div>
  )
}