<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Manage Password - {{ user.username }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                <div>
                  <label for="new_password" class="form-label">New Password</label>
                  <input
                    id="new_password"
                    v-model="manualPassword"
                    type="password"
                    required
                    class="form-input"
                    placeholder="Enter new password"
                    minlength="8"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Minimum 8 characters required
                  </p>
                </div>
                <button 
                  type="submit" 
                  :disabled="loading || !manualPassword || manualPassword.length < 8"
                  class="btn btn-primary w-full"
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

          <!-- Error Display -->
          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ error }}
          </div>

          <!-- Success Display -->
          <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
            {{ success }}
          </div>

          <!-- Security Notice -->
          <div class="border-t pt-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div class="flex">
                <svg class="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="text-sm text-yellow-800">
                  <strong>Security Notice:</strong> Changing the password will invalidate all active sessions for this user, forcing them to log in again.
                </div>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <div class="flex justify-end pt-4">
            <button @click="$emit('close')" class="btn btn-outline">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const manualPassword = ref('')
const generatedPassword = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
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

const handleManualReset = async () => {
  if (!manualPassword.value || manualPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
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
    
    setTimeout(() => {
      emit('updated')
    }, 2000)
  } catch (err) {
    console.error('Failed to reset password:', err)
    error.value = err.response?.data?.message || 'Failed to set password'
  } finally {
    loading.value = false
  }
}

const handleGeneratePassword = async () => {
  loading.value = true
  clearMessages()

  try {
    const response = await api.post(`/auth/users/${props.user.user_id}/generate-password`)
    
    generatedPassword.value = response.data.new_password
    success.value = 'Random password generated successfully'
    manualPassword.value = ''
    
    setTimeout(() => {
      if (!generatedPassword.value) {
        emit('updated')
      }
    }, 2000)
  } catch (err) {
    console.error('Failed to generate password:', err)
    error.value = err.response?.data?.message || 'Failed to generate password'
  } finally {
    loading.value = false
  }
}
</script>
