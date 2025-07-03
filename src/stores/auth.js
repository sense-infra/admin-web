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

  // Enhanced permission checking function - supports multiple parameter formats
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

    // Check role-based permissions (new format from backend)
    if (user.value.role?.permissions && typeof user.value.role.permissions === 'object') {
      const rolePermissions = user.value.role.permissions
      
      if (action) {
        // Check if the resource exists and has the specific action
        return rolePermissions[resource]?.includes(action) || false
      } else {
        // Check if user has any permission for the resource
        return rolePermissions[resource]?.length > 0 || false
      }
    }

    // Legacy format: Check if user has specific permission in various formats
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

    // Check role-based permissions (legacy array format)
    if (user.value.role?.permissions && Array.isArray(user.value.role.permissions)) {
      return user.value.role.permissions.includes(permissionToCheck)
    }

    // For now, grant access to all authenticated users for basic operations
    // You can modify this based on your permission system
    return isAuthenticated.value
  }

  // Role-related computed properties
  const canManageRoles = computed(() => {
    return hasPermission('roles', 'read') || 
           hasPermission('roles', 'create') || 
           hasPermission('roles', 'update') || 
           hasPermission('roles', 'delete') ||
           user.value?.role?.name === 'admin'
  })

  const canCreateRoles = computed(() => {
    return hasPermission('roles', 'create') || user.value?.role?.name === 'admin'
  })

  const canUpdateRoles = computed(() => {
    return hasPermission('roles', 'update') || user.value?.role?.name === 'admin'
  })

  const canDeleteRoles = computed(() => {
    return hasPermission('roles', 'delete') || user.value?.role?.name === 'admin'
  })

  const isAdmin = computed(() => {
    return user.value?.role?.name?.toLowerCase() === 'admin'
  })

  const isViewer = computed(() => {
    return user.value?.role?.name?.toLowerCase() === 'viewer'
  })

  const userRoleName = computed(() => {
    return user.value?.role?.name || 'Unknown'
  })

  const userRoleDisplayName = computed(() => {
    const roleName = userRoleName.value
    return roleName.charAt(0).toUpperCase() + roleName.slice(1)
  })

  const allPermissions = computed(() => {
    return user.value?.role?.permissions || {}
  })

  const accessibleResources = computed(() => {
    const permissions = allPermissions.value
    if (typeof permissions === 'object' && permissions !== null) {
      return Object.keys(permissions).filter(resource => 
        Array.isArray(permissions[resource]) && permissions[resource].length > 0
      )
    }
    return []
  })

  const totalPermissionsCount = computed(() => {
    const permissions = allPermissions.value
    if (typeof permissions === 'object' && permissions !== null) {
      return Object.values(permissions).reduce((total, actions) => {
        return total + (Array.isArray(actions) ? actions.length : 0)
      }, 0)
    }
    return 0
  })

  // Role helper functions
  const hasRole = (roleName) => {
    return user.value?.role?.name?.toLowerCase() === roleName.toLowerCase()
  }

  const isSystemRole = (role) => {
    return ['admin', 'viewer'].includes(role?.name?.toLowerCase())
  }

  const getResourcePermissions = (resource) => {
    const permissions = allPermissions.value
    if (typeof permissions === 'object' && permissions !== null) {
      return permissions[resource] || []
    }
    return []
  }

  const hasAnyPermissionForResource = (resource) => {
    const resourcePermissions = getResourcePermissions(resource)
    return Array.isArray(resourcePermissions) && resourcePermissions.length > 0
  }

  // Check specific management permissions
  const canManageUsers = computed(() => {
    return hasPermission('users', 'read') || isAdmin.value
  })

  const canManageAPIKeys = computed(() => {
    return hasPermission('api_keys', 'read') || isAdmin.value
  })

  const canManageCustomers = computed(() => {
    return hasPermission('customers', 'read') || isAdmin.value
  })

  const canManageContracts = computed(() => {
    return hasPermission('contracts', 'read') || isAdmin.value
  })

  const canManageServiceTiers = computed(() => {
    return hasPermission('service_tiers', 'read') || isAdmin.value
  })

  const canManageControllers = computed(() => {
    return hasPermission('controllers', 'read') || isAdmin.value
  })

  const canManageCameras = computed(() => {
    return hasPermission('cameras', 'read') || isAdmin.value
  })

  const canManageEvents = computed(() => {
    return hasPermission('events', 'read') || isAdmin.value
  })

  const canManageRFMonitoring = computed(() => {
    return hasPermission('rf_monitoring', 'read') || isAdmin.value
  })

  const canViewLogs = computed(() => {
    return hasPermission('logs', 'read') || isAdmin.value
  })

  // Section access checks for navigation
  const canAccessAdmin = computed(() => {
    return canManageUsers.value || canManageRoles.value || canManageAPIKeys.value
  })

  const canAccessBusiness = computed(() => {
    return canManageCustomers.value || canManageContracts.value || canManageServiceTiers.value
  })

  const canAccessHardware = computed(() => {
    return canManageControllers.value || canManageCameras.value
  })

  const canAccessMonitoring = computed(() => {
    return canManageEvents.value || canViewLogs.value
  })

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
          console.log('👤 User role:', userData.role?.name)
          console.log('🔑 User permissions:', userData.role?.permissions)
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

  // Update user profile after changes
  const updateUserProfile = (updatedUser) => {
    user.value = { ...user.value, ...updatedUser }
    localStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    
    // Role management computed properties
    canManageRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
    isAdmin,
    isViewer,
    userRoleName,
    userRoleDisplayName,
    allPermissions,
    accessibleResources,
    totalPermissionsCount,
    
    // Resource management permissions
    canManageUsers,
    canManageAPIKeys,
    canManageCustomers,
    canManageContracts,
    canManageServiceTiers,
    canManageControllers,
    canManageCameras,
    canManageEvents,
    canManageRFMonitoring,
    canViewLogs,
    
    // Section access permissions
    canAccessAdmin,
    canAccessBusiness,
    canAccessHardware,
    canAccessMonitoring,
    
    // Functions
    hasPermission, // Enhanced permission checking
    hasRole,
    isSystemRole,
    getResourcePermissions,
    hasAnyPermissionForResource,
    login,
    logout,
    checkAuth,
    updateUserProfile,
    
    // API instance for backward compatibility
    api
  }
})
