import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../../api/authApi'
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
    axios.get('/api/public/departments')
      .then(res => setDepartments(res.data.data || []))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
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
      const { confirmPassword: _confirmPassword, ...registerData } = formData
      const response = await authApi.register(registerData)
      const { accessToken, refreshToken, fullName, email, role } =
        response.data.data
      login({ fullName, email, role }, accessToken, refreshToken)
      navigate('/employee/dashboard')
    } catch (err) {
      setApiError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding (same as login) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden
        bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700
        flex-col items-center justify-center p-12 text-white">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center
            justify-center mx-auto mb-8 backdrop-blur-sm border border-white/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-3 tracking-tight">ELMS</h1>
          <p className="text-xl font-light text-blue-100 mb-8">
            Employee Leave Management System
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: '✦', text: 'Join your team in minutes' },
              { icon: '✦', text: 'Instant leave balance allocation' },
              { icon: '✦', text: 'Manager approval in one click' },
              { icon: '✦', text: 'Full leave history tracking' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-blue-100">
                <span className="text-blue-300 text-xs">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-xs">
              Trusted by HR teams across Pakistan
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
        bg-gray-50 p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center
              justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">ELMS</h2>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
              <p className="text-gray-500 text-sm mt-1">
                Join your company's leave management system
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
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@company.com"
                required
              />

              {/* Department */}
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
                      : 'border-gray-300 bg-white'}`}
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
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

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} ELMS · Employee Leave Management System
          </p>
        </div>
      </div>
    </div>
  )
}