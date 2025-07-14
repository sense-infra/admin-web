<template>
  <BaseModal
    :open="open"
    :title="title"
    :size="size"
    :loading="loading"
    :error="error"
    @close="handleClose"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isEditing ? `Edit ${entityName}` : `Create ${entityName}` }}
      </h3>
    </template>

    <form @submit.prevent="handleSubmit">
      <slot
        :form="form"
        :errors="errors"
        :isEditing="isEditing"
        :isFormValid="isFormValid"
        :updateField="updateField"
        :validateField="validateField"
        :clearError="clearError"
      />
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="handleClose"
          class="btn btn-outline"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          type="submit"
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          :class="[
            'btn',
            isFormValid ? 'btn-primary' : 'btn-primary opacity-50 cursor-not-allowed'
          ]"
        >
          {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  entityName: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium'
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  validationRules: {
    type: Object,
    default: () => ({})
  },
  submitHandler: {
    type: Function,
    required: true
  },
  validateOnChange: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref('')
const form = ref({})
const errors = ref({})
const fieldInteracted = ref({}) // Track interaction per field
const validationAttempted = ref(false) // Track if user has tried to submit

// Enhanced edit mode detection
const isEditing = computed(() => {
  if (!props.initialData) return false

  // Look for common ID fields that indicate editing mode
  return !!(
    props.initialData.id ||
    props.initialData.user_id ||
    props.initialData.customer_id ||
    props.initialData.contract_id ||
    props.initialData.role_id ||
    props.initialData.nvr_id ||
    props.initialData.camera_id ||
    props.initialData.controller_id ||
    props.initialData.api_key_id ||
    // Generic check for any field ending with _id that has a value
    Object.keys(props.initialData).some(key =>
      key.endsWith('_id') &&
      props.initialData[key] !== null &&
      props.initialData[key] !== undefined &&
      props.initialData[key] !== ''
    )
  )
})

// FIXED: Enhanced form validation that properly handles complex objects like permissions
const isFormValid = computed(() => {
  // First check if we have any explicit validation errors
  const hasErrors = Object.keys(errors.value).some(key => errors.value[key])
  if (hasErrors) {
    return false
  }

  // Then check all validation rules
  const allRulesValid = Object.keys(props.validationRules).every(key => {
    const rule = props.validationRules[key]
    const value = form.value[key]

    // Check required fields
    if (rule.required) {
      // For boolean fields, false is a valid value
      if (typeof value === 'boolean') {
        return true
      }

      // For objects (like permissions), check if they have content
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.length > 0
        } else {
          // For objects like permissions, check if they have any keys with content
          const objectKeys = Object.keys(value)
          if (objectKeys.length === 0) {
            return false
          }
          
          // Check if any resource has at least one action
          return objectKeys.some(resource => {
            const actions = value[resource]
            if (Array.isArray(actions)) {
              return actions.length > 0
            }
            return !!actions
          })
        }
      }

      // For primitive values
      return value !== undefined && value !== null && value !== ''
    }

    // If not required, it's valid
    return true
  })

  if (!allRulesValid) {
    return false
  }

  // Run custom validators
  const customValidationValid = Object.keys(props.validationRules).every(key => {
    const rule = props.validationRules[key]
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(form.value[key], form.value)
      return result === true
    }
    return true
  })

  return customValidationValid
})

// ✅ FIX: Add the missing updateField function
const updateField = (fieldName, value) => {
  // Update the form value
  form.value[fieldName] = value

  // Mark field as interacted
  fieldInteracted.value[fieldName] = true

  // Clear any existing error for this field
  if (errors.value[fieldName]) {
    errors.value[fieldName] = ''
  }

  // Clear the general error message when user starts fixing issues
  if (error.value === 'Please fix the validation errors above before submitting.') {
    error.value = ''
  }

  // Validate if enabled
  if (props.validateOnChange) {
    validateField(fieldName, value, false)
  }
}

// Helper to clear specific error
const clearError = (fieldName) => {
  errors.value[fieldName] = ''
}

