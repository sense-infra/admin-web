// src/services/serviceTiers.js
import api from './api'

const serviceTierService = {
  // Get all service tiers
  async getAll() {
    try {
      const response = await api.get('/service-tiers')
      return response.data
    } catch (error) {
      console.error('Failed to fetch service tiers:', error)
      throw error
    }
  },

  // Get service tier by ID
  async getById(serviceTierId) {
    try {
      const response = await api.get(`/service-tiers/${serviceTierId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch service tier ${serviceTierId}:`, error)
      throw error
    }
  },

  // Create new service tier
  async create(serviceTierData) {
    try {
      const response = await api.post('/service-tiers', serviceTierData)
      return response.data
    } catch (error) {
      console.error('Failed to create service tier:', error)
      throw error
    }
  },

  // Update existing service tier
  async update(serviceTierId, updateData) {
    try {
      const response = await api.put(`/service-tiers/${serviceTierId}`, updateData)
      return response.data
    } catch (error) {
      console.error(`Failed to update service tier ${serviceTierId}:`, error)
      throw error
    }
  },

  // Delete service tier
  async delete(serviceTierId) {
    try {
      const response = await api.delete(`/service-tiers/${serviceTierId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to delete service tier ${serviceTierId}:`, error)
      throw error
    }
  }
}

export default serviceTierService
