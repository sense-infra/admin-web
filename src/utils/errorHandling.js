// src/utils/errorHandling.js
// Enhanced centralized error handling utilities

import { formatApiError } from './formatters'

/**
 * Enhanced API error formatter with consistent message structure
 * @param {Error} error - Error object from API call
 * @param {Object} options - Formatting options
 * @returns {string} Formatted error message
 */
export function formatError(error, options = {}) {
  const {
    fallbackMessage = 'An unexpected error occurred',
    includeStatusCode = false,
    contextPrefix = ''
  } = options

  let message = fallbackMessage

  if (error?.response?.data) {
    const errorData = error.response.data

    // Handle different error response formats
    if (errorData.detail) {
      message = errorData.detail
    } else if (errorData.message) {
      message = errorData.message
    } else if (errorData.error) {
      message = errorData.error
    } else if (errorData.errors && Array.isArray(errorData.errors)) {
      // Handle validation errors array
      message = errorData.errors.join(', ')
    } else if (typeof errorData === 'string') {
      message = errorData
    }
  } else if (error?.message) {
    // Handle network errors, timeout, etc.
    if (error.code === 'NETWORK_ERROR') {
      message = 'Network connection error. Please check your internet connection.'
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Please try again.'
    } else {
      message = error.message
    }
  }

  // Add context prefix if provided
  if (contextPrefix) {
    message = `${contextPrefix}: ${message}`
  }

  // Add status code if requested
  if (includeStatusCode && error?.response?.status) {
    message = `${message} (${error.response.status})`
  }

  return message
}

/**
 * Create context-specific error formatters
 */
export const createErrorFormatter = (context) => {
  return (error, options = {}) => {
    return formatError(error, {
      contextPrefix: context,
      ...options
    })
  }
}

/**
 * Error handlers for common operations
 */
export const errorHandlers = {
  user: createErrorFormatter('User operation failed'),
  role: createErrorFormatter('Role operation failed'),
  customer: createErrorFormatter('Customer operation failed'),
  contract: createErrorFormatter('Contract operation failed'),
  auth: createErrorFormatter('Authentication failed'),
  api: createErrorFormatter('API operation failed'),
  validation: createErrorFormatter('Validation failed'),
  
  // Generic handlers
  create: createErrorFormatter('Failed to create'),
  update: createErrorFormatter('Failed to update'),
  delete: createErrorFormatter('Failed to delete'),
  fetch: createErrorFormatter('Failed to load'),
}

/**
 * Error type detection utilities
 */
export const errorTypes = {
  isNetworkError: (error) => {
    return !error.response || error.code === 'NETWORK_ERROR'
  },
  
  isTimeoutError: (error) => {
    return error.code === 'ECONNABORTED'
  },
  
  isValidationError: (error) => {
    return error.response?.status === 400 || error.response?.status === 422
  },
  
  isAuthError: (error) => {
    return error.response?.status === 401
  },
  
  isPermissionError: (error) => {
    return error.response?.status === 403
  },
  
  isNotFoundError: (error) => {
    return error.response?.status === 404
  },
  
  isServerError: (error) => {
    return error.response?.status >= 500
  }
}

/**
 * Error recovery suggestions
 */
export const getErrorRecovery = (error) => {
  if (errorTypes.isNetworkError(error)) {
    return {
      message: 'Check your internet connection and try again',
      actions: ['retry', 'refresh']
    }
  }
  
  if (errorTypes.isTimeoutError(error)) {
    return {
      message: 'The request took too long. Try again with a smaller request',
      actions: ['retry', 'reduce_scope']
    }
  }
  
  if (errorTypes.isValidationError(error)) {
    return {
      message: 'Please check the form fields and correct any errors',
      actions: ['fix_form']
    }
  }
  
  if (errorTypes.isAuthError(error)) {
    return {
      message: 'Please log in again to continue',
      actions: ['login']
    }
  }
  
  if (errorTypes.isPermissionError(error)) {
    return {
      message: 'You don\'t have permission to perform this action',
      actions: ['contact_admin']
    }
  }
  
  if (errorTypes.isNotFoundError(error)) {
    return {
      message: 'The requested resource was not found',
      actions: ['go_back', 'refresh']
    }
  }
  
  if (errorTypes.isServerError(error)) {
    return {
      message: 'Server error. Please try again later',
      actions: ['retry_later', 'contact_support']
    }
  }
  
  return {
    message: 'Please try again or contact support if the problem persists',
    actions: ['retry', 'contact_support']
  }
}

/**
 * Enhanced error logging with context
 */
export const logError = (error, context = '', additional = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    ...additional
  }
  
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.group(`🚨 Error: ${context}`)
    console.error('Error Details:', errorInfo)
    console.error('Original Error:', error)
    console.groupEnd()
  }
  
  // In production, you might want to send to error tracking service
  // Example: Sentry, LogRocket, etc.
  if (import.meta.env.MODE === 'production') {
    // sendToErrorService(errorInfo)
  }
  
  return errorInfo
}

/**
 * Toast notification integration for errors
 */
export const showErrorToast = (error, context = '', toastFunction = null) => {
  const message = formatError(error, { contextPrefix: context })
  const recovery = getErrorRecovery(error)
  
  if (toastFunction) {
    toastFunction({
      type: 'error',
      title: 'Error',
      message: message,
      description: recovery.message,
      duration: 5000
    })
  }
  
  logError(error, context)
  return message
}

/**
 * Retry mechanism with exponential backoff
 */
export const createRetryHandler = (operation, maxRetries = 3, baseDelay = 1000) => {
  return async (...args) => {
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(...args)
      } catch (error) {
        lastError = error
        
        // Don't retry on certain error types
        if (errorTypes.isValidationError(error) || 
            errorTypes.isAuthError(error) || 
            errorTypes.isPermissionError(error)) {
          throw error
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying (exponential backoff)
        const delay = baseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        logError(error, `Retry attempt ${attempt}/${maxRetries}`)
      }
    }
    
    throw lastError
  }
}

/**
 * Composable for handling errors in Vue components
 */
export const useErrorHandler = (context = '') => {
  const handleError = (error, options = {}) => {
    const message = formatError(error, {
      contextPrefix: context,
      ...options
    })
    
    logError(error, context)
    return message
  }
  
  const handleAsyncError = async (operation, options = {}) => {
    try {
      return await operation()
    } catch (error) {
      const message = handleError(error, options)
      throw new Error(message)
    }
  }
  
  const withRetry = (operation, retries = 3) => {
    return createRetryHandler(operation, retries)
  }
  
  return {
    handleError,
    handleAsyncError,
    withRetry,
    formatError: (error, options = {}) => formatError(error, options),
    logError: (error, additional = {}) => logError(error, context, additional),
    getRecovery: getErrorRecovery,
    types: errorTypes
  }
}

// Export everything for flexibility
export default {
  formatError,
  createErrorFormatter,
  errorHandlers,
  errorTypes,
  getErrorRecovery,
  logError,
  showErrorToast,
  createRetryHandler,
  useErrorHandler
}
