import { createContext, useContext, useState, useEffect } from 'react'
import { tokenManager } from '../utils/tokenManager'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifySession = async () => {
      const refreshToken = tokenManager.getRefreshToken()
      const savedUser = localStorage.getItem('user')

      if (!refreshToken || !savedUser) {
        // Nothing stored — definitely not logged in
        setIsLoading(false)
        return
      }

      try {
        // Verify the refresh token is still valid
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        })

        const {
          accessToken,
          refreshToken: newRefreshToken,
          fullName,
          email,
          role,
        } = response.data.data

        tokenManager.setAccessToken(accessToken)
        tokenManager.setRefreshToken(newRefreshToken)

        const userData = { fullName, email, role }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch {
        // Token expired or revoked — clear everything silently
        tokenManager.clearAll()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  const login = (userData, accessToken, refreshToken) => {
    tokenManager.setAccessToken(accessToken)
    tokenManager.setRefreshToken(refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    tokenManager.clearAll()
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAuthenticated = !!user
  const role = user?.role ?? null

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, role, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}