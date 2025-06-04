import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { setAuthToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token'))
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  // Set token on store initialization
  if (token.value) {
    setAuthToken(token.value)
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔐 Attempting login to:', api.defaults.baseURL + '/auth/login')
      console.log('📝 Credentials:', { 
        username: credentials.username, 
        password: credentials.password.substring(0, 3) + '***' 
      })
      
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      })
      
      console.log('✅ Login response status:', response.status)
      console.log('✅ Login response data:', response.data)
      
      if (response.status === 200 && response.data) {
        const authToken = response.data.token
        const userData = response.data.user || { username: credentials.username }
        
        if (authToken) {
          token.value = authToken
          user.value = userData
          
          // Set token for future requests
          setAuthToken(authToken)
          
          localStorage.setItem('auth_token', token.value)
          localStorage.setItem('auth_user', JSON.stringify(user.value))
          
          console.log('✅ Login successful! Token stored')
          return true
        } else {
          error.value = 'No authentication token received'
          return false
        }
      } else {
        error.value = 'Login failed'
        return false
      }
      
    } catch (err) {
      console.error('❌ Login error:', err)
      
      if (err.response) {
        let errorMessage = 'Login failed'
        
        if (err.response.status === 401) {
          errorMessage = err.response.data?.message || 'Invalid username or password'
        } else if (err.response.status === 423) {
          errorMessage = err.response.data?.message || 'Account locked due to too many failed attempts'
        } else if (err.response.status === 403) {
          errorMessage = err.response.data?.message || 'Account inactive'
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`
        }
        
        error.value = errorMessage
      } else if (err.request) {
        error.value = 'Cannot connect to server. Is the backend running on port 8080?'
      } else {
        error.value = err.message || 'Login failed'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      setAuthToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.get('/auth/profile')
      if (response.data && response.status === 200) {
        user.value = response.data
        localStorage.setItem('auth_user', JSON.stringify(user.value))
        return true
      } else {
        logout()
        return false
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      logout()
      return false
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    api  // Export the API instance for backward compatibility
  }
})
