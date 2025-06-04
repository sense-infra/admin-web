// src/utils/constants.js
export const API_ENDPOINTS = {
  // Admin
  ADMIN_USERS: '/admin/users',
  API_KEYS: '/admin/api-keys',
  RATE_LIMITS: '/admin/rate-limits',
  
  // Core entities
  CUSTOMERS: '/customers',
  CONTRACTS: '/contracts',
  
  // Hardware
  NVR: '/nvr',
  CAMERAS: '/cameras',
  CONTROLLERS: '/controllers',
  TPM_DEVICES: '/tpm-devices',
  
  // Security
  SSH_KEYS: '/ssh-keys',
  CERTIFICATES: '/certificates',
  VPN_CONFIGS: '/vpn/configs',
  
  // Monitoring
  SECURITY_EVENTS: '/security-events',
  RF_MONITORING: '/rf',
  HEALTH: '/health',
  DIAGNOSTICS: '/diagnostics',
  
  // Service Tiers
  SERVICE_TIERS: '/service-tiers',
  
  // System
  LOGIN: '/login',
  LOGOUT: '/logout',
  PROFILE: '/profile'
}

export const EVENT_CATEGORIES = {
  SECURITY: 'security',
  SYSTEM: 'system',
  OPERATIONAL: 'operational',
  ALERT: 'alert',
  JAMMING: 'jamming'
}

export const EVENT_TYPES = {
  // Security Events
  PERSON_DETECTION: 'person_detection',
  MOTION_DETECTION: 'motion_detection',
  INTRUSION_ALARM: 'intrusion_alarm',
  EMERGENCY_BUTTON: 'emergency_button',
  
  // System Events
  CONTROLLER_OFFLINE: 'controller_offline',
  CONTROLLER_ONLINE: 'controller_online',
  CAMERA_OFFLINE: 'camera_offline',
  CAMERA_ONLINE: 'camera_online',
  NETWORK_ISSUE: 'network_issue',
  WIFI_JAMMING: 'wifi_jamming',
  
  // RF Jamming Events
  RF_JAMMING_DETECTED: 'rf_jamming_detected',
  FREQUENCY_INTERFERENCE: 'frequency_interference',
  SIGNAL_THRESHOLD_EXCEEDED: 'signal_threshold_exceeded'
}

export const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

export const EVENT_STATUS = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  FALSE_POSITIVE: 'false_positive'
}

export const RF_CATEGORIES = {
  SECURITY_SYSTEM: 'security_system',
  HOME_AUTOMATION: 'home_automation',
  GARAGE_DOOR: 'garage_door',
  CAR_REMOTE: 'car_remote',
  WIFI: 'wifi',
  BLUETOOTH: 'bluetooth',
  CELLULAR: 'cellular',
  EMERGENCY: 'emergency',
  INDUSTRIAL: 'industrial',
  CUSTOM: 'custom'
}

export const SECURITY_IMPORTANCE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const JAMMING_RISK = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

export const CAMERA_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
}

export const OS_ARCHITECTURES = {
  ARM32: 'arm32',
  ARM64: 'arm64',
  X86: 'x86',
  X64: 'x64',
  RISCV: 'riscv'
}

export const API_TYPES = {
  ONVIF: 'ONVIF',
  MANUFACTURER_API: 'ManufacturerAPI',
  RTSP: 'RTSP'
}

export const AUTH_TYPES = {
  BASIC: 'Basic',
  DIGEST: 'Digest',
  TOKEN: 'Token'
}

export const USER_PERMISSIONS = {
  // Admin permissions
  ADMIN_USERS: 'admin.users',
  ADMIN_API_KEYS: 'admin.api_keys',
  ADMIN_RATE_LIMITS: 'admin.rate_limits',
  
  // Entity permissions
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CUSTOMERS_DELETE: 'customers.delete',
  
  CONTRACTS_READ: 'contracts.read',
  CONTRACTS_WRITE: 'contracts.write',
  CONTRACTS_DELETE: 'contracts.delete',
  
  HARDWARE_READ: 'hardware.read',
  HARDWARE_WRITE: 'hardware.write',
  HARDWARE_DELETE: 'hardware.delete',
  
  SECURITY_READ: 'security.read',
  SECURITY_WRITE: 'security.write',
  SECURITY_DELETE: 'security.delete',
  
  MONITORING_READ: 'monitoring.read',
  MONITORING_WRITE: 'monitoring.write',
  
  BILLING_READ: 'billing.read',
  BILLING_WRITE: 'billing.write',
  
  SYSTEM_CONFIG: 'system.config'
}

