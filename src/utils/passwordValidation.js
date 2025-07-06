/**
 * Unified password validation utility for Sense Security Platform
 * Ensures consistent password policies across all components
 */

// Password policy configuration
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '@$!%*?&#+=-_.,;:()[]{}|\\/"\'`~^<>'
}

/**
 * Validate a password against the security policy
 * @param {string} password - The password to validate
 * @param {boolean} isRequired - Whether the password field is required
 * @returns {string|true} - Error message or true if valid
 */
export const validatePassword = (password, isRequired = true) => {
  // Handle empty password
  if (!password || password.trim() === '') {
    return isRequired ? 'Password is required' : true
  }

  const pwd = password.trim()

  // Length validation
  if (pwd.length < PASSWORD_POLICY.minLength) {
    return `Password must be at least ${PASSWORD_POLICY.minLength} characters long`
  }

  if (pwd.length > PASSWORD_POLICY.maxLength) {
    return `Password must be no more than ${PASSWORD_POLICY.maxLength} characters long`
  }

  // Character type requirements
  const validationErrors = []

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(pwd)) {
    validationErrors.push('one lowercase letter')
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(pwd)) {
    validationErrors.push('one uppercase letter')
  }

  if (PASSWORD_POLICY.requireNumber && !/\d/.test(pwd)) {
    validationErrors.push('one number')
  }

  if (PASSWORD_POLICY.requireSpecialChar) {
    // Simple check: test if password contains any character from our special chars string
    let hasSpecialChar = false
    for (let i = 0; i < pwd.length; i++) {
      if (PASSWORD_POLICY.specialChars.includes(pwd[i])) {
        hasSpecialChar = true
        break
      }
    }
    if (!hasSpecialChar) {
      validationErrors.push(`one special character (${PASSWORD_POLICY.specialChars})`)
    }
  }

  if (validationErrors.length > 0) {
    return `Password must contain at least ${validationErrors.join(', ')}`
  }

  return true
}

/**
 * Check if password contains special characters (simple version)
 * @param {string} password - The password to check
 * @returns {boolean} - True if contains special characters
 */
export const hasSpecialCharacters = (password) => {
  if (!password) return false
  for (let i = 0; i < password.length; i++) {
    if (PASSWORD_POLICY.specialChars.includes(password[i])) {
      return true
    }
  }
  return false
}

/**
 * Get password strength score (0-4)
 * @param {string} password - The password to evaluate
 * @returns {number} - Strength score from 0 (weakest) to 4 (strongest)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0

  let score = 0
  const pwd = password.trim()

  // Length scoring
  if (pwd.length >= PASSWORD_POLICY.minLength) score++
  if (pwd.length >= 12) score++

  // Character diversity scoring
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++

  const specialCharRegex = new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
  if (specialCharRegex.test(pwd)) score++

  return Math.min(score, 4)
}

/**
 * Get password strength label
 * @param {string} password - The password to evaluate
 * @returns {object} - Object with strength level and color
 */
export const getPasswordStrengthInfo = (password) => {
  const strength = getPasswordStrength(password)
  
  const strengthMap = {
    0: { label: 'Very Weak', color: 'red' },
    1: { label: 'Weak', color: 'red' },
    2: { label: 'Fair', color: 'yellow' },
    3: { label: 'Good', color: 'blue' },
    4: { label: 'Strong', color: 'green' }
  }

  return strengthMap[strength]
}

/**
 * Generate a secure random password
 * @param {number} length - Length of password to generate (default: 12)
 * @returns {string} - Generated password
 */
export const generateSecurePassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specials = '@$!%*?&#+-='
  
  const allChars = lowercase + uppercase + numbers + specials
  
  let password = ''
  
  // Ensure at least one character from each required type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specials[Math.floor(Math.random() * specials.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Password validation rules for FormField components
 * @param {boolean} isEditing - Whether this is an edit operation
 * @param {boolean} isRequired - Whether password is required
 * @returns {object} - Validation rule object for FormField
 */
export const getPasswordValidationRule = (isEditing = false, isRequired = true) => {
  return {
    validator: (value) => {
      // For editing, password is optional unless specifically provided
      const required = isEditing ? false : isRequired
      return validatePassword(value, required)
    }
  }
}

/**
 * Validation rules for password confirmation
 * @param {object} form - The form object containing the original password
 * @param {string} passwordField - The field name of the original password (default: 'password')
 * @returns {object} - Validation rule object for password confirmation
 */
export const getPasswordConfirmationRule = (form, passwordField = 'password') => {
  return {
    validator: (value) => {
      if (!value && form[passwordField]) {
        return 'Please confirm your password'
      }
      if (value !== form[passwordField]) {
        return 'Passwords do not match'
      }
      return true
    }
  }
}
