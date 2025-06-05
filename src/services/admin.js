// src/services/admin.js
import api from './api'

// ========================================
// CORE ADMIN SERVICE (Enhanced)
// ========================================
export const adminService = {
  // ========================================
  // USER MANAGEMENT (Using correct /auth/ endpoints from main.go)
  // ========================================
  users: {
    getAll: async () => {
      const response = await api.get('/auth/users')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/auth/users/${id}`)
      return response.data
    },
    create: async (userData) => {
      const response = await api.post('/auth/users', userData)
      return response.data
    },
    update: async (id, userData) => {
      const response = await api.put(`/auth/users/${id}`, userData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/auth/users/${id}`)
    },
    updatePermissions: async (id, permissions) => {
      const response = await api.put(`/auth/users/${id}/permissions`, permissions)
      return response.data
    },
    getRoles: async () => {
      const response = await api.get('/auth/roles')
      return response.data
    }
  },

  // ========================================
  // API KEY MANAGEMENT (Using correct /auth/api-keys endpoints from main.go)
  // ========================================
  apiKeys: {
    getAll: async () => {
      const response = await api.get('/auth/api-keys')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/auth/api-keys/${id}`)
      return response.data
    },
    create: async (keyData) => {
      const response = await api.post('/auth/api-keys', keyData)
      return response.data
    },
    update: async (id, keyData) => {
      const response = await api.put(`/auth/api-keys/${id}`, keyData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/auth/api-keys/${id}`)
    },
    revoke: async (id) => {
      return api.delete(`/auth/api-keys/${id}`)
    },
    updatePermissions: async (id, permissions) => {
      const response = await api.put(`/auth/api-keys/${id}/permissions`, permissions)
      return response.data
    },
    getStats: async (id) => {
      const response = await api.get(`/auth/api-keys/${id}/usage`)
      return response.data
    },
    getUsage: async (id) => {
      const response = await api.get(`/auth/api-keys/${id}/usage`)
      return response.data
    }
  },

  // ========================================
  // RATE LIMITING (Using correct /admin/ endpoints)
  // ========================================
  rateLimits: {
    getAll: async () => {
      const response = await api.get('/admin/rate-limits')
      return response.data
    },
    getStats: async () => {
      const response = await api.get('/admin/rate-limits/stats')
      return response.data
    },
    getConfig: async () => {
      const response = await api.get('/admin/rate-limits/config')
      return response.data
    },
    updateConfig: async (config) => {
      const response = await api.put('/admin/rate-limits/config', config)
      return response.data
    },
    update: async (endpoint, config) => {
      const response = await api.put(`/admin/rate-limits/${encodeURIComponent(endpoint)}`, config)
      return response.data
    },
    reset: async (endpoint, identifier = null) => {
      return api.post(`/admin/rate-limits/${encodeURIComponent(endpoint)}/reset`, { identifier })
    },
    resetAll: async () => {
      return api.post('/admin/rate-limits/reset-all')
    }
  },

  // ========================================
  // CUSTOMER MANAGEMENT
  // ========================================
  customers: {
    getAll: async (params = {}) => {
      const response = await api.get('/customers', { params })
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/customers/${id}`)
      return response.data
    },
    create: async (customerData) => {
      const response = await api.post('/customers', customerData)
      return response.data
    },
    update: async (id, customerData) => {
      const response = await api.put(`/customers/${id}`, customerData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/customers/${id}`)
    }
  },

  // ========================================
  // CONTRACT MANAGEMENT
  // ========================================
  contracts: {
    getAll: async (params = {}) => {
      const response = await api.get('/contracts', { params })
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/contracts/${id}`)
      return response.data
    },
    create: async (contractData) => {
      const response = await api.post('/contracts', contractData)
      return response.data
    },
    update: async (id, contractData) => {
      const response = await api.put(`/contracts/${id}`, contractData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/contracts/${id}`)
    }
  },

  // ========================================
  // SYSTEM HEALTH & MONITORING
  // ========================================
  health: {
    getOverview: async () => {
      const response = await api.get('/health')
      return response.data
    },
    getDetailed: async () => {
      const response = await api.get('/health/detailed')
      return response.data
    },
    getMetrics: async (timeRange = '1h') => {
      const response = await api.get(`/health/metrics?range=${timeRange}`)
      return response.data
    },
    getComponentStatus: async (component) => {
      const response = await api.get(`/health/components/${component}`)
      return response.data
    }
  },

  // ========================================
  // DIAGNOSTICS
  // ========================================
  diagnostics: {
    getAll: async () => {
      const response = await api.get('/diagnostics')
      return response.data
    },
    runTest: async (testType, params = {}) => {
      const response = await api.post('/diagnostics/run', { test_type: testType, ...params })
      return response.data
    },
    getTestResults: async (testId) => {
      const response = await api.get(`/diagnostics/results/${testId}`)
      return response.data
    }
  },

  // ========================================
  // UTILITY METHODS
  // ========================================
  handleError(error, defaultMessage) {
    console.error('Admin service error:', error)
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || defaultMessage
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`)
        case 401:
          return new Error('Authentication required. Please log in again.')
        case 403:
          return new Error('Access denied. Insufficient permissions.')
        case 404:
          return new Error('Resource not found.')
        case 409:
          return new Error(`Conflict: ${message}`)
        case 422:
          return new Error(`Validation Error: ${message}`)
        case 429:
          return new Error('Too many requests. Please try again later.')
        case 500:
          return new Error('Internal server error. Please try again later.')
        default:
          return new Error(`Server Error (${status}): ${message}`)
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection and try again.')
    } else {
      return new Error(error.message || defaultMessage)
    }
  },

  // Helper method to format dates
  formatDate(dateString) {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  },

  // Helper method to format file sizes
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  },

  // Helper method to validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Helper method to generate strong password
  generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    return password
  },

  // Helper method to check password strength
  checkPasswordStrength(password) {
    const minLength = 8
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    let score = 0
    let feedback = []
    
    if (password.length >= minLength) score++
    else feedback.push(`Password must be at least ${minLength} characters long`)
    
    if (hasLower) score++
    else feedback.push('Password must contain lowercase letters')
    
    if (hasUpper) score++
    else feedback.push('Password must contain uppercase letters')
    
    if (hasNumbers) score++
    else feedback.push('Password must contain numbers')
    
    if (hasSymbols) score++
    else feedback.push('Password must contain special characters')
    
    let strength = 'Very Weak'
    if (score >= 4) strength = 'Strong'
    else if (score >= 3) strength = 'Medium'
    else if (score >= 2) strength = 'Weak'
    
    return {
      score,
      strength,
      feedback
    }
  }
}

// ========================================
// BILLING SERVICE (Preserved)
// ========================================
export const billingService = {
  // Service Tiers
  serviceTiers: {
    getAll: async () => {
      const response = await api.get('/service-tiers')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/service-tiers/${id}`)
      return response.data
    },
    create: async (tierData) => {
      const response = await api.post('/service-tiers', tierData)
      return response.data
    },
    update: async (id, tierData) => {
      const response = await api.put(`/service-tiers/${id}`, tierData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/service-tiers/${id}`)
    },
    getFeatures: async (id) => {
      const response = await api.get(`/service-tiers/${id}/features`)
      return response.data
    },
    updateFeatures: async (id, features) => {
      const response = await api.put(`/service-tiers/${id}/features`, features)
      return response.data
    }
  },

  // Contract Service Tier Assignments
  contractTiers: {
    getByContract: async (contractId) => {
      const response = await api.get(`/contracts/${contractId}/service-tiers`)
      return response.data
    },
    assign: async (contractId, tierData) => {
      const response = await api.post(`/contracts/${contractId}/service-tiers`, tierData)
      return response.data
    },
    update: async (contractId, assignmentId, tierData) => {
      const response = await api.put(`/contracts/${contractId}/service-tiers/${assignmentId}`, tierData)
      return response.data
    },
    getHistory: async (contractId) => {
      const response = await api.get(`/contracts/${contractId}/service-tier-history`)
      return response.data
    }
  },

  // Usage Analytics
  usage: {
    getByContract: async (contractId, params = {}) => {
      const response = await api.get(`/contracts/${contractId}/usage`, { params })
      return response.data
    },
    getSystemWide: async (params = {}) => {
      const response = await api.get('/usage/system', { params })
      return response.data
    },
    generateReport: async (reportConfig) => {
      const response = await api.post('/usage/reports', reportConfig)
      return response.data
    }
  }
}

// ========================================
// SECURITY SERVICE (Preserved)
// ========================================
export const securityService = {
  // SSH Keys
  sshKeys: {
    getAll: async () => {
      const response = await api.get('/ssh-keys')
      return response.data
    },
    create: async (keyData) => {
      const response = await api.post('/ssh-keys', keyData)
      return response.data
    },
    update: async (id, keyData) => {
      const response = await api.put(`/ssh-keys/${id}`, keyData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/ssh-keys/${id}`)
    },
    getAssignments: async (keyId) => {
      const response = await api.get(`/ssh-keys/${keyId}/assignments`)
      return response.data
    },
    assignToController: async (keyId, controllerId) => {
      const response = await api.post(`/ssh-keys/${keyId}/assign`, { controller_id: controllerId })
      return response.data
    },
    unassignFromController: async (keyId, controllerId) => {
      return api.delete(`/ssh-keys/${keyId}/assign/${controllerId}`)
    }
  },

  // X.509 Certificates
  certificates: {
    getAll: async () => {
      const response = await api.get('/certificates')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/certificates/${id}`)
      return response.data
    },
    create: async (certData) => {
      const response = await api.post('/certificates', certData)
      return response.data
    },
    update: async (id, certData) => {
      const response = await api.put(`/certificates/${id}`, certData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/certificates/${id}`)
    },
    getExpiringCerts: async (days = 30) => {
      const response = await api.get(`/certificates/expiring?days=${days}`)
      return response.data
    },
    renewCertificate: async (id) => {
      const response = await api.post(`/certificates/${id}/renew`)
      return response.data
    },
    getAssignments: async (certId) => {
      const response = await api.get(`/certificates/${certId}/assignments`)
      return response.data
    }
  },

  // VPN Configurations
  vpn: {
    getConfigs: async () => {
      const response = await api.get('/vpn/configs')
      return response.data
    },
    createConfig: async (configData) => {
      const response = await api.post('/vpn/configs', configData)
      return response.data
    },
    updateConfig: async (id, configData) => {
      const response = await api.put(`/vpn/configs/${id}`, configData)
      return response.data
    },
    deleteConfig: async (id) => {
      return api.delete(`/vpn/configs/${id}`)
    },
    getClientMappings: async (configId) => {
      const response = await api.get(`/vpn/configs/${configId}/clients`)
      return response.data
    },
    assignClient: async (configId, clientData) => {
      const response = await api.post(`/vpn/configs/${configId}/clients`, clientData)
      return response.data
    },
    updateClientMapping: async (configId, mappingId, clientData) => {
      const response = await api.put(`/vpn/configs/${configId}/clients/${mappingId}`, clientData)
      return response.data
    },
    removeClient: async (configId, mappingId) => {
      return api.delete(`/vpn/configs/${configId}/clients/${mappingId}`)
    },
    getStatus: async () => {
      const response = await api.get('/vpn/status')
      return response.data
    }
  }
}

