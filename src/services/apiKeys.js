// src/services/apiKeys.js - Updated to match your backend routes
import api from './api'

export const apiKeyService = {
  // API Key Management - matching your backend routes
  apiKeys: {
    // Get all API keys - GET /auth/api-keys
    getAll: async () => {
      const response = await api.get('/auth/api-keys')
      return response.data
    },

    // Get API key by ID - GET /auth/api-keys/{id}
    getById: async (id) => {
      const response = await api.get(`/auth/api-keys/${id}`)
      return response.data
    },

    // Create new API key - POST /auth/api-keys
    create: async (keyData) => {
      const response = await api.post('/auth/api-keys', keyData)
      return response.data
    },

    // Update API key - PUT /auth/api-keys/{id}
    update: async (id, keyData) => {
      const response = await api.put(`/auth/api-keys/${id}`, keyData)
      return response.data
    },

    // Permanently delete API key - DELETE /auth/api-keys/{id}
    delete: async (id) => {
      return api.delete(`/auth/api-keys/${id}`)
    },

    // Deactivate API key (alternative to delete) - POST /auth/api-keys/{id}/deactivate
    deactivate: async (id) => {
      return api.post(`/auth/api-keys/${id}/deactivate`)
    },

    // Get API key usage - GET /auth/api-keys/{id}/usage
    getUsage: async (id, params = {}) => {
      const response = await api.get(`/auth/api-keys/${id}/usage`, { params })
      return response.data
    }
  },

  // Rate Limit Management - matching your backend routes
  rateLimits: {
    // Get all API key rate limit status - GET /admin/rate-limits/status
    getStatus: async () => {
      const response = await api.get('/admin/rate-limits/status')
      return response.data
    },

    // Get rate limiting metrics - GET /admin/rate-limits/metrics
    getMetrics: async () => {
      const response = await api.get('/admin/rate-limits/metrics')
      return response.data
    },

    // Get specific API key rate limit status - GET /admin/rate-limits/{id}
    getApiKeyStatus: async (id) => {
      const response = await api.get(`/admin/rate-limits/${id}`)
      return response.data
    },

    // Reset API key rate limit - POST /admin/rate-limits/{id}/reset
    resetApiKeyLimit: async (id) => {
      const response = await api.post(`/admin/rate-limits/${id}/reset`)
      return response.data
    }
  }
}

// Helper functions for the API key service
export const apiKeyUtils = {
  // Format error responses
  formatError: (error) => {
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

  // Check if API key is expired
  isExpired: (apiKey) => {
    return apiKey.expires_at && new Date(apiKey.expires_at) < new Date()
  },

  // Check if API key is expiring soon (within 30 days)
  isExpiringSoon: (apiKey) => {
    if (!apiKey.expires_at) return false
    const expiryDate = new Date(apiKey.expires_at)
    const now = new Date()
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  },

  // Get API key status
  getStatus: (apiKey) => {
    if (apiKeyUtils.isExpired(apiKey)) return 'Expired'
    if (!apiKey.active) return 'Inactive'
    if (apiKeyUtils.isExpiringSoon(apiKey)) return 'Expiring Soon'
    return 'Active'
  },

  // Get status color class
  getStatusColor: (apiKey) => {
    const status = apiKeyUtils.getStatus(apiKey)
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

  // Format numbers for display
  formatNumber: (num) => {
    if (typeof num !== 'number') return '0'

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

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
  }
}

export default apiKeyService
