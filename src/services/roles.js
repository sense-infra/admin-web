import api from './api'
import { usePermissions } from '@/composables/usePermissions'

export const rolesService = {
  // Get all roles
  async getAll() {
    try {
      const response = await api.get('/auth/roles')
      console.log('📋 Roles fetched:', response.data)

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.roles) {
        return response.data.roles
      } else if (response.data && response.data.data) {
        return response.data.data
      } else {
        return []
      }
    } catch (error) {
      console.error('❌ Failed to fetch roles:', error)
      throw error
    }
  },

  // Get role by ID
  async getById(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}`)
      console.log('📋 Role fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch role:', error)
      throw error
    }
  },

  // Get role usage information
  async getUsage(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}/usage`)
      console.log('📊 Role usage fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch role usage:', error)
      throw error
    }
  },

  // Create new role
  async create(roleData) {
    try {
      console.log('➕ Creating role:', roleData)
      const response = await api.post('/auth/roles', roleData)
      console.log('✅ Role created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to create role:', error)
      throw error
    }
  },

  // Update role
  async update(roleId, roleData) {
    try {
      console.log('✏️ Updating role:', roleId, roleData)
      const response = await api.put(`/auth/roles/${roleId}`, roleData)
      console.log('✅ Role updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to update role:', error)
      throw error
    }
  },

  // Delete role (with enhanced error handling)
  async delete(roleId) {
    try {
      console.log('🗑️ Deleting role:', roleId)
      const response = await api.delete(`/auth/roles/${roleId}`)
      console.log('✅ Role deleted')
      return response.data
    } catch (error) {
      console.error('❌ Failed to delete role:', error)

      // Enhanced error handling for role deletion
      if (error.response?.status === 409) {
        const message = error.response.data?.message || 'Role cannot be deleted'
        if (message.includes('assigned to') || message.includes('users')) {
          // Enhance the error with more context
          throw new Error(`${message}. Please reassign users to another role before deletion.`)
        }
        if (message.includes('system role')) {
          throw new Error('System roles cannot be deleted as they are essential for platform operation.')
        }
      }

      throw error
    }
  },

  // Deactivate role
  async deactivate(roleId) {
    try {
      console.log('⏸️ Deactivating role:', roleId)
      const response = await api.post(`/auth/roles/${roleId}/deactivate`)
      console.log('✅ Role deactivated')
      return response.data
    } catch (error) {
      console.error('❌ Failed to deactivate role:', error)
      throw error
    }
  },

  // Reassign users from one role to another
  async reassignUsers(fromRoleId, toRoleId) {
    try {
      console.log('🔄 Reassigning users from role', fromRoleId, 'to role', toRoleId)
      const response = await api.post(`/auth/roles/${fromRoleId}/reassign`, {
        new_role_id: toRoleId
      })
      console.log('✅ Users reassigned')
      return response.data
    } catch (error) {
      console.error('❌ Failed to reassign users:', error)
      throw error
    }
  },

  // Get users assigned to a role
  async getRoleUsers(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}/users`)
      console.log('👥 Role users fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch role users:', error)
      throw error
    }
  }
}

// Utility functions for role management using centralized permissions
export const roleUtils = {
  // Format role name for display
  formatRoleName(role) {
    if (!role || !role.name) return 'Unknown Role'
    return role.name.charAt(0).toUpperCase() + role.name.slice(1)
  },

  // Get role badge color class
  getRoleBadgeClass(roleName) {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'manager':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'operator':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'viewer':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  },

  // Check if role is system role (cannot be deleted)
  isSystemRole(role) {
    return ['admin', 'viewer'].includes(role?.name?.toLowerCase())
  },

  // Count permissions for a role using centralized permissions
  countPermissions(role) {
    if (!role?.permissions) return 0
    return Object.values(role.permissions).reduce((total, actions) => total + actions.length, 0)
  },

  // Get permission summary for display using centralized permissions
  getPermissionSummary(role) {
    if (!role?.permissions) return 'No permissions'

    const resources = Object.keys(role.permissions)
    const totalActions = this.countPermissions(role)

    if (resources.length === 0) return 'No permissions'
    if (resources.length === 1) return `${resources[0]} (${totalActions} actions)`

    return `${resources.length} resources (${totalActions} actions)`
  },

  // Validate role data using centralized permissions
  validateRole(roleData) {
    const errors = []

    if (!roleData.name || roleData.name.trim() === '') {
      errors.push('Role name is required')
    }

    if (roleData.name && roleData.name.length < 2) {
      errors.push('Role name must be at least 2 characters')
    }

    if (roleData.name && roleData.name.length > 50) {
      errors.push('Role name must be less than 50 characters')
    }

    if (!roleData.permissions || Object.keys(roleData.permissions).length === 0) {
      errors.push('At least one permission is required')
    }

    // Use centralized permissions to validate against available resources
    if (roleData.permissions && typeof window !== 'undefined') {
      try {
        const { validatePermissions } = usePermissions()
        const validation = validatePermissions(roleData.permissions)
        if (!validation.isValid) {
          errors.push(...validation.errors)
        }
      } catch (e) {
        // Fallback validation if composable not available
        console.warn('Could not validate permissions with centralized system')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Format error messages for display
  formatError(error) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }

    if (error.response?.data?.error) {
      return error.response.data.error
    }

    if (error.message) {
      return error.message
    }

    return 'An unexpected error occurred'
  },

  // Get default permissions for common role types using centralized permissions
  getDefaultPermissions(roleType) {
    // Try to use centralized permissions if available
    if (typeof window !== 'undefined') {
      try {
        const { getAllResources } = usePermissions()
        const allResources = getAllResources()
        
        // Generate defaults based on role type and available resources
        const defaults = {}
        
        switch (roleType?.toLowerCase()) {
          case 'admin':
            // Admin gets all permissions for all resources
            allResources.forEach(resource => {
              defaults[resource.name] = resource.actions.map(action => action.name)
            })
            break
            
          case 'manager':
            // Manager gets most permissions except critical ones
            allResources.forEach(resource => {
              const allowedActions = resource.actions
                .filter(action => action.risk !== 'critical')
                .map(action => action.name)
              if (allowedActions.length > 0) {
                defaults[resource.name] = allowedActions
              }
            })
            break
            
          case 'operator':
            // Operator gets read and some update permissions
            allResources.forEach(resource => {
              const allowedActions = resource.actions
                .filter(action => ['read', 'update'].includes(action.name) && 
                               (!action.risk || ['low', 'medium'].includes(action.risk)))
                .map(action => action.name)
              if (allowedActions.length > 0) {
                defaults[resource.name] = allowedActions
              }
            })
            break
            
          case 'viewer':
            // Viewer gets only read permissions
            allResources.forEach(resource => {
              const readActions = resource.actions
                .filter(action => action.name === 'read')
                .map(action => action.name)
              if (readActions.length > 0) {
                defaults[resource.name] = readActions
              }
            })
            break
        }
        
        return defaults
      } catch (e) {
        console.warn('Could not generate defaults with centralized system, using fallback')
      }
    }

    // Fallback to static defaults if centralized system not available
    const staticDefaults = {
      admin: {
        users: ['create', 'read', 'update', 'delete'],
        roles: ['create', 'read', 'update', 'delete'],
        customers: ['create', 'read', 'update', 'delete'],
        contracts: ['create', 'read', 'update', 'delete'],
        service_tiers: ['create', 'read', 'update', 'delete'],
        controllers: ['create', 'read', 'update', 'delete'],
        cameras: ['create', 'read', 'update', 'delete'],
        events: ['create', 'read', 'update', 'delete'],
        api_keys: ['create', 'read', 'update', 'delete'],
        rf_monitoring: ['create', 'read', 'update', 'delete'],
        system_config: ['create', 'read', 'update', 'delete'],
        logs: ['read'],
        diagnostics: ['read']
      },
      manager: {
        users: ['read', 'update'],
        customers: ['create', 'read', 'update'],
        contracts: ['create', 'read', 'update'],
        service_tiers: ['read'],
        controllers: ['read', 'update'],
        cameras: ['read', 'update'],
        events: ['read', 'update'],
        api_keys: ['read'],
        rf_monitoring: ['read', 'update'],
        logs: ['read'],
        diagnostics: ['read']
      },
      operator: {
        customers: ['read'],
        contracts: ['read'],
        controllers: ['read'],
        cameras: ['read'],
        events: ['read', 'update'],
        rf_monitoring: ['read'],
        diagnostics: ['read']
      },
      viewer: {
        users: ['read'],
        customers: ['read'],
        contracts: ['read'],
        service_tiers: ['read'],
        controllers: ['read'],
        cameras: ['read'],
        events: ['read'],
        api_keys: ['read'],
        rf_monitoring: ['read'],
        system_config: ['read'],
        logs: ['read'],
        diagnostics: ['read']
      }
    }

    return staticDefaults[roleType?.toLowerCase()] || {}
  },

  // Check if user has permission to manage roles
  canManageRoles(user) {
    if (!user?.role?.permissions) return false
    return user.role.permissions.roles?.includes('create') ||
           user.role.permissions.roles?.includes('update') ||
           user.role.permissions.roles?.includes('delete') ||
           user.role.name === 'admin'
  },

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString()
  },

  // Format permissions for API request using centralized validation
  formatPermissionsForAPI(permissions) {
    // Ensure permissions is a proper object with arrays
    const formatted = {}

    // Validate using centralized system if available
    if (typeof window !== 'undefined') {
      try {
        const { validatePermissions } = usePermissions()
        const validation = validatePermissions(permissions)
        if (!validation.isValid) {
          console.warn('Invalid permissions detected:', validation.errors)
        }
      } catch (e) {
        // Continue with basic validation
      }
    }

    Object.entries(permissions).forEach(([resource, actions]) => {
      if (Array.isArray(actions) && actions.length > 0) {
        formatted[resource] = actions
      }
    })

    return formatted
  },

  // Parse permissions from API response
  parsePermissionsFromAPI(permissions) {
    if (!permissions || typeof permissions !== 'object') {
      return {}
    }

    // Handle both object and string formats
    if (typeof permissions === 'string') {
      try {
        return JSON.parse(permissions)
      } catch (e) {
        console.warn('Failed to parse permissions string:', permissions)
        return {}
      }
    }

    return permissions
  },

  // Get formatted permissions for display using centralized system
  formatPermissionsForDisplay(permissions) {
    if (typeof window !== 'undefined') {
      try {
        const { formatPermissionsForDisplay } = usePermissions()
        return formatPermissionsForDisplay(permissions)
      } catch (e) {
        // Fallback to basic formatting
      }
    }

    // Basic fallback formatting
    const result = []
    Object.entries(permissions || {}).forEach(([resourceName, actions]) => {
      result.push({
        resource: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
        actions: Array.isArray(actions) ? actions.join(', ') : actions
      })
    })
    return result
  },

  // Clone role with new permissions using centralized defaults
  cloneRole(originalRole, newRoleType = null) {
    const clonedRole = {
      name: `${originalRole.name} (Copy)`,
      description: `Copy of ${originalRole.name}`,
      permissions: originalRole.permissions ? { ...originalRole.permissions } : {},
      active: true
    }

    // If a new role type is specified, use default permissions for that type
    if (newRoleType) {
      clonedRole.permissions = this.getDefaultPermissions(newRoleType)
      clonedRole.name = `${newRoleType.charAt(0).toUpperCase() + newRoleType.slice(1)} Role`
      clonedRole.description = `${newRoleType.charAt(0).toUpperCase() + newRoleType.slice(1)} role with standard permissions`
    }

    return clonedRole
  }
}

export default rolesService