// src/utils/validators.js
export const validators = {
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Please enter a valid email address'
  },
  
  phone: (value) => {
    const pattern = /^\+?[\d\s\-\(\)]+$/
    return pattern.test(value) || 'Please enter a valid phone number'
  },
  
  required: (value) => {
    return (value && value.length > 0) || 'This field is required'
  },
  
  minLength: (min) => (value) => {
    return (value && value.length >= min) || `Minimum ${min} characters required`
  },
  
  maxLength: (max) => (value) => {
    return (!value || value.length <= max) || `Maximum ${max} characters allowed`
  },
  
  ipAddress: (value) => {
    const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return pattern.test(value) || 'Please enter a valid IP address'
  },
  
  frequency: (value) => {
    const num = parseFloat(value)
    return (!isNaN(num) && num > 0 && num <= 10000) || 'Please enter a valid frequency (0-10000 MHz)'
  },
  
  dbm: (value) => {
    const num = parseFloat(value)
    return (!isNaN(num) && num >= -150 && num <= 50) || 'Please enter a valid dBm value (-150 to 50)'
  },
  
  serialNumber: (value) => {
    const pattern = /^[A-Z0-9\-_]+$/i
    return pattern.test(value) || 'Serial number can only contain letters, numbers, hyphens, and underscores'
  },
  
  macAddress: (value) => {
    const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return pattern.test(value) || 'Please enter a valid MAC address'
  },
  
  date: (value) => {
    const date = new Date(value)
    return !isNaN(date.getTime()) || 'Please enter a valid date'
  },
  
  futureDate: (value) => {
    const date = new Date(value)
    const now = new Date()
    return date > now || 'Date must be in the future'
  },
  
  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character'
    return true
  },
  
  port: (value) => {
    const num = parseInt(value)
    return (!isNaN(num) && num >= 1 && num <= 65535) || 'Please enter a valid port number (1-65535)'
  },
  
  bandwidth: (value) => {
    const num = parseInt(value)
    return (!isNaN(num) && num > 0) || 'Please enter a valid bandwidth in kHz'
  }
}

// src/utils/formatters.js
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatters = {
  // Date formatting
  formatDate: (date, formatStr = 'yyyy-MM-dd') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  },
  
  formatDateTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'yyyy-MM-dd HH:mm:ss')
  },
  
  formatRelativeTime: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  },
  
  // Number formatting
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  },
  
  formatFrequency: (mhz) => {
    if (!mhz) return ''
    if (mhz >= 1000) {
      return `${(mhz / 1000).toFixed(3)} GHz`
    }
    return `${mhz.toFixed(3)} MHz`
  },
  
  formatSignalStrength: (dbm) => {
    if (dbm === null || dbm === undefined) return ''
    return `${dbm.toFixed(2)} dBm`
  },
  
  formatPercentage: (value, decimals = 1) => {
    if (value === null || value === undefined) return ''
    return `${(value * 100).toFixed(decimals)}%`
  },
  
  formatCurrency: (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },
  
  // Status formatting
  formatStatus: (status) => {
    if (!status) return ''
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  },
  
  // Hardware formatting
  formatSerialNumber: (serial) => {
    if (!serial) return ''
    // Add dashes every 4 characters for readability
    return serial.replace(/(.{4})/g, '$1-').slice(0, -1)
  },
  
  formatMacAddress: (mac) => {
    if (!mac) return ''
    // Ensure consistent format: XX:XX:XX:XX:XX:XX
    return mac.replace(/[:-]/g, '').replace(/(.{2})/g, '$1:').slice(0, -1).toUpperCase()
  },
  
  formatIPAddress: (ip, mask) => {
    if (!ip) return ''
    return mask ? `${ip}/${mask}` : ip
  },
  
  // Event formatting
  formatEventType: (type) => {
    if (!type) return ''
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  },
  
  formatSeverity: (severity) => {
    const severityMap = {
      'info': 'Info',
      'warning': 'Warning', 
      'critical': 'Critical'
    }
    return severityMap[severity] || severity
  }
}

// src/utils/permissions.js
import { USER_PERMISSIONS } from './constants'

export const permissionUtils = {
  // Check if user has specific permission
  hasPermission: (user, permission) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission) || user.permissions.includes('admin.all')
  },
  
  // Check if user has any of the specified permissions
  hasAnyPermission: (user, permissions) => {
    if (!user || !user.permissions) return false
    return permissions.some(permission => 
      user.permissions.includes(permission) || user.permissions.includes('admin.all')
    )
  },
  
  // Check if user has all specified permissions
  hasAllPermissions: (user, permissions) => {
    if (!user || !user.permissions) return false
    if (user.permissions.includes('admin.all')) return true
    return permissions.every(permission => user.permissions.includes(permission))
  },
  
  // Get user's permissions for a specific module
  getModulePermissions: (user, module) => {
    if (!user || !user.permissions) return []
    const modulePrefix = `${module}.`
    return user.permissions.filter(permission => 
      permission.startsWith(modulePrefix) || permission === 'admin.all'
    )
  },
  
  // Check if user can perform CRUD operations
  canRead: (user, module) => {
    return permissionUtils.hasPermission(user, `${module}.read`)
  },
  
  canWrite: (user, module) => {
    return permissionUtils.hasPermission(user, `${module}.write`)
  },
  
  canDelete: (user, module) => {
    return permissionUtils.hasPermission(user, `${module}.delete`)
  },
  
  // Permission groups for easier management
  getPermissionGroups: () => {
    return {
      admin: [
        USER_PERMISSIONS.ADMIN_USERS,
        USER_PERMISSIONS.ADMIN_API_KEYS,
        USER_PERMISSIONS.ADMIN_RATE_LIMITS
      ],
      customers: [
        USER_PERMISSIONS.CUSTOMERS_READ,
        USER_PERMISSIONS.CUSTOMERS_WRITE,
        USER_PERMISSIONS.CUSTOMERS_DELETE
      ],
      contracts: [
        USER_PERMISSIONS.CONTRACTS_READ,
        USER_PERMISSIONS.CONTRACTS_WRITE,
        USER_PERMISSIONS.CONTRACTS_DELETE
      ],
      hardware: [
        USER_PERMISSIONS.HARDWARE_READ,
        USER_PERMISSIONS.HARDWARE_WRITE,
        USER_PERMISSIONS.HARDWARE_DELETE
      ],
      security: [
        USER_PERMISSIONS.SECURITY_READ,
        USER_PERMISSIONS.SECURITY_WRITE,
        USER_PERMISSIONS.SECURITY_DELETE
      ],
      monitoring: [
        USER_PERMISSIONS.MONITORING_READ,
        USER_PERMISSIONS.MONITORING_WRITE
      ],
      billing: [
        USER_PERMISSIONS.BILLING_READ,
        USER_PERMISSIONS.BILLING_WRITE
      ]
    }
  }
}

