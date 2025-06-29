import axios from 'axios'

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Function to set token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 API Error interceptor:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    })
    
    // Only redirect to login for auth-related endpoints or expired tokens
    if (error.response?.status === 401) {
      // Check if this is an auth-related request
      const isAuthRequest = error.config?.url?.includes('/auth/')
      
      if (isAuthRequest) {
        console.log('🚪 Auth request failed - clearing session')
        // Clear token and redirect to login
        setAuthToken(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } else {
        console.log('🚫 Non-auth request failed with 401 - not redirecting')
        // Don't auto-logout for non-auth 401s (might be permission issues)
      }
    }
    
    // For 403 errors, don't auto-logout - it's likely a permission issue
    if (error.response?.status === 403) {
      console.log('🚫 Permission denied (403) - not redirecting to login')
    }
    
    return Promise.reject(error)
  }
)

export default api
