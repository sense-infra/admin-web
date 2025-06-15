// src/services/customers.js - Fixed Routes
import api from './api'

const customerService = {
  customers: {
    // Get all customers - FIXED ROUTE
    async getAll(params = {}) {
      try {
        const response = await api.get('/customers', { params })  // ✅ FIXED: /customers not /admin/customers
        return response.data
      } catch (error) {
        console.error('Failed to fetch customers:', error)
        throw error
      }
    },

    // Get customer by ID - FIXED ROUTE
    async getById(customerId) {
      try {
        const response = await api.get(`/customers/${customerId}`)  // ✅ FIXED
        return response.data
      } catch (error) {
        console.error(`Failed to fetch customer ${customerId}:`, error)
        throw error
      }
    },

    // Create new customer - FIXED ROUTE
    async create(customerData) {
      try {
        console.log('Creating customer with data:', customerData)
        
        // Validate required fields
        if (!customerData.name_on_contract || !customerData.address) {
          throw new Error('Customer name and address are required')
        }

        const response = await api.post('/customers', customerData)  // ✅ FIXED
        console.log('Customer creation response:', response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create customer:', error)
        throw error
      }
    },

    // Update existing customer - FIXED ROUTE
    async update(customerId, updateData) {
      try {
        console.log(`Updating customer ${customerId} with data:`, updateData)
        const response = await api.put(`/customers/${customerId}`, updateData)  // ✅ FIXED
        console.log('Customer update response:', response.data)
        return response.data
      } catch (error) {
        console.error(`Failed to update customer ${customerId}:`, error)
        throw error
      }
    },

    // Delete customer - FIXED ROUTE
    async delete(customerId) {
      try {
        const response = await api.delete(`/customers/${customerId}`)  // ✅ FIXED
        return response.data
      } catch (error) {
        console.error(`Failed to delete customer ${customerId}:`, error)
        throw error
      }
    },

    // Search customers - FIXED ROUTE (if you implement search)
    async search(query, params = {}) {
      try {
        const searchParams = { search: query, ...params }
        const response = await api.get('/customers/search', { params: searchParams })  // ✅ FIXED
        return response.data
      } catch (error) {
        console.error('Failed to search customers:', error)
        throw error
      }
    }
  }
}

// Utility functions for customer management
const customerUtils = {
  // Format error messages
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

  // Format date for display
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
  },

  // Validate customer data
  validateCustomerData(data) {
    const errors = []
    
    if (!data.name_on_contract || data.name_on_contract.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters long')
    }
    
    if (!data.address || data.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long')
    }
    
    if (!data.unique_id || data.unique_id.trim().length < 3) {
      errors.push('Unique ID must be at least 3 characters long')
    }
    
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address')
    }
    
    if (data.phone_number && !this.isValidPhone(data.phone_number)) {
      errors.push('Please enter a valid phone number')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Phone validation (basic)
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }
}

export { customerService, customerUtils }
