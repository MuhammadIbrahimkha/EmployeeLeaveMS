import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { adminApi } from '../../api/adminApi'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
  })
  const [departments, setDepartments] = useState([])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load departments for the dropdown
    const loadDepartments = async () => {
      try {
        const res = await adminApi.getDepartments()
        setDepartments(res.data.data || [])
      } catch {
        // Departments failed to load - not critical, user can try again
      }
    }
    loadDepartments()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim())
      newErrors.fullName = 'Full name is required'
    if (!formData.email)
      newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Enter a valid email address'
    if (!formData.password)
      newErrors.password = 'Password is required'
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.departmentId)
      newErrors.departmentId = 'Please select a department'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...registerData } = formData
      const response = await authApi.register(registerData)
      const { accessToken, refreshToken, fullName, email, role } =
        response.data.data

      login({ fullName, email, role }, accessToken, refreshToken)
      navigate('/employee/dashboard')

    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join your company's leave system
          </p>
        </div>

        <Alert message={apiError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Ibrahim Khan"
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@company.com"
            required
          />

          {/* Department Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.departmentId
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
                }`}
            >
              <option value="">Select your department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-xs text-red-500">{errors.departmentId}</p>
            )}
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Min 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Repeat your password"
            required
          />

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}