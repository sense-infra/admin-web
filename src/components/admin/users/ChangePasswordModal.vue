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

      <!-- Password Match Validation -->
      <div v-if="passwordMismatch" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
        ⚠️ Passwords do not match
      </div>

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

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Success Display -->
    <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
      {{ success }}
    </div>

    <!-- Security Notice -->
    <div class="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
      <div class="flex">
        <svg class="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
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
        <button
          type="button"
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          class="btn btn-primary"
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
import api from '@/services/api'
import { 
  validatePassword, 
  getPasswordStrength, 
  getPasswordStrengthInfo,
  PASSWORD_POLICY,
  hasSpecialCharacters
} from '@/utils/passwordValidation'

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const errors = ref({})

const form = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

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

// Password requirements computed property
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

// Password strength helper functions
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

const validateForm = () => {
  errors.value = {}

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

const handleSubmit = async () => {
  clearMessages()

  if (!validateForm()) {
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

    // Close modal and refresh after a delay
    setTimeout(() => {
      emit('updated')
      // Optionally redirect to login or refresh the page
      window.location.reload()
    }, 2000)
  } catch (err) {
    console.error('Failed to change password:', err)
    if (err.response?.status === 400 && err.response?.data?.message?.includes('password')) {
      error.value = 'Current password is incorrect'
    } else {
      error.value = err.response?.data?.message || 'Failed to change password'
    }
  } finally {
    loading.value = false
  }
}

// Watch for form changes to provide real-time validation feedback
watch(() => form.value.confirm_password, (newValue) => {
  if (newValue && form.value.new_password) {
    if (newValue !== form.value.new_password) {
      errors.value.confirm_password = 'Passwords do not match'
    } else {
      // Clear the error when passwords match
      delete errors.value.confirm_password
    }
  } else if (!newValue) {
    // Clear error when field is empty
    delete errors.value.confirm_password
  }
})

watch(() => form.value.new_password, (newValue) => {
  // Validate new password and log for debugging
  if (newValue) {
    const validation = validatePassword(newValue)
    
    if (validation !== true) {
      errors.value.new_password = validation
    } else {
      // Clear the error when password is valid
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
    // Clear error when field is empty
    delete errors.value.new_password
  }
})

// Also add a watcher for current_password to clear its error
watch(() => form.value.current_password, (newValue) => {
  if (newValue) {
    delete errors.value.current_password
  }
})
</script>