// ========================================
// HARDWARE SERVICE (Preserved)
// ========================================
export const hardwareService = {
  // NVR Management
  nvr: {
    getAll: async () => {
      const response = await api.get('/nvr')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/nvr/${id}`)
      return response.data
    },
    create: async (data) => {
      const response = await api.post('/nvr', data)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(`/nvr/${id}`, data)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/nvr/${id}`)
    },
    getProfiles: async () => {
      const response = await api.get('/nvr/profiles')
      return response.data
    },
    createProfile: async (profileData) => {
      const response = await api.post('/nvr/profiles', profileData)
      return response.data
    },
    updateProfile: async (id, profileData) => {
      const response = await api.put(`/nvr/profiles/${id}`, profileData)
      return response.data
    },
    getCameras: async (nvrId) => {
      const response = await api.get(`/nvr/${nvrId}/cameras`)
      return response.data
    },
    getControllers: async (nvrId) => {
      const response = await api.get(`/nvr/${nvrId}/controllers`)
      return response.data
    }
  },

  // Camera Management
  cameras: {
    getAll: async () => {
      const response = await api.get('/cameras')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/cameras/${id}`)
      return response.data
    },
    create: async (data) => {
      const response = await api.post('/cameras', data)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(`/cameras/${id}`, data)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/cameras/${id}`)
    },
    getStatus: async (id) => {
      const response = await api.get(`/cameras/${id}/status`)
      return response.data
    },
    updateStatus: async (id, status) => {
      const response = await api.put(`/cameras/${id}/status`, { status })
      return response.data
    },
    testConnection: async (id) => {
      const response = await api.post(`/cameras/${id}/test`)
      return response.data
    }
  },

  // Controller Management
  controllers: {
    getAll: async () => {
      const response = await api.get('/controllers')
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/controllers/${id}`)
      return response.data
    },
    create: async (data) => {
      const response = await api.post('/controllers', data)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(`/controllers/${id}`, data)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/controllers/${id}`)
    },
    getDiagnostics: async (id) => {
      const response = await api.get(`/controllers/${id}/diagnostics`)
      return response.data
    },
    getCameraSupport: async (id) => {
      const response = await api.get(`/controllers/${id}/cameras`)
      return response.data
    },
    updateCameraSupport: async (id, cameraData) => {
      const response = await api.put(`/controllers/${id}/cameras`, cameraData)
      return response.data
    },
    reboot: async (id) => {
      return api.post(`/controllers/${id}/reboot`)
    },
    updateFirmware: async (id, firmwareData) => {
      const response = await api.post(`/controllers/${id}/firmware-update`, firmwareData)
      return response.data
    }
  },

  // TPM Devices
  tpm: {
    getAll: async () => {
      const response = await api.get('/tpm-devices')
      return response.data
    },
    create: async (data) => {
      const response = await api.post('/tpm-devices', data)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(`/tpm-devices/${id}`, data)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/tpm-devices/${id}`)
    },
    getStatus: async (id) => {
      const response = await api.get(`/tpm-devices/${id}/status`)
      return response.data
    }
  }
}

// ========================================
// MONITORING SERVICE (Preserved)
// ========================================
export const monitoringService = {
  // Security Events
  securityEvents: {
    getAll: async (params = {}) => {
      const response = await api.get('/security-events', { params })
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(`/security-events/${id}`)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(`/security-events/${id}`, data)
      return response.data
    },
    acknowledge: async (id, userId) => {
      const response = await api.post(`/security-events/${id}/acknowledge`, { user_id: userId })
      return response.data
    },
    resolve: async (id, resolution) => {
      const response = await api.post(`/security-events/${id}/resolve`, resolution)
      return response.data
    },
    getIncidents: async (params = {}) => {
      const response = await api.get('/incidents', { params })
      return response.data
    },
    combineEvents: async (eventIds, incidentData) => {
      const response = await api.post('/incidents/combine', { event_ids: eventIds, ...incidentData })
      return response.data
    }
  },

  // Event Type Rules
  eventRules: {
    getAll: async () => {
      const response = await api.get('/event-type-rules')
      return response.data
    },
    update: async (id, ruleData) => {
      const response = await api.put(`/event-type-rules/${id}`, ruleData)
      return response.data
    }
  },

  // RF Monitoring
  rfMonitoring: {
    getFrequencyProfiles: async () => {
      const response = await api.get('/rf/frequency-profiles')
      return response.data
    },
    createFrequencyProfile: async (profileData) => {
      const response = await api.post('/rf/frequency-profiles', profileData)
      return response.data
    },
    updateFrequencyProfile: async (id, profileData) => {
      const response = await api.put(`/rf/frequency-profiles/${id}`, profileData)
      return response.data
    },
    deleteFrequencyProfile: async (id) => {
      return api.delete(`/rf/frequency-profiles/${id}`)
    },
    getContractConfig: async (contractId) => {
      const response = await api.get(`/contracts/${contractId}/rf-monitoring`)
      return response.data
    },
    updateContractConfig: async (contractId, config) => {
      const response = await api.put(`/contracts/${contractId}/rf-monitoring`, config)
      return response.data
    },
    getSignalData: async (contractId, params = {}) => {
      const response = await api.get(`/contracts/${contractId}/rf-signals`, { params })
      return response.data
    },
    getJammingEvents: async (params = {}) => {
      const response = await api.get('/rf/jamming-events', { params })
      return response.data
    }
  }
}

// ========================================
// MAPPING SERVICE (Preserved)
// ========================================
export const mappingService = {
  // Contract Mappings
  contracts: {
    getCustomerMappings: async (contractId) => {
      const response = await api.get(`/contracts/${contractId}/customers`)
      return response.data
    },
    addCustomer: async (contractId, customerId) => {
      const response = await api.post(`/contracts/${contractId}/customers`, { customer_id: customerId })
      return response.data
    },
    removeCustomer: async (contractId, customerId) => {
      return api.delete(`/contracts/${contractId}/customers/${customerId}`)
    },
    getNVRMappings: async (contractId) => {
      const response = await api.get(`/contracts/${contractId}/nvr`)
      return response.data
    },
    addNVR: async (contractId, nvrId) => {
      const response = await api.post(`/contracts/${contractId}/nvr`, { nvr_id: nvrId })
      return response.data
    },
    removeNVR: async (contractId, nvrId) => {
      return api.delete(`/contracts/${contractId}/nvr/${nvrId}`)
    }
  },

  // Hardware Mappings
  hardware: {
    getNVRCameraMappings: async (nvrId) => {
      const response = await api.get(`/nvr/${nvrId}/cameras`)
      return response.data
    },
    addCameraToNVR: async (nvrId, cameraId, channelNumber) => {
      const response = await api.post(`/nvr/${nvrId}/cameras`, { 
        camera_id: cameraId, 
        channel_number: channelNumber 
      })
      return response.data
    },
    removeCameraFromNVR: async (nvrId, cameraId) => {
      return api.delete(`/nvr/${nvrId}/cameras/${cameraId}`)
    },
    getNVRControllerMappings: async (nvrId) => {
      const response = await api.get(`/nvr/${nvrId}/controllers`)
      return response.data
    },
    addControllerToNVR: async (nvrId, controllerId) => {
      const response = await api.post(`/nvr/${nvrId}/controllers`, { controller_id: controllerId })
      return response.data
    },
    removeControllerFromNVR: async (nvrId, controllerId) => {
      return api.delete(`/nvr/${nvrId}/controllers/${controllerId}`)
    }
  },

  // Camera Support Configuration
  cameraSupport: {
    getControllerSupport: async (controllerId) => {
      const response = await api.get(`/controllers/${controllerId}/camera-support`)
      return response.data
    },
    updateCameraSupport: async (controllerId, supportConfig) => {
      const response = await api.put(`/controllers/${controllerId}/camera-support`, supportConfig)
      return response.data
    },
    addCameraSupport: async (controllerId, cameraId, priority) => {
      const response = await api.post(`/controllers/${controllerId}/camera-support`, {
        camera_id: cameraId,
        priority: priority
      })
      return response.data
    },
    removeCameraSupport: async (controllerId, cameraId) => {
      return api.delete(`/controllers/${controllerId}/camera-support/${cameraId}`)
    }
  },

  // Network Topology
  topology: {
    getOverview: async () => {
      const response = await api.get('/topology')
      return response.data
    },
    getContractTopology: async (contractId) => {
      const response = await api.get(`/topology/contracts/${contractId}`)
      return response.data
    },
    validateConfiguration: async (configData) => {
      const response = await api.post('/topology/validate', configData)
      return response.data
    }
  }
}

// Export singleton instance for convenience methods
export default adminService
