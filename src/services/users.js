// src/services/users.js
// User management service following the consolidated service pattern

import api from './api'
import { errorHandlers, logError, createRetryHandler } from '@/utils/errorHandling'

/**
 * User service following the standard service pattern from roles.js
 * Handles all user-related API operations with consistent error handling
 */
export const userService = {
  /**
   * Get all users with optional filtering
   * @param {Object} params - Query parameters for filtering/pagination
   * @returns {Promise<Array>} Array of user objects
   */
  async getAll(params = {}) {
    const operation = async () => {
      const response = await api.get('/auth/users', { params })
      return Array.isArray(response.data) ? response.data : []
    }

    try {
      return await createRetryHandler(operation, 2)()
    } catch (error) {
      logError(error, 'userService.getAll', { params })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: 'Failed to load users'
      }))
    }
  },

  /**
   * Get a single user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getById(userId) {
    try {
      const response = await api.get(`/auth/users/${userId}`)
      return response.data
    } catch (error) {
      logError(error, 'userService.getById', { userId })
      throw new Error(errorHandlers.fetch(error, {
        fallbackMessage: `Failed to load user ${userId}`
      }))
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    try {
      // Clean and validate data
      const cleanedData = userUtils.cleanUserData(userData)

      const response = await api.post('/auth/users', cleanedData)
      return response.data
    } catch (error) {
      logError(error, 'userService.create', {
        userData: { ...userData, password: userData.password ? '[REDACTED]' : undefined }
      })
      throw new Error(errorHandlers.create(error, {
        fallbackMessage: 'Failed to create user'
      }))
    }
  },

  /**
   * Update an existing user
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user object
   */
  async update(userId, userData) {
    try {
      // Clean and validate data
      const cleanedData = userUtils.cleanUserData(userData)

      const response = await api.put(`/auth/users/${userId}`, cleanedData)
      return response.data
    } catch (error) {
      logError(error, 'userService.update', { userId, userData })
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: `Failed to update user ${userId}`
      }))
    }
  },

  /**
   * Delete a user permanently
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(userId) {
    try {
      const response = await api.delete(`/auth/users/${userId}/permanent`)
      return response.data
    } catch (error) {
      logError(error, 'userService.delete', { userId })
      throw new Error(errorHandlers.delete(error, {
        fallbackMessage: `Failed to delete user ${userId}`
      }))
    }
  },

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(userId, passwordData) {
    try {
      const response = await api.put(`/auth/users/${userId}/password`, passwordData)
      return response.data
    } catch (error) {
      logError(error, 'userService.changePassword', { userId })
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: `Failed to change password for user ${userId}`
      }))
    }
  },

  /**
   * Toggle user active status
   * @param {number} userId - User ID
   * @param {boolean} active - New active status
   * @returns {Promise<Object>} Updated user object
   */
  async toggleStatus(userId, active) {
    try {
      const response = await api.put(`/auth/users/${userId}`, { active })
      return response.data
    } catch (error) {
      logError(error, 'userService.toggleStatus', { userId, active })
      const action = active ? 'activate' : 'deactivate'
      throw new Error(errorHandlers.update(error, {
        fallbackMessage: `Failed to ${action} user ${userId}`
      }))
    }
  },

  /**
   * Get user statistics - Enhanced error handling for 404
   * @returns {Promise<Object>} User statistics
   */
  async getStats() {
    try {
      const response = await api.get('/auth/users/stats')
      return response.data
    } catch (error) {
      // Only log 404 as info, not error since it's expected if endpoint doesn't exist
      if (error.response?.status === 404) {
        console.info('User stats endpoint not available, will generate stats from user data')
        return null // Return null to indicate fallback should be used
      }

      // Log other errors normally
      logError(error, 'userService.getStats')
      return null // Still return null to allow fallback
    }
  }
}

/**
 * User utility functions following the consolidated pattern from roles.js
 */
