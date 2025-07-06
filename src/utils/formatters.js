// src/utils/formatters.js
// Centralized formatting utilities to avoid duplication across components

/**
 * Format a date string into a human-readable format
 * @param {string|Date} dateString - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return 'Never'

  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return 'Invalid Date'
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Format a date for display in tables (shorter format)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(dateString) {
  return formatDate(dateString, {
    year: '2-digit',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format a date with time for detailed views
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string with time
 */
export function formatDateTime(dateString) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Never'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return 'Unknown'
  }
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${currency} ${amount}`
  }
}

/**
 * Format numbers with thousand separators
 * @param {number} number - Number to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted number string
 */
export function formatNumber(number, locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale).format(number)
  } catch (error) {
    console.error('Error formatting number:', error)
    return number.toString()
  }
}

/**
 * Format percentage values
 * @param {number} value - Value to format as percentage (0.5 = 50%)
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1, locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  } catch (error) {
    console.error('Error formatting percentage:', error)
    return `${(value * 100).toFixed(decimals)}%`
  }
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert snake_case to Title Case
 * @param {string} str - Snake case string
 * @returns {string} Title case string
 */
export function snakeToTitleCase(str) {
  if (!str) return str
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return text
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

/**
 * Format phone numbers (basic US format)
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return phone
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`
  }
  
  // Return original if not 10 digits
  return phone
}

/**
 * Format duration in milliseconds to human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

/**
 * Format API error messages consistently
 * @param {Error} error - Error object from API call
 * @returns {string} Formatted error message
 */
export function formatApiError(error) {
  if (error.response?.data) {
    const errorData = error.response.data

    if (errorData.detail) return errorData.detail
    if (errorData.message) return errorData.message
    if (errorData.error) return errorData.error
    if (typeof errorData === 'string') return errorData
  }

  return error.message || 'An unexpected error occurred'
}

// Export all formatters as default object for convenience
export default {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatCurrency,
  formatNumber,
  formatPercentage,
  capitalize,
  snakeToTitleCase,
  truncateText,
  formatPhoneNumber,
  formatDuration,
  formatApiError
}
