<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <slot
      :form="form"
      :errors="errors"
      :loading="loading"
      :setField="setField"
      :validateField="validateField"
    />
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
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

const emit = defineEmits(['submit', 'error', 'success'])

const loading = ref(false)
const form = reactive({ ...props.initialData })
const errors = reactive({})

const isValid = computed(() => {
  // Check if there are any non-empty errors
  const hasRealErrors = Object.keys(errors).some(key => errors[key] && errors[key].trim() !== '')
  return !hasRealErrors
})

const setField = (key, value) => {
  form[key] = value
  if (props.validateOnChange) {
    validateField(key, value)
  }
}

const validateField = (key, value) => {
  const rules = props.validationRules[key]
  if (!rules) {
    // Clear error if no rules
    delete errors[key]
    return true
  }

  // Clear previous error
  delete errors[key]

  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors[key] = rules.requiredMessage || `${formatFieldName(key)} is required`
    return false
  }

  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return true
  }

  // Email validation
  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors[key] = rules.emailMessage || 'Please enter a valid email address'
      return false
    }
  }

  // Phone validation
  if (rules.phone && value) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    if (!phoneRegex.test(value)) {
      errors[key] = rules.phoneMessage || 'Please enter a valid phone number'
      return false
    }
  }

  // Min length validation
  if (rules.minLength && value && value.length < rules.minLength) {
    errors[key] = rules.minLengthMessage || `Must be at least ${rules.minLength} characters`
    return false
  }

  // Max length validation
  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors[key] = rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`
    return false
  }

  // Pattern validation
  if (rules.pattern && value) {
    const regex = new RegExp(rules.pattern)
    if (!regex.test(value)) {
      errors[key] = rules.patternMessage || 'Invalid format'
      return false
    }
  }

  // Custom validator
  if (rules.validator && typeof rules.validator === 'function') {
    const result = rules.validator(value, form)
    if (result !== true) {
      errors[key] = result
      return false
    }
  }

  return true
}

const validateAllFields = () => {
  let allValid = true
  Object.keys(props.validationRules).forEach(key => {
    const isFieldValid = validateField(key, form[key])
    if (!isFieldValid) allValid = false
  })
  return allValid
}

const formatFieldName = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const handleSubmit = async () => {
  if (!validateAllFields()) {
    emit('error', 'Please fix the validation errors')
    return
  }

  loading.value = true

  try {
    const result = await props.submitHandler(form)
    emit('success', result)
    emit('submit', result)
  } catch (error) {
    console.error('Form submission failed:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Submission failed'
    emit('error', errorMessage)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = props.initialData[key] || ''
  })
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

// Watch for initial data changes
watch(() => props.initialData, (newData) => {
  Object.assign(form, newData)
}, { deep: true })

// Expose methods for parent components
defineExpose({
  form,
  errors,
  loading,
  isValid,
  validateAllFields,
  validateField,
  setField,
  resetForm,
  handleSubmit
})
</script>
