// src/services/users.js
// User management service following the consolidated service pattern

import api from './api'

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
    try {
      console.log('🔄 userService: Fetching users with params:', params)
      const response = await api.get('/auth/users', { params })
      const users = Array.isArray(response.data) ? response.data : []
      console.log('✅ userService: Users loaded successfully:', users.length)
      return users
    } catch (error) {
      console.error('❌ userService: Failed to fetch users:', error)
      throw error
    }
  },

  /**
   * Get a single user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getById(userId) {
    try {
      console.log('🔄 userService: Fetching user:', userId)
      const response = await api.get(`/auth/users/${userId}`)
      console.log('✅ userService: User loaded successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to fetch user:', error)
      throw error
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    try {
      console.log('🔄 userService: Creating user:', userData.username)
      
      // Clean and validate data
      const cleanedData = userUtils.cleanUserData(userData)
      
      const response = await api.post('/auth/users', cleanedData)
      console.log('✅ userService: User created successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to create user:', error)
      throw error
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
      console.log('🔄 userService: Updating user:', userId)
      
      // Clean and validate data
      const cleanedData = userUtils.cleanUserData(userData)
      
      const response = await api.put(`/auth/users/${userId}`, cleanedData)
      console.log('✅ userService: User updated successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to update user:', error)
      throw error
    }
  },

  /**
   * Delete a user permanently
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(userId) {
    try {
      console.log('🔄 userService: Deleting user:', userId)
      const response = await api.delete(`/auth/users/${userId}/permanent`)
      console.log('✅ userService: User deleted successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to delete user:', error)
      throw error
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
      console.log('🔄 userService: Changing password for user:', userId)
      const response = await api.put(`/auth/users/${userId}/password`, passwordData)
      console.log('✅ userService: Password changed successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to change password:', error)
      throw error
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
      console.log('🔄 userService: Toggling user status:', userId, 'to', active)
      const response = await api.put(`/auth/users/${userId}`, { active })
      console.log('✅ userService: User status updated successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to toggle user status:', error)
      throw error
    }
  },

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStats() {
    try {
      console.log('🔄 userService: Fetching user statistics')
      const response = await api.get('/auth/users/stats')
      console.log('✅ userService: Statistics loaded successfully')
      return response.data
    } catch (error) {
      console.error('❌ userService: Failed to fetch statistics:', error)
      // Return default stats if API doesn't support it
      return {
        total: 0,
        active: 0,
        inactive: 0,
        recent: 0
      }
    }
  }
}

/**
 * User utility functions following the consolidated pattern
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
   * Format error message for user operations
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    if (error.response?.data) {
      const errorData = error.response.data

      if (errorData.detail) return errorData.detail
      if (errorData.message) return errorData.message
      if (errorData.error) return errorData.error
      if (typeof errorData === 'string') return errorData
    }

    return error.message || 'An unexpected error occurred'
  },

  /**
   * Generate user stats from user array (fallback if API doesn't provide stats)
   * @param {Array} users - Array of users
   * @returns {Object} User statistics
   */
  generateStats(users) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    return {
      total: users.length,
      active: users.filter(user => user.active).length,
      inactive: users.filter(user => !user.active).length,
      recent: users.filter(user => 
        new Date(user.created_at) >= thirtyDaysAgo
      ).length
    }
  }
}

export default userService
