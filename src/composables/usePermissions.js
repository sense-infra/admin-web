// src/composables/usePermissions.js
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Centralized Permission Configuration
 * 
 * This composable provides a single source of truth for all permission resources
 * and actions across the admin interface. Update this file to add/modify permissions
 * rather than editing individual components.
 */

// Master permissions configuration
const PERMISSION_RESOURCES = [
  {
    name: 'users',
    label: 'User Management',
    description: 'Manage system users and accounts',
    icon: 'users',
    color: 'text-blue-600',
    category: 'administration',
    actions: [
      { name: 'read', label: 'View Users', description: 'View user accounts and details', color: 'text-green-600' },
      { name: 'create', label: 'Create Users', description: 'Add new user accounts', color: 'text-blue-600', risk: 'medium' },
      { name: 'update', label: 'Update Users', description: 'Modify user account information', color: 'text-yellow-600', risk: 'medium' },
      { name: 'delete', label: 'Delete Users', description: 'Remove user accounts', color: 'text-red-600', risk: 'high' }
    ]
  },
  {
    name: 'roles',
    label: 'Role Management',
    description: 'Manage system roles and permissions',
    icon: 'shield-check',
    color: 'text-purple-600',
    category: 'administration',
    actions: [
      { name: 'read', label: 'View Roles', description: 'View roles and their permissions', color: 'text-green-600' },
      { name: 'create', label: 'Create Roles', description: 'Create new system roles', color: 'text-blue-600', risk: 'high' },
      { name: 'update', label: 'Update Roles', description: 'Modify role permissions', color: 'text-yellow-600', risk: 'high' },
      { name: 'delete', label: 'Delete Roles', description: 'Remove system roles', color: 'text-red-600', risk: 'critical' }
    ]
  },
  {
    name: 'customers',
    label: 'Customer Management',
    description: 'Manage customer information and data',
    icon: 'users-multiple',
    color: 'text-green-600',
    category: 'business',
    actions: [
      { name: 'read', label: 'View Customers', description: 'View customer information', color: 'text-green-600' },
      { name: 'create', label: 'Create Customers', description: 'Add new customers', color: 'text-blue-600' },
      { name: 'update', label: 'Update Customers', description: 'Modify customer information', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Customers', description: 'Remove customer records', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'contracts',
    label: 'Contract Management',
    description: 'Manage service contracts and agreements',
    icon: 'document-text',
    color: 'text-indigo-600',
    category: 'business',
    actions: [
      { name: 'read', label: 'View Contracts', description: 'View service contracts', color: 'text-green-600' },
      { name: 'create', label: 'Create Contracts', description: 'Create new contracts', color: 'text-blue-600' },
      { name: 'update', label: 'Update Contracts', description: 'Modify contract terms', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Contracts', description: 'Remove contracts', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'service_tiers',
    label: 'Service Tiers',
    description: 'Manage service tier configurations',
    icon: 'collection',
    color: 'text-teal-600',
    category: 'business',
    actions: [
      { name: 'read', label: 'View Service Tiers', description: 'View service tier configurations', color: 'text-green-600' },
      { name: 'create', label: 'Create Service Tiers', description: 'Create new service tiers', color: 'text-blue-600' },
      { name: 'update', label: 'Update Service Tiers', description: 'Modify service tier settings', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Service Tiers', description: 'Remove service tiers', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'api_keys',
    label: 'API Key Management',
    description: 'Manage API keys and external access',
    icon: 'key',
    color: 'text-orange-600',
    category: 'security',
    actions: [
      { name: 'read', label: 'View API Keys', description: 'View API key information', color: 'text-green-600' },
      { name: 'create', label: 'Create API Keys', description: 'Generate new API keys', color: 'text-blue-600', risk: 'high' },
      { name: 'update', label: 'Update API Keys', description: 'Modify API key settings', color: 'text-yellow-600', risk: 'medium' },
      { name: 'delete', label: 'Delete API Keys', description: 'Revoke API keys', color: 'text-red-600', risk: 'high' }
    ]
  },
  {
    name: 'controllers',
    label: 'Controllers',
    description: 'Manage edge computing controllers',
    icon: 'desktop-computer',
    color: 'text-gray-600',
    category: 'infrastructure',
    actions: [
      { name: 'read', label: 'View Controllers', description: 'View controller information', color: 'text-green-600' },
      { name: 'create', label: 'Create Controllers', description: 'Add new controllers', color: 'text-blue-600' },
      { name: 'update', label: 'Update Controllers', description: 'Modify controller settings', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Controllers', description: 'Remove controllers', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'cameras',
    label: 'Cameras',
    description: 'Manage security cameras and video streams',
    icon: 'video-camera',
    color: 'text-gray-600',
    category: 'infrastructure',
    actions: [
      { name: 'read', label: 'View Cameras', description: 'View camera information', color: 'text-green-600' },
      { name: 'create', label: 'Create Cameras', description: 'Add new cameras', color: 'text-blue-600' },
      { name: 'update', label: 'Update Cameras', description: 'Modify camera settings', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Cameras', description: 'Remove cameras', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'nvrs',
    label: 'NVR Management',
    description: 'Manage Network Video Recorders',
    icon: 'server',
    color: 'text-gray-700',
    category: 'infrastructure',
    actions: [
      { name: 'read', label: 'View NVRs', description: 'View NVR information', color: 'text-green-600' },
      { name: 'create', label: 'Create NVRs', description: 'Add new NVRs', color: 'text-blue-600' },
      { name: 'update', label: 'Update NVRs', description: 'Modify NVR settings', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete NVRs', description: 'Remove NVRs', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'events',
    label: 'Security Events',
    description: 'View and manage security events',
    icon: 'bell',
    color: 'text-red-600',
    category: 'monitoring',
    actions: [
      { name: 'read', label: 'View Events', description: 'View security events', color: 'text-green-600' },
      { name: 'create', label: 'Create Events', description: 'Create manual events', color: 'text-blue-600' },
      { name: 'update', label: 'Update Events', description: 'Modify event details', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete Events', description: 'Remove events', color: 'text-red-600', risk: 'medium' }
    ]
  },
  {
    name: 'rf_monitoring',
    label: 'RF Monitoring',
    description: 'Manage RF frequency monitoring and jamming detection',
    icon: 'wifi',
    color: 'text-pink-600',
    category: 'monitoring',
    actions: [
      { name: 'read', label: 'View RF Data', description: 'View RF monitoring data', color: 'text-green-600' },
      { name: 'create', label: 'Configure RF', description: 'Configure RF monitoring', color: 'text-blue-600' },
      { name: 'update', label: 'Update RF Settings', description: 'Modify RF monitoring settings', color: 'text-yellow-600' },
      { name: 'delete', label: 'Delete RF Config', description: 'Remove RF configurations', color: 'text-red-600' }
    ]
  },
  {
    name: 'system_config',
    label: 'System Configuration',
    description: 'Manage system-wide settings and configuration',
    icon: 'cog',
    color: 'text-gray-700',
    category: 'administration',
    actions: [
      { name: 'read', label: 'View Config', description: 'View system configuration', color: 'text-green-600' },
      { name: 'create', label: 'Create Config', description: 'Create configuration entries', color: 'text-blue-600', risk: 'high' },
      { name: 'update', label: 'Update Config', description: 'Modify system settings', color: 'text-yellow-600', risk: 'high' },
      { name: 'delete', label: 'Delete Config', description: 'Remove configuration entries', color: 'text-red-600', risk: 'critical' }
    ]
  },
  {
    name: 'logs',
    label: 'System Logs',
    description: 'Access system logs and audit trails',
    icon: 'book-open',
    color: 'text-gray-500',
    category: 'monitoring',
    actions: [
      { name: 'read', label: 'View Logs', description: 'Access system and audit logs', color: 'text-green-600' }
    ]
  },
  {
    name: 'diagnostics',
    label: 'System Diagnostics',
    description: 'View system diagnostics and health metrics',
    icon: 'chart-bar',
    color: 'text-yellow-600',
    category: 'monitoring',
    actions: [
      { name: 'read', label: 'View Diagnostics', description: 'View system health and diagnostics', color: 'text-green-600' }
    ]
  }
]

// Permission categories for organization
const PERMISSION_CATEGORIES = {
  administration: { 
    label: 'Administration', 
    icon: 'shield-check', 
    color: 'text-purple-600',
    description: 'User management, roles, and system configuration'
  },
  business: { 
    label: 'Business Management', 
    icon: 'briefcase', 
    color: 'text-green-600',
    description: 'Customer data, contracts, and service tiers'
  },
  security: { 
    label: 'Security & Access', 
    icon: 'lock-closed', 
    color: 'text-red-600',
    description: 'API keys and access control'
  },
  infrastructure: { 
    label: 'Infrastructure', 
    icon: 'server', 
    color: 'text-gray-600',
    description: 'Hardware management and device control'
  },
  monitoring: { 
    label: 'Monitoring & Events', 
    icon: 'eye', 
    color: 'text-blue-600',
    description: 'Event monitoring, logs, and system diagnostics'
  }
}

/**
 * Main permissions composable
 */
export function usePermissions() {
  const authStore = useAuthStore()

  // Get all permission resources
  const getAllResources = () => PERMISSION_RESOURCES

  // Get resources by category
  const getResourcesByCategory = (category) => {
    return PERMISSION_RESOURCES.filter(resource => resource.category === category)
  }

  // Get available categories
  const getCategories = () => PERMISSION_CATEGORIES

  // Get resources for API key creation (subset of all resources)
  const getAPIKeyResources = () => {
    // For API keys, we typically want to exclude admin-only resources
    const apiKeyAllowedResources = [
      'customers', 'contracts', 'service_tiers', 'controllers', 
      'cameras', 'nvrs', 'events', 'rf_monitoring'
    ]
    
    return PERMISSION_RESOURCES.filter(resource => 
      apiKeyAllowedResources.includes(resource.name)
    )
  }

  // Get resources for role management (all resources)
  const getRoleManagementResources = () => getAllResources()

  // Get specific resource by name
  const getResource = (resourceName) => {
    return PERMISSION_RESOURCES.find(resource => resource.name === resourceName)
  }

  // Get risk level for an action
  const getActionRisk = (resourceName, actionName) => {
    const resource = getResource(resourceName)
    const action = resource?.actions.find(a => a.name === actionName)
    return action?.risk || 'low'
  }

  // Check if user has permission (uses auth store)
  const hasPermission = (resource, action) => {
    return authStore.hasPermission(resource, action)
  }

  // Get user's permissions for a resource
  const getUserResourcePermissions = (resourceName) => {
    const userPermissions = authStore.user?.role?.permissions || {}
    return userPermissions[resourceName] || []
  }

  // Get all user permissions
  const getAllUserPermissions = () => {
    return authStore.user?.role?.permissions || {}
  }

  // Helper to format permissions for display
  const formatPermissionsForDisplay = (permissions) => {
    const result = []
    
    Object.entries(permissions).forEach(([resourceName, actions]) => {
      const resource = getResource(resourceName)
      if (resource) {
        const actionLabels = actions.map(actionName => {
          const action = resource.actions.find(a => a.name === actionName)
          return action?.label || actionName
        })
        
        result.push({
          resource: resource.label,
          actions: actionLabels.join(', ')
        })
      }
    })
    
    return result
  }

  // Validate permissions object
  const validatePermissions = (permissions) => {
    const errors = []
    
    Object.entries(permissions).forEach(([resourceName, actions]) => {
      const resource = getResource(resourceName)
      
      if (!resource) {
        errors.push(`Unknown resource: ${resourceName}`)
        return
      }
      
      if (!Array.isArray(actions)) {
        errors.push(`Actions for ${resourceName} must be an array`)
        return
      }
      
      actions.forEach(actionName => {
        const action = resource.actions.find(a => a.name === actionName)
        if (!action) {
          errors.push(`Unknown action "${actionName}" for resource "${resourceName}"`)
        }
      })
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Generate default permissions based on role type
  const generateDefaultPermissions = (roleType) => {
    const defaults = {}
    
    switch (roleType?.toLowerCase()) {
      case 'admin':
        // Admin gets all permissions for all resources
        PERMISSION_RESOURCES.forEach(resource => {
          defaults[resource.name] = resource.actions.map(action => action.name)
        })
        break
        
      case 'manager':
        // Manager gets most permissions except critical ones
        PERMISSION_RESOURCES.forEach(resource => {
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
        PERMISSION_RESOURCES.forEach(resource => {
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
        PERMISSION_RESOURCES.forEach(resource => {
          const readActions = resource.actions
            .filter(action => action.name === 'read')
            .map(action => action.name)
          if (readActions.length > 0) {
            defaults[resource.name] = readActions
          }
        })
        break
        
      default:
        // Custom role - start with basic read permissions
        PERMISSION_RESOURCES.forEach(resource => {
          if (['customers', 'contracts', 'events'].includes(resource.name)) {
            defaults[resource.name] = ['read']
          }
        })
    }
    
    return defaults
  }

  // Get permission summary statistics
  const getPermissionStats = (permissions) => {
    const stats = {
      totalResources: Object.keys(permissions).length,
      totalActions: Object.values(permissions).flat().length,
      resourceBreakdown: {},
      riskBreakdown: { low: 0, medium: 0, high: 0, critical: 0 }
    }

    // Calculate resource breakdown
    Object.entries(permissions).forEach(([resourceName, actions]) => {
      const resource = getResource(resourceName)
      if (resource) {
        stats.resourceBreakdown[resource.category] = 
          (stats.resourceBreakdown[resource.category] || 0) + actions.length
        
        // Calculate risk breakdown
        actions.forEach(actionName => {
          const action = resource.actions.find(a => a.name === actionName)
          const risk = action?.risk || 'low'
          stats.riskBreakdown[risk]++
        })
      }
    })

    return stats
  }

  // Clone permissions with modifications
  const clonePermissions = (basePermissions, modifications = {}) => {
    const cloned = JSON.parse(JSON.stringify(basePermissions))
    
    Object.entries(modifications).forEach(([resource, actions]) => {
      if (actions === null) {
        delete cloned[resource]
      } else if (Array.isArray(actions)) {
        cloned[resource] = actions
      }
    })
    
    return cloned
  }

  // Get permissions organized by category for display
  const getPermissionsByCategory = (permissions) => {
    const organized = {}
    
    Object.keys(PERMISSION_CATEGORIES).forEach(categoryKey => {
      organized[categoryKey] = {
        ...PERMISSION_CATEGORIES[categoryKey],
        resources: []
      }
    })

    Object.entries(permissions).forEach(([resourceName, actions]) => {
      const resource = getResource(resourceName)
      if (resource) {
        organized[resource.category].resources.push({
          ...resource,
          userActions: actions
        })
      }
    })

    return organized
  }

  // Check if permissions match a role type pattern
  const matchesRoleType = (permissions) => {
    const adminDefaults = generateDefaultPermissions('admin')
    const managerDefaults = generateDefaultPermissions('manager')
    const operatorDefaults = generateDefaultPermissions('operator')
    const viewerDefaults = generateDefaultPermissions('viewer')

    const permissionsString = JSON.stringify(permissions)
    
    if (JSON.stringify(adminDefaults) === permissionsString) return 'admin'
    if (JSON.stringify(managerDefaults) === permissionsString) return 'manager'
    if (JSON.stringify(operatorDefaults) === permissionsString) return 'operator'
    if (JSON.stringify(viewerDefaults) === permissionsString) return 'viewer'
    
    return 'custom'
  }

  return {
    // Resource getters
    getAllResources,
    getResourcesByCategory,
    getCategories,
    getAPIKeyResources,
    getRoleManagementResources,
    getResource,
    
    // Permission checking
    hasPermission,
    getUserResourcePermissions,
    getAllUserPermissions,
    getActionRisk,
    
    // Utilities
    formatPermissionsForDisplay,
    validatePermissions,
    generateDefaultPermissions,
    getPermissionStats,
    clonePermissions,
    getPermissionsByCategory,
    matchesRoleType
  }
}

/**
 * Updated useAPIKeyPermissions function with validation
 * Replace the existing function with this version
 */
export function useAPIKeyPermissions() {
  const { getAPIKeyResources } = usePermissions()

  // Get the full resource list for API keys
  const availableResources = ref(getAPIKeyResources())

  // Helper methods for form handling
  const hasPermission = (permissions, resource, action) => {
    if (!permissions || typeof permissions !== 'object') {
      return false
    }
    
    const resourcePerms = permissions[resource]
    if (!resourcePerms) {
      return false
    }

    if (Array.isArray(resourcePerms)) {
      return resourcePerms.includes(action)
    }

    return resourcePerms === action || resourcePerms === true
  }

  const togglePermission = (permissions, resource, action, checked) => {
    if (!permissions[resource]) {
      permissions[resource] = []
    }

    if (Array.isArray(permissions[resource])) {
      const index = permissions[resource].indexOf(action)
      if (checked && index === -1) {
        permissions[resource].push(action)
      } else if (!checked && index > -1) {
        permissions[resource].splice(index, 1)
      }

      // Clean up empty arrays
      if (permissions[resource].length === 0) {
        delete permissions[resource]
      }
    } else {
      // Handle non-array format
      if (checked) {
        permissions[resource] = [action]
      } else {
        delete permissions[resource]
      }
    }
  }

  const clearAllPermissions = (permissions) => {
    Object.keys(permissions).forEach(key => delete permissions[key])
  }

  const setAllPermissions = (permissions) => {
    availableResources.value.forEach(resource => {
      permissions[resource.name] = resource.actions.map(action => action.name)
    })
  }

  const hasAllPermissions = (permissions) => {
    return availableResources.value.every(resource =>
      resource.actions.every(action =>
        permissions[resource.name]?.includes(action.name)
      )
    )
  }

  // Add validation helper that matches the FormModal expectations
  const validatePermissions = (permissions) => {
    const errors = []

    if (!permissions || typeof permissions !== 'object') {
      errors.push('Permissions must be an object')
      return { isValid: false, errors }
    }

    const hasAnyPermission = Object.keys(permissions).some(resource => {
      const actions = permissions[resource]
      return Array.isArray(actions) ? actions.length > 0 : !!actions
    })

    if (!hasAnyPermission) {
      errors.push('At least one permission must be selected')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  return {
    availableResources,
    hasPermission,
    togglePermission,
    clearAllPermissions,
    setAllPermissions,
    hasAllPermissions,
    validatePermissions
  }
}

/**
 * Hook for role management permissions
 */
export function useRolePermissions() {
  const { 
    getRoleManagementResources, 
    generateDefaultPermissions, 
    validatePermissions,
    getResourcesByCategory,
    getCategories,
    getResource,
    matchesRoleType
  } = usePermissions()
  
  const availableResources = ref(getRoleManagementResources())
  const categories = ref(getCategories())
  
  // Helper methods for role forms
  const createRoleWithDefaults = (roleType) => {
    return {
      name: '',
      description: '',
      permissions: generateDefaultPermissions(roleType),
      active: true
    }
  }
  
  const validateRoleData = (roleData) => {
    const errors = []
    
    if (!roleData.name || roleData.name.trim() === '') {
      errors.push('Role name is required')
    }
    
    if (roleData.name && roleData.name.length < 2) {
      errors.push('Role name must be at least 2 characters')
    }
    
    if (!roleData.permissions || Object.keys(roleData.permissions).length === 0) {
      errors.push('At least one permission is required')
    }
    
    if (roleData.permissions) {
      const permissionValidation = validatePermissions(roleData.permissions)
      if (!permissionValidation.isValid) {
        errors.push(...permissionValidation.errors)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Permission manipulation helpers
  const hasPermission = (permissions, resource, action) => {
    return permissions[resource]?.includes(action) || false
  }
  
  const togglePermission = (permissions, resource, action, checked) => {
    if (!permissions[resource]) {
      permissions[resource] = []
    }

    if (checked) {
      if (!permissions[resource].includes(action)) {
        permissions[resource].push(action)
      }
    } else {
      permissions[resource] = permissions[resource].filter(a => a !== action)
      if (permissions[resource].length === 0) {
        delete permissions[resource]
      }
    }
  }

  const toggleResourcePermissions = (permissions, resourceName) => {
    const resource = getResource(resourceName)
    if (!resource) return

    const hasAll = resource.actions.every(action => 
      permissions[resourceName]?.includes(action.name)
    )

    if (hasAll) {
      delete permissions[resourceName]
    } else {
      permissions[resourceName] = resource.actions.map(action => action.name)
    }
  }

  const setCategoryPermissions = (permissions, categoryKey, enabled) => {
    const categoryResources = getResourcesByCategory(categoryKey)
    
    categoryResources.forEach(resource => {
      if (enabled) {
        permissions[resource.name] = resource.actions.map(action => action.name)
      } else {
        delete permissions[resource.name]
      }
    })
  }

  const hasAllCategoryPermissions = (permissions, categoryKey) => {
    const categoryResources = getResourcesByCategory(categoryKey)
    
    return categoryResources.every(resource =>
      resource.actions.every(action =>
        permissions[resource.name]?.includes(action.name)
      )
    )
  }

  const setAllPermissions = (permissions) => {
    availableResources.value.forEach(resource => {
      permissions[resource.name] = resource.actions.map(action => action.name)
    })
  }

  const clearAllPermissions = (permissions) => {
    Object.keys(permissions).forEach(key => delete permissions[key])
  }
  
  return {
    availableResources,
    categories,
    createRoleWithDefaults,
    validateRoleData,
    generateDefaultPermissions,
    getResourcesByCategory,
    matchesRoleType,
    
    // Permission manipulation
    hasPermission,
    togglePermission,
    toggleResourcePermissions,
    setCategoryPermissions,
    hasAllCategoryPermissions,
    setAllPermissions,
    clearAllPermissions
  }
}

// Export the raw configuration for direct access if needed
export { PERMISSION_RESOURCES, PERMISSION_CATEGORIES }

export default usePermissions
