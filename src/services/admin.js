// src/services/admin.js
import api from './api'

export const adminService = {
  // User Management
  users: {
    getAll: async () => {
      const response = await api.get('/admin/users')
      return response.data
    },
    create: async (userData) => {
      const response = await api.post('/admin/users', userData)
      return response.data
    },
    update: async (id, userData) => {
      const response = await api.put(`/admin/users/${id}`, userData)
      return response.data
    },
    delete: async (id) => {
      return api.delete(`/admin/users/${id}`)
    },
    updatePermissions: async (id, permissions) => {
      const response = await api.put(`/admin/users/${id}/permissions`, permissions)
      return response.data
    }
  },

  // API Key Management
  apiKeys: {
    getAll: async () => {
      const response = await api.get('/admin/api-keys')
      return response.data
    },
    create: async (keyData) => {
      const response = await api.post('/admin/api-keys', keyData)
      return response.data
    },
    update: async (id, keyData) => {
      const response = await api.put(`/admin/api-keys/${id}`, keyData)
      return response.data
    },
    revoke: async (id) => {
      return api.delete(`/admin/api-keys/${id}`)
    },
    updatePermissions: async (id, permissions) => {
      const response = await api.put(`/admin/api-keys/${id}/permissions`, permissions)
      return response.data
    },
    getStats: async (id) => {
      const response = await api.get(`/admin/api-keys/${id}/stats`)
      return response.data
    }
  },

  // Rate Limiting
  rateLimits: {
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
    reset: async (identifier) => {
      return api.post('/admin/rate-limits/reset', { identifier })
    },
    resetAll: async () => {
      return api.post('/admin/rate-limits/reset-all')
    }
  }
}

// src/services/billing.js
import api from './api'

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

// src/services/security.js
import api from './api'

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

// Enhanced hardware.js
import api from './api'

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

// Enhanced monitoring.js
import api from './api'

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
  },

  // System Health
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

  // Diagnostics
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
  }
}

// src/services/mappings.js
import api from './api'

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
