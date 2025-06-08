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

  // Permission checking function - supports multiple parameter formats
  const hasPermission = (resource, action = null) => {
    if (!user.value) return false
    
    // If user is admin, grant all permissions
    if (user.value.role?.name === 'admin' || user.value.role === 'admin' || user.value.is_admin) {
      return true
    }
    
    // Handle different permission formats
    let permissionToCheck = resource
    if (action) {
      // Format: hasPermission('api_keys', 'create') -> 'api_keys:create'
      permissionToCheck = `${resource}:${action}`
    }
    
    // Check if user has specific permission in various formats
    if (user.value.permissions && Array.isArray(user.value.permissions)) {
      // Check exact match
      if (user.value.permissions.includes(permissionToCheck)) {
        return true
      }
      
      // Check with different formats
      if (action) {
        const alternativeFormats = [
          `${resource}.${action}`,  // api_keys.create
          `${resource}_${action}`,  // api_keys_create
          `${action}_${resource}`,  // create_api_keys
          resource,                 // just api_keys (broad permission)
          action                    // just create (broad permission)
        ]
        
        for (const format of alternativeFormats) {
          if (user.value.permissions.includes(format)) {
            return true
          }
        }
      }
    }
    
    // Check role-based permissions
    if (user.value.role?.permissions && Array.isArray(user.value.role.permissions)) {
      return user.value.role.permissions.includes(permissionToCheck)
    }
    
    // For now, grant access to all authenticated users for basic operations
    // You can modify this based on your permission system
    return isAuthenticated.value
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
    hasPermission, // Export the enhanced hasPermission function
    login,
    logout,
    checkAuth,
    api  // Export the API instance for backward compatibility
  }
})
