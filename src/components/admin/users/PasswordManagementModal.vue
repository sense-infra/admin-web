<template>
  <BaseModal
    :open="true"
    :title="`Manage Password - ${user.username}`"
    size="medium"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- User Information -->
      <div class="bg-gray-50 p-3 rounded">
        <div class="text-sm text-gray-600">
          <div><strong>User:</strong> {{ user.username }}</div>
          <div><strong>Email:</strong> {{ user.email }}</div>
          <div><strong>Role:</strong> {{ user.role?.name }}</div>
          <div v-if="user.last_login">
            <strong>Last Login:</strong> {{ formatDate(user.last_login) }}
          </div>
        </div>
      </div>

      <!-- Manual Password Reset -->
      <div class="border-t pt-4">
        <h4 class="font-medium text-gray-900 mb-3">Set Custom Password</h4>
        <form @submit.prevent="handleManualReset">
          <div class="space-y-3">
            <FormField
              v-model="manualPassword"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              :error="passwordError"
              required
            />

            <!-- Password strength indicator -->
            <div v-if="manualPassword" class="mt-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Password strength:</span>
                <span :class="getStrengthColorClass(manualPassword)">
                  {{ getPasswordStrengthInfo(manualPassword).label }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  :class="getStrengthColorClass(manualPassword, true)"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(getPasswordStrength(manualPassword) / 4) * 100}%` }"
                ></div>
              </div>
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

            <!-- ENHANCED: Button with validation feedback -->
            <button
              type="submit"
              :disabled="loading || !isPasswordValid"
              :class="[
                'btn w-full',
                isPasswordValid ? 'btn-primary' : 'btn-primary opacity-50 cursor-not-allowed'
              ]"
            >
              {{ loading ? 'Setting Password...' : 'Set Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Generate Random Password -->
      <div class="border-t pt-4">
        <h4 class="font-medium text-gray-900 mb-3">Generate Random Password</h4>
        <button
          @click="handleGeneratePassword"
          :disabled="loading"
          class="btn btn-secondary w-full"
        >
          {{ loading ? 'Generating...' : 'Generate Random Password' }}
        </button>
      </div>

      <!-- Generated Password Display -->
      <div v-if="generatedPassword" class="mt-4 p-3 bg-green-100 border border-green-200 rounded">
        <p class="text-sm text-green-800">
          <strong>New Password:</strong>
          <code class="bg-green-50 px-2 py-1 rounded">{{ generatedPassword }}</code>
        </p>
        <p class="text-xs text-green-600 mt-1">
          Password has been set successfully. Please provide this to the user.
        </p>
        <div class="flex space-x-2 mt-2">
          <button
            @click="copyToClipboard(generatedPassword)"
            class="btn btn-sm btn-secondary"
          >
            Copy Password
          </button>
          <button
            @click="clearGeneratedPassword"
            class="btn btn-sm btn-outline"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- ENHANCED: Error Display with validation messages -->
      <div v-if="error || validationAttempted && !isPasswordValid" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
        <div v-if="error">{{ error }}</div>
        <div v-else-if="validationAttempted && !isPasswordValid">
          Please enter a valid password that meets all requirements.
        </div>
      </div>

      <!-- Success Display -->
      <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
        {{ success }}
      </div>

      <!-- Security Notice -->
      <div class="border-t pt-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div class="text-sm text-yellow-800">
              <strong>Security Notice:</strong> Changing the password will invalidate all active sessions for this user, forcing them to log in again.
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="btn btn-outline">
        Close
      </button>
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
import { formatDate } from '@/utils/formatters'
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthInfo,
  generateSecurePassword,
  PASSWORD_POLICY,
  hasSpecialCharacters
} from '@/utils/passwordValidation'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

// ✅ CONSOLIDATED: Use centralized error handler
const { handleError } = useErrorHandler('Password Management')

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const manualPassword = ref('')
const generatedPassword = ref(null)
const passwordError = ref('')
const validationAttempted = ref(false) // ENHANCED: Track validation attempts

// ✅ CONSOLIDATED: Consolidated password validation
const isPasswordValid = computed(() => {
  if (!manualPassword.value) return false
  const validation = validatePassword(manualPassword.value)
  passwordError.value = validation === true ? '' : validation
  return validation === true
})

// ✅ CONSOLIDATED: Password requirements computed property
const passwordRequirements = computed(() => {
  const pwd = manualPassword.value
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

// ✅ CONSOLIDATED: Password strength helper functions (same as UserFormModal)
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
}

const clearGeneratedPassword = () => {
  generatedPassword.value = null
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    success.value = 'Password copied to clipboard'
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    error.value = 'Failed to copy to clipboard'
  }
}

// ✅ CONSOLIDATED: Manual reset with validation feedback
const handleManualReset = async () => {
  validationAttempted.value = true // Mark that user tried to submit

  if (!isPasswordValid.value) {
    // Show validation feedback and focus the field
    setTimeout(() => {
      const passwordField = document.querySelector('input[type="password"]')
      if (passwordField) {
        passwordField.focus()
      }
    }, 100)
    return
  }

  loading.value = true
  clearMessages()

  try {
    await api.post(`/auth/users/${props.user.user_id}/reset-password`, {
      new_password: manualPassword.value
    })

    success.value = 'Password has been set successfully'
    manualPassword.value = ''
    generatedPassword.value = null
    validationAttempted.value = false // Reset validation state

    setTimeout(() => {
      emit('updated')
    }, 2000)
  } catch (err) {
    error.value = handleError(err)
  } finally {
    loading.value = false
  }
}

const handleGeneratePassword = async () => {
  loading.value = true
  clearMessages()

  try {
    // Generate a secure password locally first
    const newPassword = generateSecurePassword(12)

    // Send the generated password to the server
    await api.post(`/auth/users/${props.user.user_id}/reset-password`, {
      new_password: newPassword
    })

    generatedPassword.value = newPassword
    success.value = 'Random password generated successfully'
    manualPassword.value = ''
    validationAttempted.value = false // Reset validation state

    setTimeout(() => {
      if (!generatedPassword.value) {
        emit('updated')
      }
    }, 2000)
  } catch (err) {
    error.value = handleError(err)
  } finally {
    loading.value = false
  }
}

// ✅ CONSOLIDATED: Watch for password changes to provide real-time feedback after first attempt
watch(() => manualPassword.value, () => {
  if (validationAttempted.value) {
    // Clear error state when user starts typing after failed validation
    if (error.value && error.value.includes('valid password')) {
      error.value = null
    }
  }
})
</script>
