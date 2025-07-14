// src/services/apiKeys.js - Complete updated version with bug fixes and improvements
import api from './api'
import { errorHandlers, logError, createRetryHandler } from '@/utils/errorHandling'

/**
 * API Key service following the consolidated service pattern
 * Handles all API key-related operations with consistent error handling
 */
export const apiKeyService = {
  apiKeys: {
    /**
     * Get all API keys with optional filtering
     * @param {Object} params - Query parameters for filtering/pagination
     * @returns {Promise<Array>} Array of API key objects
     */
    async getAll(params = {}) {
      const operation = async () => {
        const response = await api.get('/auth/api-keys', { params })
        return Array.isArray(response.data) ? response.data : []
      }

      try {
        return await createRetryHandler(operation, 2)()
      } catch (error) {
        logError(error, 'apiKeyService.getAll', { params })
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: 'Failed to load API keys'
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Get API key by ID
     * @param {number} id - API key ID
     * @returns {Promise<Object>} API key object
     */
    async getById(id) {
      try {
        const response = await api.get(`/auth/api-keys/${id}`)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.getById', { id })
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: `Failed to load API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Create new API key
     * @param {Object} keyData - API key data
     * @returns {Promise<Object>} Created API key object with plain key
     */
    async create(keyData) {
      try {
        // Clean and validate data
        const cleanedData = apiKeyUtils.cleanAPIKeyData(keyData)

        const response = await api.post('/auth/api-keys', cleanedData)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.create', { keyData })
        throw new Error(errorHandlers.create ? errorHandlers.create(error, {
          fallbackMessage: 'Failed to create API key'
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Update API key
     * @param {number} id - API key ID
     * @param {Object} keyData - Updated API key data
     * @returns {Promise<Object>} Updated API key object
     */
    async update(id, keyData) {
      try {
        // Clean and validate data
        const cleanedData = apiKeyUtils.cleanAPIKeyData(keyData)

        const response = await api.put(`/auth/api-keys/${id}`, cleanedData)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.update', { id, keyData })
        throw new Error(errorHandlers.update ? errorHandlers.update(error, {
          fallbackMessage: `Failed to update API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Delete API key permanently
     * @param {number} id - API key ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(id) {
      try {
        const response = await api.delete(`/auth/api-keys/${id}`)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.delete', { id })
        throw new Error(errorHandlers.delete ? errorHandlers.delete(error, {
          fallbackMessage: `Failed to delete API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Deactivate API key (alternative to delete)
     * @param {number} id - API key ID
     * @returns {Promise<Object>} Deactivation result
     */
    async deactivate(id) {
      try {
        const response = await api.post(`/auth/api-keys/${id}/deactivate`)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.deactivate', { id })
        throw new Error(errorHandlers.update ? errorHandlers.update(error, {
          fallbackMessage: `Failed to deactivate API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Get API key usage statistics - IMPROVED WITH BUG FIX
     * @param {number} id - API key ID
     * @param {Object} params - Additional parameters (date range, etc.)
     * @returns {Promise<Object>} Usage statistics
     */
    async getUsage(id, params = {}) {
      try {
        const response = await api.get(`/auth/api-keys/${id}/usage`, { params })
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.getUsage', { id, params })
        
        // Don't throw for 404 - just return null to allow fallback
        if (error.response?.status === 404) {
          console.info('Usage endpoint not available for API key', id)
          return null
        }
        
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: `Failed to load usage for API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Get API key statistics
     * @returns {Promise<Object>} API key statistics
     */
    async getStats() {
      try {
        const response = await api.get('/auth/api-keys/stats')
        return response.data
      } catch (error) {
        // Only log 404 as info, not error since it's expected if endpoint doesn't exist
        if (error.response?.status === 404) {
          console.info('API key stats endpoint not available, will generate stats from data')
          return null
        }

        logError && logError(error, 'apiKeyService.getStats')
        return null // Still return null to allow fallback
      }
    }
  },

  // Rate Limit Management - matching your backend routes
  rateLimits: {
    /**
     * Get all API key rate limit status
     * @returns {Promise<Array>} Rate limit status for all keys
     */
    async getStatus() {
      try {
        const response = await api.get('/admin/rate-limits/status')
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.rateLimits.getStatus')
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: 'Failed to load rate limit status'
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Get rate limiting metrics
     * @returns {Promise<Object>} Rate limiting metrics
     */
    async getMetrics() {
      try {
        const response = await api.get('/admin/rate-limits/metrics')
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.rateLimits.getMetrics')
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: 'Failed to load rate limiting metrics'
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Get specific API key rate limit status
     * @param {number} id - API key ID
     * @returns {Promise<Object>} Rate limit status for specific key
     */
    async getApiKeyStatus(id) {
      try {
        const response = await api.get(`/admin/rate-limits/${id}`)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.rateLimits.getApiKeyStatus', { id })
        throw new Error(errorHandlers.fetch ? errorHandlers.fetch(error, {
          fallbackMessage: `Failed to load rate limit status for API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    },

    /**
     * Reset API key rate limit
     * @param {number} id - API key ID
     * @returns {Promise<Object>} Reset result
     */
    async resetApiKeyLimit(id) {
      try {
        const response = await api.post(`/admin/rate-limits/${id}/reset`)
        return response.data
      } catch (error) {
        logError && logError(error, 'apiKeyService.rateLimits.resetApiKeyLimit', { id })
        throw new Error(errorHandlers.update ? errorHandlers.update(error, {
          fallbackMessage: `Failed to reset rate limit for API key ${id}`
        }) : apiKeyUtils.formatError(error))
      }
    }
  }
}

/**
 * API Key utility functions following the consolidated pattern
 * ENHANCED WITH BUG FIXES AND NEW UTILITIES
 */
export const apiKeyUtils = {
  /**
   * Clean and format API key data for API submission
   * @param {Object} keyData - Raw API key data from form
   * @returns {Object} Cleaned API key data
   */
  cleanAPIKeyData(keyData) {
    const cleaned = {
      key_name: keyData.key_name?.trim(),
      description: keyData.description?.trim() || null,
      rate_limit_per_hour: keyData.rate_limit_per_hour || 1000,
      permissions: keyData.permissions || {},
      expires_at: keyData.expires_at || null,
      active: keyData.active !== undefined ? keyData.active : true
    }

    // Remove empty string values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '') {
        cleaned[key] = null
      }
    })

    return cleaned
  },

  /**
   * Format error message for API key operations
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.message) {
      return error.message
    }
    return 'An unexpected error occurred'
  },

  /**
   * Check if API key is expired
   * @param {Object} apiKey - API key object
   * @returns {boolean} True if expired
   */
  isExpired(apiKey) {
    return apiKey.expires_at && new Date(apiKey.expires_at) < new Date()
  },

  /**
   * Check if API key is expiring soon (within 30 days)
   * @param {Object} apiKey - API key object
   * @returns {boolean} True if expiring soon
   */
  isExpiringSoon(apiKey) {
    if (!apiKey.expires_at) return false
    const expiryDate = new Date(apiKey.expires_at)
    const now = new Date()
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  },

  /**
   * Get API key status
   * @param {Object} apiKey - API key object
   * @returns {string} Status string
   */
  getStatus(apiKey) {
    if (this.isExpired(apiKey)) return 'Expired'
    if (!apiKey.active) return 'Inactive'
    if (this.isExpiringSoon(apiKey)) return 'Expiring Soon'
    return 'Active'
  },

  /**
   * Get status color class for display
   * @param {Object} apiKey - API key object
   * @returns {string} CSS class string
   */
  getStatusColor(apiKey) {
    const status = this.getStatus(apiKey)
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Expired':
        return 'bg-red-100 text-red-800'
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  },

  /**
   * Format numbers for display with K/M suffixes
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0'

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  },

  /**
   * Format date for display with relative time - ENHANCED WITH BUG FIXES
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    if (!dateString) return 'Never'

    try {
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString)
        return 'Invalid Date'
      }

      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMs < 0) {
        // Future date
        const futureDiffDays = Math.ceil(-diffMs / (1000 * 60 * 60 * 24))
        if (futureDiffDays === 1) {
          return 'Tomorrow'
        } else if (futureDiffDays < 7) {
          return `In ${futureDiffDays} days`
        } else {
          return date.toLocaleDateString()
        }
      }

      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString)
      return 'Invalid Date'
    }
  },

  /**
   * Generate API key stats from data array
   * @param {Array} apiKeys - Array of API keys
   * @returns {Object} API key statistics
   */
  generateStats(apiKeys) {
    if (!Array.isArray(apiKeys)) {
      return { total: 0, active: 0, expiring: 0, totalUsage: 0 }
    }

    return {
      total: apiKeys.length,
      active: apiKeys.filter(key => key.active && !this.isExpired(key)).length,
      expiring: apiKeys.filter(key => this.isExpiringSoon(key)).length,
      totalUsage: apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0)
    }
  },

  /**
   * Validate API key data before submission
   * @param {Object} keyData - API key data to validate
   * @param {boolean} isEditing - Whether this is an edit operation
   * @returns {Object} Validation result with isValid and errors
   */
  validateAPIKeyData(keyData, isEditing = false) {
    const errors = []

    // Name validation
    if (!keyData.key_name || keyData.key_name.trim() === '') {
      errors.push('API key name is required')
    } else if (keyData.key_name.length < 3) {
      errors.push('API key name must be at least 3 characters')
    } else if (keyData.key_name.length > 100) {
      errors.push('API key name is too long')
    }

    // Rate limit validation
    if (keyData.rate_limit_per_hour !== null && keyData.rate_limit_per_hour !== undefined) {
      const rateLimit = parseInt(keyData.rate_limit_per_hour)
      if (isNaN(rateLimit) || rateLimit < 1) {
        errors.push('Rate limit must be at least 1 request per hour')
      } else if (rateLimit > 10000) {
        errors.push('Rate limit cannot exceed 10,000 requests per hour')
      }
    }

    // Permissions validation
    if (!keyData.permissions || typeof keyData.permissions !== 'object') {
      errors.push('At least one permission must be selected')
    } else {
      const hasAnyPermission = Object.keys(keyData.permissions).some(resource => {
        const actions = keyData.permissions[resource]
        return Array.isArray(actions) ? actions.length > 0 : actions
      })

      if (!hasAnyPermission) {
        errors.push('At least one permission must be selected')
      }
    }

    // Expiration date validation
    if (keyData.expires_at) {
      const expiryDate = new Date(keyData.expires_at)
      const now = new Date()

      if (expiryDate <= now) {
        errors.push('Expiration date must be in the future')
      }

      // Check if expiry is more than 5 years in the future
      const fiveYearsFromNow = new Date()
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5)

      if (expiryDate > fiveYearsFromNow) {
        errors.push('Expiration date cannot be more than 5 years in the future')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Format API key for display in tables
   * @param {Object} apiKey - API key object
   * @returns {Object} Formatted API key object
   */
  formatForTable(apiKey) {
    return {
      ...apiKey,
      status_text: this.getStatus(apiKey),
      status_class: this.getStatusColor(apiKey),
      usage_formatted: this.formatNumber(apiKey.usage_count || 0),
      rate_limit_formatted: this.formatNumber(apiKey.rate_limit_per_hour || 0),
      last_used_formatted: this.formatDate(apiKey.last_used),
      created_at_formatted: this.formatDate(apiKey.created_at),
      expires_at_formatted: apiKey.expires_at ? this.formatDate(apiKey.expires_at) : null
    }
  },

  /**
   * Search/filter API keys client-side
   * @param {Array} apiKeys - Array of API keys
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered API keys
   */
  filterAPIKeys(apiKeys, searchTerm, filters = {}) {
    if (!Array.isArray(apiKeys)) return []

    let filtered = [...apiKeys]

    // Apply search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(apiKey => {
        const searchableText = [
          apiKey.key_name,
          apiKey.description,
          apiKey.key_prefix,
          apiKey.created_by_user?.username
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(term)
      })
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(apiKey => {
        const status = this.getStatus(apiKey).toLowerCase()
        return status === filters.status.toLowerCase()
      })
    }

    // Apply usage filter
    if (filters.usage === 'used') {
      filtered = filtered.filter(apiKey => apiKey.last_used)
    } else if (filters.usage === 'unused') {
      filtered = filtered.filter(apiKey => !apiKey.last_used)
    }

    // Apply active filter
    if (filters.active !== undefined) {
      filtered = filtered.filter(apiKey => !!apiKey.active === filters.active)
    }

    return filtered
  }
}

export default apiKeyService