export const userUtils = {
  /**
   * Clean and format user data for API submission
   * @param {Object} userData - Raw user data from form
   * @returns {Object} Cleaned user data
   */
  cleanUserData(userData) {
    const cleaned = {
      username: userData.username?.trim(),
      email: userData.email?.trim(),
      first_name: userData.first_name?.trim() || null,
      last_name: userData.last_name?.trim() || null,
      role_id: parseInt(userData.role_id),
      active: Boolean(userData.active)
    }

    // Only include password if it's provided
    if (userData.password?.trim()) {
      cleaned.password = userData.password.trim()
    }

    return cleaned
  },

  /**
   * Get user display name from user object
   * @param {Object} user - User object
   * @returns {string} Display name
   */
  getDisplayName(user) {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user.username || 'Unknown User'
  },

  /**
   * Get user initials for avatar
   * @param {Object} user - User object
   * @returns {string} User initials
   */
  getInitials(user) {
    if (user.first_name || user.last_name) {
      const first = user.first_name?.[0] || ''
      const last = user.last_name?.[0] || ''
      return (first + last).toUpperCase() || 'U'
    }
    return user.username?.[0]?.toUpperCase() || 'U'
  },

  /**
   * Check if user is a protected system user
   * @param {Object} user - User object
   * @returns {boolean} True if system user
   */
  isSystemUser(user) {
    return ['admin', 'system'].includes(user.username?.toLowerCase())
  },

  /**
   * Get role badge CSS class
   * @param {Object} role - Role object
   * @returns {string} CSS class
   */
  getRoleBadgeClass(role) {
    if (!role) return 'bg-gray-100 text-gray-800'

    const roleColorMap = {
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'operator': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    }

    return roleColorMap[role.name] || 'bg-indigo-100 text-indigo-800'
  },

  /**
   * Get status badge CSS class
   * @param {boolean} isActive - User active status
   * @returns {string} CSS class
   */
  getStatusBadgeClass(isActive) {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  },

  /**
   * Format error message for user operations (now uses centralized error handling)
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    return errorHandlers.user(error)
  },

  /**
   * Generate user stats from user array (fallback if API doesn't provide stats)
   * @param {Array} users - Array of users
   * @returns {Object} User statistics
   */
  generateStats(users) {
    if (!Array.isArray(users)) {
      return { total: 0, active: 0, inactive: 0, recent: 0 }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    return {
      total: users.length,
      active: users.filter(user => user.active).length,
      inactive: users.filter(user => !user.active).length,
      recent: users.filter(user => {
        if (!user.created_at) return false
        return new Date(user.created_at) >= thirtyDaysAgo
      }).length
    }
  },

  /**
   * Validate user data before submission
   * @param {Object} userData - User data to validate
   * @param {boolean} isEditing - Whether this is an edit operation
   * @returns {Object} Validation result with isValid and errors
   */
  validateUserData(userData, isEditing = false) {
    const errors = []

    // Username validation
    if (!userData.username || userData.username.trim() === '') {
      errors.push('Username is required')
    } else if (userData.username.length < 3) {
      errors.push('Username must be at least 3 characters')
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.push('Username can only contain letters, numbers, and underscores')
    }

    // Email validation
    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Please enter a valid email address')
    }

    // Role validation
    if (!userData.role_id) {
      errors.push('Role is required')
    }

    // Name validation (optional but if provided, should be reasonable)
    if (userData.first_name && userData.first_name.length > 100) {
      errors.push('First name is too long')
    }
    if (userData.last_name && userData.last_name.length > 100) {
      errors.push('Last name is too long')
    }

    // Password validation for new users
    if (!isEditing && userData.password) {
      if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Format user for display in tables
   * @param {Object} user - User object
   * @returns {Object} Formatted user object
   */
  formatForTable(user) {
    return {
      ...user,
      displayName: this.getDisplayName(user),
      initials: this.getInitials(user),
      statusBadgeClass: this.getStatusBadgeClass(user.active),
      roleBadgeClass: this.getRoleBadgeClass(user.role),
      isProtected: this.isSystemUser(user)
    }
  },

  /**
   * Search/filter users client-side
   * @param {Array} users - Array of users
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered users
   */
  filterUsers(users, searchTerm, filters = {}) {
    if (!Array.isArray(users)) return []

    let filtered = [...users]

    // Apply search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(user => {
        const searchableText = [
          user.username,
          user.email,
          user.first_name,
          user.last_name,
          user.role?.name,
          this.getDisplayName(user)
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(term)
      })
    }

    // Apply filters
    if (filters.active !== undefined) {
      filtered = filtered.filter(user => user.active === filters.active)
    }

    if (filters.role_id) {
      filtered = filtered.filter(user => user.role_id === filters.role_id)
    }

    if (filters.created_after) {
      const afterDate = new Date(filters.created_after)
      filtered = filtered.filter(user => new Date(user.created_at) >= afterDate)
    }

    return filtered
  }
}

export default userService
