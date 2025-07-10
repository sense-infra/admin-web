// src/services/roles.js
// Enhanced role management service following the consolidated service pattern

import api from './api'
import { formatDate } from '@/utils/formatters'
import { errorHandlers, logError, createRetryHandler } from '@/utils/errorHandling'

/**
 * Role service following the standard service pattern with enhanced functionality
 * Includes user reassignment capabilities for role deletion
 */
export const rolesService = {
  /**
   * Get all roles with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Array>} Array of role objects
   */
  async getAll(params = {}) {
    const operation = async () => {
      const response = await api.get('/auth/roles', { params })
      return Array.isArray(response.data) ? response.data : []
    }

    try {
      return await createRetryHandler(operation, 2)()
    } catch (error) {
      logError(error, 'rolesService.getAll', { params })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: 'Failed to load roles'
      }))
    }
  },

  /**
   * Get a single role by ID
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getById(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}`)
      return response.data
    } catch (error) {
      logError(error, 'rolesService.getById', { roleId })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: `Failed to load role ${roleId}`
      }))
    }
  },

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role object
   */
  async create(roleData) {
    try {
      // Clean and validate data
      const cleanedData = roleUtils.cleanRoleData(roleData)

      const response = await api.post('/auth/roles', cleanedData)
      return response.data
    } catch (error) {
      logError(error, 'rolesService.create', { roleData })
      throw new Error(errorHandlers.create(error, {
        fallbackMessage: 'Failed to create role'
      }))
    }
  },

  /**
   * Update an existing role
   * @param {number} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @returns {Promise<Object>} Updated role object
   */
  async update(roleId, roleData) {
    try {
      // Clean and validate data
      const cleanedData = roleUtils.cleanRoleData(roleData)

      const response = await api.put(`/auth/roles/${roleId}`, cleanedData)
      return response.data
    } catch (error) {
      logError(error, 'rolesService.update', { roleId, roleData })
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: `Failed to update role ${roleId}`
      }))
    }
  },

  /**
   * Delete a role permanently
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(roleId) {
    try {
      const response = await api.delete(`/auth/roles/${roleId}`)
      return response.data
    } catch (error) {
      logError(error, 'rolesService.delete', { roleId })
      throw new Error(errorHandlers.delete(error, {
        fallbackMessage: `Failed to delete role ${roleId}`
      }))
    }
  },

  /**
   * Toggle role active status
   * @param {number} roleId - Role ID
   * @param {boolean} active - New active status
   * @returns {Promise<Object>} Updated role object
   */
  async toggleStatus(roleId, active) {
    try {
      const response = await api.put(`/auth/roles/${roleId}`, { active })
      return response.data
    } catch (error) {
      logError(error, 'rolesService.toggleStatus', { roleId, active })
      const action = active ? 'activate' : 'deactivate'
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: `Failed to ${action} role ${roleId}`
      }))
    }
  },

  /**
   * Get role usage information including assigned users
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Role usage information
   */
  async getUsage(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}/usage`)
      return response.data
    } catch (error) {
      logError(error, 'rolesService.getUsage', { roleId })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: `Failed to fetch role usage for role ${roleId}`
      }))
    }
  },

  /**
   * Get users assigned to a specific role
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} Array of user objects
   */
  async getRoleUsers(roleId) {
    try {
      const response = await api.get(`/auth/roles/${roleId}/users`)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      logError(error, 'rolesService.getRoleUsers', { roleId })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: `Failed to fetch users for role ${roleId}`
      }))
    }
  },

  /**
   * Reassign users from one role to another
   * @param {number} fromRoleId - Source role ID
   * @param {number} toRoleId - Target role ID
   * @returns {Promise<Object>} Reassignment result
   */
  async reassignUsers(fromRoleId, toRoleId) {
    try {
      const response = await api.post(`/auth/roles/${fromRoleId}/reassign`, {
        new_role_id: toRoleId
      })
      return response.data
    } catch (error) {
      logError(error, 'rolesService.reassignUsers', { fromRoleId, toRoleId })
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: 'Failed to reassign users to new role'
      }))
    }
  },

  /**
   * Get role statistics - Enhanced error handling for 404
   * @returns {Promise<Object>} Role statistics
   */
  async getStats() {
    try {
      const response = await api.get('/auth/roles/stats')
      return response.data
    } catch (error) {
      // Only log 404 as info, not error since it's expected if endpoint doesn't exist
      if (error.response?.status === 404) {
        console.info('Role stats endpoint not available, will generate stats from role data')
        return null // Return null to indicate fallback should be used
      }

      // Log other errors normally
      logError(error, 'rolesService.getStats')
      return null // Still return null to allow fallback
    }
  }
}

/**
 * Enhanced role utility functions following the consolidated pattern
 */
export const roleUtils = {
  /**
   * Clean and format role data for API submission
   * @param {Object} roleData - Raw role data from form
   * @returns {Object} Cleaned role data
   */
  cleanRoleData(roleData) {
    const cleaned = {
      name: roleData.name?.trim(),
      description: roleData.description?.trim() || null,
      permissions: roleData.permissions || {},
      active: Boolean(roleData.active)
    }

    // Ensure permissions is an object
    if (typeof cleaned.permissions === 'string') {
      try {
        cleaned.permissions = JSON.parse(cleaned.permissions)
      } catch (e) {
        console.warn('Invalid permissions JSON string, using empty object')
        cleaned.permissions = {}
      }
    }

    return cleaned
  },

  /**
   * Generate role stats from roles array (fallback if API doesn't provide stats)
   * @param {Array} roles - Array of roles
   * @returns {Object} Role statistics
   */
  generateStats(roles) {
    if (!Array.isArray(roles)) {
      return { total: 0, active: 0, inactive: 0, system: 0 }
    }

    return {
      total: roles.length,
      active: roles.filter(role => role.active).length,
      inactive: roles.filter(role => !role.active).length,
      system: roles.filter(role => this.isSystemRole(role)).length
    }
  },

  /**
   * Check if role is a protected system role
   * @param {Object} role - Role object
   * @returns {boolean} True if system role
   */
  isSystemRole(role) {
    // System roles are typically identified by name or a system flag
    const systemRoleNames = ['admin', 'viewer', 'system']
    return systemRoleNames.includes(role?.name?.toLowerCase()) || 
           role?.is_system === true ||
           role?.system === true
  },

  /**
   * Get status badge CSS class
   * @param {boolean} isActive - Role active status
   * @returns {string} CSS class
   */
  getStatusBadgeClass(isActive) {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  },

  /**
   * Get resource label for display (using centralized permissions if available)
   * @param {string} resourceName - Resource name
   * @returns {string} Display label
   */
  getResourceLabel(resourceName) {
    // This mapping should ideally come from your centralized permissions
    const labels = {
      users: 'Users',
      roles: 'Roles',
      customers: 'Customers',
      contracts: 'Contracts',
      service_tiers: 'Service Tiers',
      controllers: 'Controllers',
      cameras: 'Cameras',
      nvrs: 'NVRs',
      events: 'Events',
      api_keys: 'API Keys',
      rf_monitoring: 'RF Monitoring',
      system_config: 'System Config',
      logs: 'Logs',
      diagnostics: 'Diagnostics'
    }
    return labels[resourceName] || resourceName
  },

  /**
   * Count total permissions for a role
   * @param {Object} role - Role object
   * @returns {number} Total permission count
   */
  countPermissions(role) {
    if (!role?.permissions || typeof role.permissions !== 'object') return 0
    
    return Object.values(role.permissions).reduce((total, actions) => {
      if (Array.isArray(actions)) {
        return total + actions.length
      }
      return total + 1 // Single action as string
    }, 0)
  },

  /**
   * Format error message for role operations
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    return errorHandlers.role(error)
  },

  /**
   * Validate role data before submission
   * @param {Object} roleData - Role data to validate
   * @param {boolean} isEditing - Whether this is an edit operation
   * @returns {Object} Validation result with isValid and errors
   */
  validateRoleData(roleData, isEditing = false) {
    const errors = []

    // Name validation
    if (!roleData.name || roleData.name.trim() === '') {
      errors.push('Role name is required')
    } else if (roleData.name.length < 2) {
      errors.push('Role name must be at least 2 characters')
    } else if (roleData.name.length > 50) {
      errors.push('Role name must be less than 50 characters')
    }

    // Description validation
    if (roleData.description && roleData.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    // Permissions validation
    if (!roleData.permissions || Object.keys(roleData.permissions).length === 0) {
      errors.push('At least one permission is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Clone role data for duplication
   * @param {Object} originalRole - Original role object
   * @returns {Object} Cloned role data
   */
  cloneRole(originalRole) {
    return {
      name: `${originalRole.name} Copy`,
      description: originalRole.description || '',
      permissions: originalRole.permissions ? { ...originalRole.permissions } : {},
      active: true
    }
  },

  /**
   * Format role for display in tables
   * @param {Object} role - Role object
   * @returns {Object} Formatted role object
   */
  formatForTable(role) {
    return {
      ...role,
      statusBadgeClass: this.getStatusBadgeClass(role.active),
      isProtected: this.isSystemRole(role),
      permissionCount: this.countPermissions(role),
      displayType: this.isSystemRole(role) ? 'System Role' : 'Custom Role'
    }
  },

  /**
   * Search/filter roles client-side
   * @param {Array} roles - Array of roles
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered roles
   */
  filterRoles(roles, searchTerm, filters = {}) {
    if (!Array.isArray(roles)) return []

    let filtered = [...roles]

    // Apply search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(role => {
        const searchableText = [
          role.name,
          role.description,
          this.isSystemRole(role) ? 'system' : 'custom'
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(term)
      })
    }

    // Apply filters
    if (filters.active !== undefined) {
      filtered = filtered.filter(role => role.active === filters.active)
    }

    if (filters.isSystem !== undefined) {
      filtered = filtered.filter(role => this.isSystemRole(role) === filters.isSystem)
    }

    if (filters.hasUsers !== undefined) {
      if (filters.hasUsers) {
        filtered = filtered.filter(role => (role.user_count || 0) > 0)
      } else {
        filtered = filtered.filter(role => (role.user_count || 0) === 0)
      }
    }

    return filtered
  },

  /**
   * Check if role can be safely deleted
   * @param {Object} role - Role object
   * @param {Object} usage - Role usage data
   * @returns {Object} Deletion eligibility result
   */
  canDelete(role, usage) {
    const checks = {
      isSystemRole: this.isSystemRole(role),
      hasActiveUsers: (usage?.active_user_count || 0) > 0,
      hasAnyUsers: (usage?.total_user_count || 0) > 0
    }

    const canDelete = !checks.isSystemRole && !checks.hasActiveUsers
    const reasons = []

    if (checks.isSystemRole) {
      reasons.push('System roles cannot be deleted')
    }
    if (checks.hasActiveUsers) {
      reasons.push(`Role has ${usage.active_user_count} active user(s) assigned`)
    }

    return {
      canDelete,
      reasons,
      checks,
      requiresReassignment: checks.hasActiveUsers && !checks.isSystemRole
    }
  }
}

export default rolesService
