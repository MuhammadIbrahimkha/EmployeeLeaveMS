// Access token lives in memory only - not localStorage, not sessionStorage
// This protects against XSS attacks
let accessToken = null

export const tokenManager = {
  getAccessToken: () => accessToken,

  setAccessToken: (token) => {
    accessToken = token
  },

  clearAccessToken: () => {
    accessToken = null
  },

  // Refresh token persists across page refreshes - stored in localStorage
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  setRefreshToken: (token) => {
    localStorage.setItem('refreshToken', token)
  },

  clearRefreshToken: () => {
    localStorage.removeItem('refreshToken')
  },

  clearAll: () => {
    accessToken = null
    localStorage.removeItem('refreshToken')
  }
}