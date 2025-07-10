<template>
  <BaseModal
    :open="true"
    title="Change Password"
    size="medium"
    :loading="loading"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- Current Password -->
      <FormField
        v-model="form.current_password"
        type="password"
        label="Current Password"
        placeholder="Enter your current password"
        :error="errors.current_password"
        autocomplete="current-password"
        required
      />

      <!-- New Password -->
      <FormField
        v-model="form.new_password"
        type="password"
        label="New Password"
        placeholder="Enter new password"
        :error="errors.new_password"
        autocomplete="new-password"
        required
      />

      <!-- Password strength indicator -->
      <div v-if="form.new_password" class="mt-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Password strength:</span>
          <span :class="getStrengthColorClass(form.new_password)">
            {{ getPasswordStrengthInfo(form.new_password).label }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            :class="getStrengthColorClass(form.new_password, true)"
            class="h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(getPasswordStrength(form.new_password) / 4) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Confirm New Password -->
      <FormField
        v-model="form.confirm_password"
        type="password"
        label="Confirm New Password"
        placeholder="Confirm new password"
        :error="errors.confirm_password"
        autocomplete="new-password"
        required
      />

      <!-- Password Requirements -->
      <div class="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
        <p class="font-medium mb-1">Password Requirements:</p>
        <ul class="space-y-1">
          <li :class="passwordRequirements.length ? 'text-green-600' : 'text-gray-500'">
            • At least 8 characters long
          </li>
          <li :class="passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'">
            • One lowercase letter
          </li>
          <li :class="passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'">
            • One uppercase letter
          </li>
          <li :class="passwordRequirements.number ? 'text-green-600' : 'text-gray-500'">
            • One number
          </li>
          <li :class="passwordRequirements.special ? 'text-green-600' : 'text-gray-500'">
            • One special character (@$!%*?&#+=-_.,;:()[]{}|\/"'`~^&lt;&gt;)
          </li>
        </ul>
      </div>
    </div>

    <!-- ✅ CONSOLIDATED: Error Display with validation feedback -->
    <div v-if="error || (validationAttempted && !isFormValid)" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
      <div v-if="error">{{ error }}</div>
      <div v-else-if="validationAttempted && !isFormValid">
        Please fix the validation errors above before submitting.
      </div>
    </div>

    <!-- Success Display -->
    <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
      {{ success }}
    </div>

    <!-- Security Notice -->
    <div class="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
      <div class="flex">
        <ActionIcon name="info" size="sm" class="text-blue-400 mr-2" />
        <div class="text-sm text-blue-800">
          Changing your password will log you out of all devices and you'll need to log in again.
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button type="button" @click="$emit('close')" class="btn btn-outline">
          Cancel
        </button>
        <!-- ✅ CONSOLIDATED: Button with validation feedback -->
        <button
          type="button"
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          :class="[
            'btn',
            isFormValid ? 'btn-primary' : 'btn-primary opacity-50 cursor-not-allowed'
          ]"
        >
          {{ loading ? 'Changing Password...' : 'Change Password' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/forms/FormField.vue'
import ActionIcon from '@/components/icons/ActionIcons.vue'
import api from '@/services/api'
import { useErrorHandler } from '@/utils/errorHandling'
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthInfo,
  PASSWORD_POLICY,
  hasSpecialCharacters
} from '@/utils/passwordValidation'

const emit = defineEmits(['close', 'updated'])

// ✅ CONSOLIDATED: Use centralized error handler
const { handleError } = useErrorHandler('Password Change')

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const errors = ref({})
const validationAttempted = ref(false) // ✅ CONSOLIDATED: Track validation attempts

const form = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// ✅ CONSOLIDATED: Consolidated form validation (same pattern as FormModal)
const isFormValid = computed(() => {
  // Check if there are any non-empty errors
  const hasRealErrors = Object.keys(errors.value).some(key => errors.value[key] && errors.value[key].trim() !== '')

  return form.value.current_password &&
         form.value.new_password &&
         form.value.confirm_password &&
         !passwordMismatch.value &&
         validatePassword(form.value.new_password) === true &&
         !hasRealErrors
})

// ✅ CONSOLIDATED: Password requirements (same as other modals)
const passwordRequirements = computed(() => {
  const pwd = form.value.new_password
  if (!pwd) {
    return {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    }
  }

  return {
    length: pwd.length >= PASSWORD_POLICY.minLength,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: hasSpecialCharacters(pwd)
  }
})

// Password mismatch computed property
const passwordMismatch = computed(() => {
  return form.value.new_password &&
         form.value.confirm_password &&
         form.value.new_password !== form.value.confirm_password
})

// ✅ CONSOLIDATED: Password strength helper functions (same as other modals)
const getStrengthColorClass = (password, isBar = false) => {
  const strength = getPasswordStrength(password)
  const prefix = isBar ? 'bg-' : 'text-'

  const colorMap = {
    0: `${prefix}red-500`,
    1: `${prefix}red-500`,
    2: `${prefix}yellow-500`,
    3: `${prefix}blue-500`,
    4: `${prefix}green-500`
  }

  return colorMap[strength] || `${prefix}gray-400`
}

const clearMessages = () => {
  error.value = null
  success.value = null
  errors.value = {}
}

// ✅ CONSOLIDATED: Validation with immediate feedback after first attempt
const validateForm = () => {
  errors.value = {}
  validationAttempted.value = true

  // Validate current password
  if (!form.value.current_password) {
    errors.value.current_password = 'Current password is required'
  }

  // Validate new password
  const passwordValidation = validatePassword(form.value.new_password)
  if (passwordValidation !== true) {
    errors.value.new_password = passwordValidation
  }

  // Validate password confirmation
  if (!form.value.confirm_password) {
    errors.value.confirm_password = 'Please confirm your password'
  } else if (form.value.new_password !== form.value.confirm_password) {
    errors.value.confirm_password = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

// ✅ CONSOLIDATED: Submit with validation feedback
const handleSubmit = async () => {
  clearMessages()

  if (!validateForm()) {
    // Focus on first field with error
    const firstErrorField = Object.keys(errors.value)[0]
    if (firstErrorField) {
      setTimeout(() => {
        const element = document.querySelector(`input[name="${firstErrorField}"], input[type="password"]`)
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
    return
  }

  if (form.value.current_password === form.value.new_password) {
    error.value = 'New password must be different from current password'
    return
  }

  loading.value = true

  try {
    await api.post('/auth/change-password', {
      current_password: form.value.current_password,
      new_password: form.value.new_password
    })

    success.value = 'Password changed successfully! You will be logged out shortly.'

    // Clear form
    form.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
    validationAttempted.value = false // Reset validation state

    // Close modal and refresh after a delay
    setTimeout(() => {
      emit('updated')
      // Optionally redirect to login or refresh the page
      window.location.reload()
    }, 2000)
  } catch (err) {
    // Special handling for password change errors
    if (err.response?.status === 400 && err.response?.data?.message?.includes('password')) {
      error.value = 'Current password is incorrect'
    } else {
      error.value = handleError(err)
    }
  } finally {
    loading.value = false
  }
}

// ✅ CONSOLIDATED: Watch for form changes to provide real-time validation feedback after first attempt
watch(() => form.value.confirm_password, (newValue) => {
  if (!validationAttempted.value) return // Only validate after first attempt

  if (newValue && form.value.new_password) {
    if (newValue !== form.value.new_password) {
      errors.value.confirm_password = 'Passwords do not match'
    } else {
      delete errors.value.confirm_password
    }
  } else if (!newValue) {
    delete errors.value.confirm_password
  }
})

watch(() => form.value.new_password, (newValue) => {
  if (!validationAttempted.value) return // Only validate after first attempt

  if (newValue) {
    const validation = validatePassword(newValue)
    if (validation !== true) {
      errors.value.new_password = validation
    } else {
      delete errors.value.new_password
    }

    // Check confirmation match if confirm password exists
    if (form.value.confirm_password) {
      if (newValue === form.value.confirm_password) {
        delete errors.value.confirm_password
      } else {
        errors.value.confirm_password = 'Passwords do not match'
      }
    }
  } else {
    delete errors.value.new_password
  }
})

watch(() => form.value.current_password, (newValue) => {
  if (!validationAttempted.value) return // Only validate after first attempt

  if (newValue) {
    delete errors.value.current_password
  }
})
</script>
