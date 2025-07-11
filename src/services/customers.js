// src/services/customers.js
// Customer management service following the consolidated service pattern

import api from './api'
import { errorHandlers, logError, createRetryHandler } from '@/utils/errorHandling'

/**
 * Customer service following the standard service pattern from users.js
 * Handles all customer-related API operations with consistent error handling
 */
export const customerService = {
  customers: {
    /**
     * Get all customers with optional filtering
     * @param {Object} params - Query parameters for filtering/pagination
     * @returns {Promise<Array>} Array of customer objects
     */
    async getAll(params = {}) {
      const operation = async () => {
        const response = await api.get('/customers', { params })
        return Array.isArray(response.data) ? response.data : []
      }

      try {
        return await createRetryHandler(operation, 2)()
      } catch (error) {
        logError(error, 'customerService.getAll', { params })
        throw new Error(errorHandlers.fetch(error, {
          fallbackMessage: 'Failed to load customers'
        }))
      }
    },

    /**
     * Get a single customer by ID
     * @param {number} customerId - Customer ID
     * @returns {Promise<Object>} Customer object
     */
    async getById(customerId) {
      try {
        const response = await api.get(`/customers/${customerId}`)
        return response.data
      } catch (error) {
        logError(error, 'customerService.getById', { customerId })
        throw new Error(errorHandlers.fetch(error, {
          fallbackMessage: `Failed to load customer ${customerId}`
        }))
      }
    },

    /**
     * Create a new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise<Object>} Created customer object
     */
    async create(customerData) {
      try {
        // Clean and validate data
        const cleanedData = customerUtils.cleanCustomerData(customerData)

        const response = await api.post('/customers', cleanedData)
        return response.data
      } catch (error) {
        logError(error, 'customerService.create', { customerData })
        throw new Error(errorHandlers.create(error, {
          fallbackMessage: 'Failed to create customer'
        }))
      }
    },

    /**
     * Update an existing customer
     * @param {number} customerId - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise<Object>} Updated customer object
     */
    async update(customerId, customerData) {
      try {
        // Clean and validate data
        const cleanedData = customerUtils.cleanCustomerData(customerData)

        const response = await api.put(`/customers/${customerId}`, cleanedData)
        return response.data
      } catch (error) {
        logError(error, 'customerService.update', { customerId, customerData })
        throw new Error(errorHandlers.update(error, {
          fallbackMessage: `Failed to update customer ${customerId}`
        }))
      }
    },

    /**
     * Delete a customer permanently
     * @param {number} customerId - Customer ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(customerId) {
      try {
        const response = await api.delete(`/customers/${customerId}`)
        return response.data
      } catch (error) {
        logError(error, 'customerService.delete', { customerId })
        throw new Error(errorHandlers.delete(error, {
          fallbackMessage: `Failed to delete customer ${customerId}`
        }))
      }
    },

    /**
     * Search customers
     * @param {string} query - Search query
     * @param {Object} params - Additional search parameters
     * @returns {Promise<Array>} Array of matching customers
     */
    async search(query, params = {}) {
      try {
        const searchParams = { search: query, ...params }
        const response = await api.get('/customers/search', { params: searchParams })
        return Array.isArray(response.data) ? response.data : []
      } catch (error) {
        logError(error, 'customerService.search', { query, params })
        throw new Error(errorHandlers.fetch(error, {
          fallbackMessage: 'Failed to search customers'
        }))
      }
    },

    /**
     * Get customer statistics
     * @returns {Promise<Object>} Customer statistics
     */
    async getStats() {
      try {
        const response = await api.get('/customers/stats')
        return response.data
      } catch (error) {
        // Only log 404 as info, not error since it's expected if endpoint doesn't exist
        if (error.response?.status === 404) {
          console.info('Customer stats endpoint not available, will generate stats from customer data')
          return null // Return null to indicate fallback should be used
        }

        // Log other errors normally
        logError(error, 'customerService.getStats')
        return null // Still return null to allow fallback
      }
    }
  }
}

/**
 * Customer utility functions following the consolidated pattern
 */