// ENHANCED: Validation that shows errors immediately when user interacts OR after first submit attempt
const validateField = (key, value, immediate = false) => {
  const rules = props.validationRules[key]
  if (!rules) {
    return
  }

  // Clear previous error first
  errors.value[key] = ''

  // If there's a custom validator, use it exclusively
  if (rules.validator && typeof rules.validator === 'function') {
    const result = rules.validator(value, form.value)

    if (result !== true) {
      // Show error if field has been interacted with OR immediate validation (submit) OR after first validation attempt
      if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
        errors.value[key] = result
      }
      return
    }
    return // If custom validator passes, skip other validations
  }

  // Required validation
  if (rules.required) {
    if (typeof value === 'boolean') {
      // Boolean fields are always valid for required check
      return
    } else if (typeof value === 'object' && value !== null) {
      // Handle objects like permissions
      if (Array.isArray(value)) {
        if (value.length === 0) {
          if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
            errors.value[key] = `At least one ${key.replace(/_/g, ' ')} must be selected`
          }
          return
        }
      } else {
        // For objects like permissions, check if they have any content
        const objectKeys = Object.keys(value)
        if (objectKeys.length === 0) {
          if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
            errors.value[key] = `At least one ${key.replace(/_/g, ' ')} must be selected`
          }
          return
        }
        
        // Check if any resource has at least one action
        const hasAnyPermission = objectKeys.some(resource => {
          const actions = value[resource]
          if (Array.isArray(actions)) {
            return actions.length > 0
          }
          return !!actions
        })

        if (!hasAnyPermission) {
          if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
            errors.value[key] = `At least one ${key.replace(/_/g, ' ')} must be selected`
          }
          return
        }
      }
    } else if (!value || value.toString().trim() === '') {
      if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
        errors.value[key] = `${key.replace(/_/g, ' ')} is required`
      }
      return
    }
  }

  // Skip other validations if field is empty and not required
  if (!value && !rules.required) return

  // Email validation
  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
        errors.value[key] = 'Please enter a valid email address'
      }
      return
    }
  }

  // Min length validation
  if (rules.minLength && value && value.length < rules.minLength) {
    if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
      errors.value[key] = `Must be at least ${rules.minLength} characters`
    }
    return
  }

  // Max length validation
  if (rules.maxLength && value && value.length > rules.maxLength) {
    if (immediate || fieldInteracted.value[key] || validationAttempted.value) {
      errors.value[key] = `Must be no more than ${rules.maxLength} characters`
    }
    return
  }
}

const validateForm = () => {
  // ENHANCED: Mark that validation has been attempted
  validationAttempted.value = true

  // Force mark all fields as interacted when validating full form (on submit)
  Object.keys(props.validationRules).forEach(key => {
    fieldInteracted.value[key] = true
  })

  Object.keys(props.validationRules).forEach(key => {
    validateField(key, form.value[key], true) // immediate = true for submit validation
  })
  return isFormValid.value
}

// ENHANCED: Submit handler with better feedback
const handleSubmit = async () => {
  // Always validate first
  if (!validateForm()) {
    // ENHANCED: Show general error message when validation fails
    error.value = 'Please fix the validation errors above before submitting.'

    // Focus on first field with error
    const firstErrorField = Object.keys(errors.value).find(key => errors.value[key])
    if (firstErrorField) {
      // Try to focus the field
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}, [id*="${firstErrorField}"]`)
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }

    return
  }

  loading.value = true
  error.value = '' // Clear any previous error messages

  try {
    const result = await props.submitHandler(form.value, isEditing.value)

    // Handle generated passwords or other response data
    if (result && result.password) {
      emit('saved', result)
    } else {
      emit('saved', result)
    }
  } catch (err) {
    console.error('Form submission failed:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to save'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const resetForm = () => {
  form.value = {}
  errors.value = {}
  error.value = ''
  fieldInteracted.value = {} // Reset field interaction tracking
  validationAttempted.value = false // Reset validation attempt tracking
}

// FIXED: Proper initialization with deep cloning for objects
const initializeForm = () => {
  // Initialize form with default values or initial data
  const defaultForm = {}

  // First, set up defaults from validation rules
  Object.keys(props.validationRules).forEach(key => {
    defaultForm[key] = ''
  })

  // Then override with actual initial data, preserving data types and deep cloning objects
  if (props.initialData) {
    Object.keys(props.initialData).forEach(key => {
      const value = props.initialData[key]

      if (typeof value === 'boolean') {
        // Preserve boolean values as-is
        defaultForm[key] = value
      } else if (typeof value === 'object' && value !== null) {
        // Deep clone objects (like permissions) to avoid reference issues
        if (Array.isArray(value)) {
          defaultForm[key] = [...value]
        } else {
          defaultForm[key] = JSON.parse(JSON.stringify(value))
        }
      } else if (value !== undefined && value !== null) {
        // For non-null/undefined values, use them directly
        defaultForm[key] = value
      } else {
        // For null/undefined, use empty string as default (unless already set from validation rules)
        if (defaultForm[key] === undefined) {
          defaultForm[key] = ''
        }
      }
    })
  }

  form.value = { ...defaultForm }
  // Don't show validation errors initially - only clear them
  errors.value = {}
}

// Initialize form when modal opens or initial data changes
watch([() => props.open, () => props.initialData], () => {
  if (props.open) {
    fieldInteracted.value = {} // Reset field-level interaction tracking
    validationAttempted.value = false // Reset validation attempt tracking
    error.value = '' // Clear any error messages
    initializeForm()
  }
}, { immediate: true })

onMounted(() => {
  if (props.open) {
    initializeForm()
  }
})

// Expose form and validation methods for parent components
defineExpose({
  form,
  errors,
  validateForm,
  resetForm,
  isFormValid,
  updateField,
  validateField
})
</script>
