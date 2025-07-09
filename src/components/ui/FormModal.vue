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
      <slot :form="form" :errors="errors" :isEditing="isEditing" :isFormValid="isFormValid" />
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
const validationAttempted = ref(false) // NEW: Track if user has tried to submit

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
    // Generic check for any field ending with _id that has a value
    Object.keys(props.initialData).some(key =>
      key.endsWith('_id') &&
      props.initialData[key] !== null &&
      props.initialData[key] !== undefined &&
      props.initialData[key] !== ''
    )
  )
})

const isFormValid = computed(() => {
  // Check if all required fields are filled and no validation errors
  const hasErrors = Object.keys(errors.value).some(key => errors.value[key])
  const hasRequiredFields = Object.keys(props.validationRules).every(key => {
    const rule = props.validationRules[key]
    if (rule.required) {
      const value = form.value[key]
      // For boolean fields, false is a valid value
      if (typeof value === 'boolean') return true
      return value !== undefined && value !== null && value !== ''
    }
    return true
  })
  return !hasErrors && hasRequiredFields
})

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

// FIXED: Proper boolean handling in form initialization
const initializeForm = () => {
  // Initialize form with default values or initial data
  const defaultForm = {}

  // First, set up defaults from validation rules
  Object.keys(props.validationRules).forEach(key => {
    defaultForm[key] = ''
  })

  // Then override with actual initial data, preserving data types
  if (props.initialData) {
    Object.keys(props.initialData).forEach(key => {
      const value = props.initialData[key]

      if (typeof value === 'boolean') {
        // Preserve boolean values as-is
        defaultForm[key] = value
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

// FIXED: Proper tracking of field changes with manual comparison
const previousFormValues = ref({})

// Watch individual form fields instead of the whole form object
const setupFieldWatchers = () => {
  // Watch each field individually to avoid reactivity issues
  Object.keys(props.validationRules).forEach(fieldKey => {
    watch(() => form.value[fieldKey], (newValue, oldValue) => {
      if (!props.validateOnChange) return

      // Skip initial setup where oldValue is undefined
      if (oldValue === undefined) {
        return
      }

      // Mark field as interacted immediately
      fieldInteracted.value[fieldKey] = true

      // Validate immediately
      if (props.validationRules[fieldKey]) {
        validateField(fieldKey, newValue, false)
      }
    }, { immediate: false })
  })
}

// Initialize form when modal opens or initial data changes
watch([() => props.open, () => props.initialData], () => {
  if (props.open) {
    fieldInteracted.value = {} // Reset field-level interaction tracking
    validationAttempted.value = false // Reset validation attempt tracking
    initializeForm()
    // Setup field watchers after form is initialized
    setupFieldWatchers()
  }
}, { immediate: true })

onMounted(() => {
  if (props.open) {
    initializeForm()
    setupFieldWatchers()
  }
})

// Expose form and validation methods for parent components
defineExpose({
  form,
  errors,
  validateForm,
  resetForm,
  isFormValid
})
</script>
