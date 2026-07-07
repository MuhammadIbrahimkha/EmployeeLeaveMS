import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../api/adminApi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'

function CreateDeptModal({ onClose, onDone }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setIsLoading(true)
    try {
      await adminApi.createDepartment({ name: name.trim() })
      onDone()
    } catch (err) {
      setApiError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Create Department</h3>
        <Alert message={apiError} />
        <div className="mt-3">
          <Input
            label="Department Name"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            error={error}
            placeholder="e.g. Product"
            required
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="w-auto px-5">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>Create</Button>
        </div>
      </div>
    </div>
  )
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getDepartments()
      setDepartments(res.data.data || [])
    } catch {
      //
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleDone = () => { setShowModal(false); load(); showToast('Department created!') }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        action={
          <Button onClick={() => setShowModal(true)} className="w-auto px-4 sm:px-6 text-sm">
            + New Department
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  {dept.employeeCount} members
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Manager:{' '}
                <span className="font-medium text-gray-700">
                  {dept.managerName || 'Not assigned'}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Created {new Date(dept.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateDeptModal onClose={() => setShowModal(false)} onDone={handleDone} />}
    </div>
  )
}