// src/utils/api-helpers.js
export const apiHelpers = {
  // Build query string from params object
  buildQueryString: (params) => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    return filtered.length > 0 ? `?${filtered.join('&')}` : ''
  },
  
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error ||
                     `Server error: ${error.response.status}`
      return {
        message,
        status: error.response.status,
        type: 'server_error'
      }
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        type: 'network_error'
      }
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
        type: 'client_error'
      }
    }
  },
  
  // Standardize response format
  standardizeResponse: (response) => {
    return {
      data: response.data,
      status: response.status,
      success: response.status >= 200 && response.status < 300
    }
  },
  
  // Parse pagination from headers
  parsePagination: (headers) => {
    return {
      total: parseInt(headers['x-total-count']) || 0,
      page: parseInt(headers['x-page']) || 1,
      perPage: parseInt(headers['x-per-page']) || 10,
      totalPages: parseInt(headers['x-total-pages']) || 1
    }
  },
  
  // Retry logic for failed requests
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0 && error.response?.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, delay))
        return apiHelpers.retry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }
}

// src/assets/css/main.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  /* Form Components */
  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
  }
  
  .form-input-error {
    @apply border-red-300 focus:ring-red-500 focus:border-red-500;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  
  .form-error {
    @apply text-sm text-red-600 mt-1;
  }
  
  .form-group {
    @apply mb-4;
  }
  
  /* Button Components */
  .btn {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
  }
  
  .btn-success {
    @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
  }
  
  .btn-warning {
    @apply bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  
  .btn-outline {
    @apply bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500;
  }
  
  .btn-sm {
    @apply px-3 py-1.5 text-xs;
  }
  
  .btn-lg {
    @apply px-6 py-3 text-base;
  }
  
  /* Card Components */
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }
  
  .card-header {
    @apply px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50;
  }
  
  .card-body {
    @apply px-4 py-5 sm:p-6;
  }
  
  .card-footer {
    @apply px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50;
  }
  
  /* Status Badges */
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply bg-green-100 text-green-800;
  }
  
  .badge-warning {
    @apply bg-yellow-100 text-yellow-800;
  }
  
  .badge-danger {
    @apply bg-red-100 text-red-800;
  }
  
  .badge-info {
    @apply bg-blue-100 text-blue-800;
  }
  
  .badge-secondary {
    @apply bg-gray-100 text-gray-800;
  }
  
  /* Table Components */
  .table {
    @apply min-w-full divide-y divide-gray-200;
  }
  
  .table-header {
    @apply bg-gray-50;
  }
  
  .table-header-cell {
    @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
  }
  
  .table-body {
    @apply bg-white divide-y divide-gray-200;
  }
  
  .table-row {
    @apply hover:bg-gray-50 transition-colors duration-150;
  }
  
  .table-cell {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
  }
  
  /* Loading States */
  .loading-spinner {
    @apply inline-block h-4 w-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin;
  }
  
  .loading-skeleton {
    @apply animate-pulse bg-gray-200 rounded;
  }
  
  /* Modal Components */
  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 z-40;
  }
  
  .modal-container {
    @apply fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4;
  }
  
  .modal-content {
    @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-auto;
  }
  
  .modal-header {
    @apply px-6 py-4 border-b border-gray-200;
  }
  
  .modal-body {
    @apply px-6 py-4;
  }
  
  .modal-footer {
    @apply px-6 py-4 border-t border-gray-200 flex justify-end space-x-3;
  }
  
  /* Alert Components */
  .alert {
    @apply p-4 rounded-md;
  }
  
  .alert-success {
    @apply bg-green-50 border border-green-200 text-green-800;
  }
  
  .alert-warning {
    @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
  }
  
  .alert-danger {
    @apply bg-red-50 border border-red-200 text-red-800;
  }
  
  .alert-info {
    @apply bg-blue-50 border border-blue-200 text-blue-800;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.10);
  }
  
  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

/* tailwind.config.js */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
