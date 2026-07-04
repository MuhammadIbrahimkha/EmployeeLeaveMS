import axios from 'axios'
import { tokenManager } from '../utils/tokenManager'

const api = axios.create({
  baseURL: '/api',  // Vite proxy forwards this to https://localhost:7012/api
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor ─────────────────────────────────────────────────────
// Runs before EVERY outgoing request
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ────────────────────────────────────────────────────
// Runs after EVERY incoming response
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  // Success - just pass the response through
  (response) => response,

  // Error - check if it's a 401 (token expired)
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing - queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenManager.getRefreshToken()

      if (!refreshToken) {
        // No refresh token - user must log in again
        tokenManager.clearAll()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Attempt to get a new access token
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data

        tokenManager.setAccessToken(accessToken)
        tokenManager.setRefreshToken(newRefreshToken)

        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenManager.clearAll()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api