import { createContext, useContext, useState, useEffect } from 'react'
import { tokenManager } from '../utils/tokenManager'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // On app load, check if a refresh token exists
    // If yes, the user was previously logged in
    // We restore their session data from localStorage
    const refreshToken = tokenManager.getRefreshToken()
    const savedUser = localStorage.getItem('user')

    if (refreshToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        tokenManager.clearAll()
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
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

// Custom hook - any component calls useAuth() to access auth state
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}