export const customerUtils = {
  /**
   * Clean and format customer data for API submission
   * @param {Object} customerData - Raw customer data from form
   * @returns {Object} Cleaned customer data
   */
  cleanCustomerData(customerData) {
    const cleaned = {
      name_on_contract: customerData.name_on_contract?.trim(),
      unique_id: customerData.unique_id?.trim(),
      address: customerData.address?.trim(),
      email: customerData.email?.trim() || null,
      phone_number: customerData.phone_number?.trim() || null
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
   * Get customer display name
   * @param {Object} customer - Customer object
   * @returns {string} Display name
   */
  getDisplayName(customer) {
    return customer.name_on_contract || 'Unknown Customer'
  },

  /**
   * Get customer initials for avatar
   * @param {Object} customer - Customer object
   * @returns {string} Customer initials
   */
  getInitials(customer) {
    const name = customer.name_on_contract || 'Customer'
    const parts = name.split(' ')
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    
    return name.substring(0, 2).toUpperCase()
  },

  /**
   * Format error message for customer operations
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  formatError(error) {
    return errorHandlers.customer?.(error) || errorHandlers.generic(error)
  },

  /**
   * Generate customer stats from customer and contract arrays
   * @param {Array} customers - Array of customers
   * @param {Array} contracts - Array of contracts
   * @returns {Object} Customer statistics
   */
  generateStats(customers, contracts = []) {
    if (!Array.isArray(customers)) {
      return { total: 0, recent: 0, withEmail: 0, withContracts: 0 }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Get customers with contracts
    const customersWithContracts = new Set()
    if (Array.isArray(contracts)) {
      contracts.forEach(contract => {
        if (contract.customers && Array.isArray(contract.customers)) {
          contract.customers.forEach(customer => {
            customersWithContracts.add(customer.customer_id)
          })
        } else if (contract.customer_id) {
          customersWithContracts.add(contract.customer_id)
        }
      })
    }

    return {
      total: customers.length,
      recent: customers.filter(customer => {
        if (!customer.created_at) return false
        return new Date(customer.created_at) >= thirtyDaysAgo
      }).length,
      withEmail: customers.filter(customer => customer.email).length,
      withContracts: customers.filter(customer => 
        customersWithContracts.has(customer.customer_id)
      ).length
    }
  },

  /**
   * Validate customer data before submission
   * @param {Object} customerData - Customer data to validate
   * @param {boolean} isEditing - Whether this is an edit operation
   * @returns {Object} Validation result with isValid and errors
   */
  validateCustomerData(customerData, isEditing = false) {
    const errors = []

    // Name validation
    if (!customerData.name_on_contract || customerData.name_on_contract.trim() === '') {
      errors.push('Customer name is required')
    } else if (customerData.name_on_contract.length < 2) {
      errors.push('Customer name must be at least 2 characters')
    } else if (customerData.name_on_contract.length > 255) {
      errors.push('Customer name is too long')
    }

    // Unique ID validation
    if (!customerData.unique_id || customerData.unique_id.trim() === '') {
      errors.push('Unique ID is required')
    } else if (customerData.unique_id.length > 255) {
      errors.push('Unique ID is too long')
    }

    // Address validation
    if (!customerData.address || customerData.address.trim() === '') {
      errors.push('Address is required')
    } else if (customerData.address.length < 5) {
      errors.push('Address must be at least 5 characters')
    } else if (customerData.address.length > 1000) {
      errors.push('Address is too long')
    }

    // Email validation (optional but if provided, should be valid)
    if (customerData.email && !this.isValidEmail(customerData.email)) {
      errors.push('Please enter a valid email address')
    }

    // Phone validation (optional but if provided, should be valid)
    if (customerData.phone_number && !this.isValidPhone(customerData.phone_number)) {
      errors.push('Please enter a valid phone number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Email validation
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Phone validation (basic)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  },

  /**
   * Format customer for display in tables
   * @param {Object} customer - Customer object
   * @returns {Object} Formatted customer object
   */
  formatForTable(customer) {
    return {
      ...customer,
      displayName: this.getDisplayName(customer),
      initials: this.getInitials(customer),
      hasEmail: !!customer.email,
      hasPhone: !!customer.phone_number
    }
  },

  /**
   * Search/filter customers client-side
   * @param {Array} customers - Array of customers
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered customers
   */
  filterCustomers(customers, searchTerm, filters = {}) {
    if (!Array.isArray(customers)) return []

    let filtered = [...customers]

    // Apply search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(customer => {
        const searchableText = [
          customer.name_on_contract,
          customer.unique_id,
          customer.email,
          customer.phone_number,
          customer.address
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(term)
      })
    }

    // Apply filters
    if (filters.hasEmail !== undefined) {
      filtered = filtered.filter(customer => !!customer.email === filters.hasEmail)
    }

    if (filters.hasContracts !== undefined) {
      // This would need contract data to be passed in
      // Implementation depends on how contracts are structured
    }

    if (filters.created_after) {
      const afterDate = new Date(filters.created_after)
      filtered = filtered.filter(customer => new Date(customer.created_at) >= afterDate)
    }

    return filtered
  },

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) {
      return 'Never'
    }

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }
}

export default customerService
