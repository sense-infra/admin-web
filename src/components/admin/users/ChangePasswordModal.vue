<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Change Password
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- Current Password -->
            <div>
              <label for="current_password" class="form-label">Current Password *</label>
              <input
                id="current_password"
                v-model="form.current_password"
                type="password"
                required
                class="form-input"
                placeholder="Enter your current password"
                autocomplete="current-password"
              />
            </div>

            <!-- New Password -->
            <div>
              <label for="new_password" class="form-label">New Password *</label>
              <input
                id="new_password"
                v-model="form.new_password"
                type="password"
                required
                class="form-input"
                placeholder="Enter new password"
                autocomplete="new-password"
                minlength="8"
              />
              <p class="text-xs text-gray-500 mt-1">
                Minimum 8 characters required
              </p>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="confirm_password" class="form-label">Confirm New Password *</label>
              <input
                id="confirm_password"
                v-model="form.confirm_password"
                type="password"
                required
                class="form-input"
                placeholder="Confirm new password"
                autocomplete="new-password"
              />
            </div>

            <!-- Password Match Validation -->
            <div v-if="form.new_password && form.confirm_password && form.new_password !== form.confirm_password" 
                 class="text-sm text-red-600">
              Passwords do not match
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

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="$emit('close')" class="btn btn-outline">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="loading || !isFormValid"
              class="btn btn-primary"
            >
              {{ loading ? 'Changing Password...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const form = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const isFormValid = computed(() => {
  return form.value.current_password && 
         form.value.new_password && 
         form.value.confirm_password &&
         form.value.new_password === form.value.confirm_password &&
         form.value.new_password.length >= 8
})

const clearMessages = () => {
  error.value = null
  success.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill all fields correctly'
    return
  }

  if (form.value.new_password !== form.value.confirm_password) {
    error.value = 'New passwords do not match'
    return
  }

  if (form.value.new_password.length < 8) {
    error.value = 'New password must be at least 8 characters long'
    return
  }

  loading.value = true
  clearMessages()

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
</script>
