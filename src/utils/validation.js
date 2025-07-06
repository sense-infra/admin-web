// src/utils/validation.js
// Consolidated validation utilities for frontend uniqueness checking

/**
 * Creates a uniqueness validator for any field across any entity type
 * @param {Object} options - Configuration object
 * @param {Array} options.items - Array of existing items to check against
 * @param {String} options.field - Field name to check (e.g., 'username', 'email', 'name')
 * @param {String} options.idField - ID field name (e.g., 'user_id', 'role_id', 'customer_id')
 * @param {Object} options.currentItem - Current item being edited (null for create mode)
 * @param {Boolean} options.caseSensitive - Whether comparison should be case sensitive (default: false)
 * @param {String} options.errorMessage - Custom error message (optional)
 * @returns {Function} Validator function
 */
export function createUniquenessValidator(options) {
  const {
    items = [],
    field,
    idField,
    currentItem = null,
    caseSensitive = false,
    errorMessage = null
  } = options

  return (value) => {
    if (!value || !field) return true

    const compareValue = caseSensitive ? value : value.toLowerCase()
    const isEditing = !!(currentItem && currentItem[idField])

    if (!isEditing) {
      // Create mode - check if value already exists
      const existingItem = items.find(item => {
        const itemValue = item[field]
        if (!itemValue) return false
        const compareItemValue = caseSensitive ? itemValue : itemValue.toLowerCase()
        return compareItemValue === compareValue
      })

      if (existingItem) {
        return errorMessage || `This ${field.replace(/_/g, ' ')} is already taken`
      }
    } else {
      // Edit mode - check if value changed and if new value exists
      const currentValue = currentItem[field]
      if (currentValue !== value) {
        const existingItem = items.find(item => {
          const itemValue = item[field]
          if (!itemValue) return false
          const compareItemValue = caseSensitive ? itemValue : itemValue.toLowerCase()
          return compareItemValue === compareValue && item[idField] !== currentItem[idField]
        })

        if (existingItem) {
          return errorMessage || `This ${field.replace(/_/g, ' ')} is already taken`
        }
      }
    }

    return true
  }
}

/**
 * Creates a comprehensive validator that combines multiple validation rules
 * @param {Array} validators - Array of validator functions or objects
 * @returns {Function} Combined validator function
 */
export function createCombinedValidator(validators) {
  return (value, formData) => {
    for (const validator of validators) {
      let result
      
      if (typeof validator === 'function') {
        result = validator(value, formData)
      } else if (validator.validator && typeof validator.validator === 'function') {
        result = validator.validator(value, formData)
      }
      
      if (result !== true) {
        return result
      }
    }
    
    return true
  }
}

/**
 * Common validation rules that can be reused across components
 */
export const commonValidators = {
  required: (fieldName) => (value) => {
    if (typeof value === 'boolean') return true // Booleans are always valid for required
    if (!value || value.toString().trim() === '') {
      return `${fieldName.replace(/_/g, ' ')} is required`
    }
    return true
  },

  email: () => (value) => {
    if (!value) return true // Skip if empty (use required validator separately)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return true
  },

  minLength: (min) => (value) => {
    if (!value) return true // Skip if empty
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return true
  },

  maxLength: (max) => (value) => {
    if (!value) return true // Skip if empty
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return true
  },

  alphanumericUnderscore: () => (value) => {
    if (!value) return true // Skip if empty
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Can only contain letters, numbers, and underscores'
    }
    return true
  },

  noSpaces: () => (value) => {
    if (!value) return true // Skip if empty
    if (/\s/.test(value)) {
      return 'Cannot contain spaces'
    }
    return true
  },

  url: () => (value) => {
    if (!value) return true // Skip if empty
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }
}

/**
 * Validation rule builder for easy creation of validation rules
 */
export class ValidationRuleBuilder {
  constructor() {
    this.validators = []
    this.isRequired = false
  }

  required(fieldName) {
    this.isRequired = true
    this.validators.push(commonValidators.required(fieldName))
    return this
  }

  email() {
    this.validators.push(commonValidators.email())
    return this
  }

  minLength(min) {
    this.validators.push(commonValidators.minLength(min))
    return this
  }

  maxLength(max) {
    this.validators.push(commonValidators.maxLength(max))
    return this
  }

  alphanumericUnderscore() {
    this.validators.push(commonValidators.alphanumericUnderscore())
    return this
  }

  noSpaces() {
    this.validators.push(commonValidators.noSpaces())
    return this
  }

  url() {
    this.validators.push(commonValidators.url())
    return this
  }

  unique(options) {
    this.validators.push(createUniquenessValidator(options))
    return this
  }

  custom(validator) {
    this.validators.push(validator)
    return this
  }

  build() {
    return {
      required: this.isRequired,
      validator: createCombinedValidator(this.validators)
    }
  }
}

/**
 * Helper function to create validation rules easily
 * @returns {ValidationRuleBuilder} New validation rule builder
 */
export function validation() {
  return new ValidationRuleBuilder()
}

// Export password validation from existing file
export { validatePassword } from './passwordValidation.js'
