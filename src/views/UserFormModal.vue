<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? 'Edit User' : 'Create User' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="username" class="form-label">Username *</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="form-input"
                :disabled="isEditing"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label for="email" class="form-label">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="form-input"
                placeholder="user@example.com"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="first_name" class="form-label">First Name</label>
                <input
                  id="first_name"
                  v-model="form.first_name"
                  type="text"
                  class="form-input"
                  placeholder="First name"
                />
              </div>
              <div>
                <label for="last_name" class="form-label">Last Name</label>
                <input
                  id="last_name"
                  v-model="form.last_name"
                  type="text"
                  class="form-input"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label for="role_id" class="form-label">Role *</label>
              <select
                id="role_id"
                v-model="form.role_id"
                required
                class="form-input"
              >
                <option value="">Select a role</option>
                <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
                  {{ role.name }} - {{ role.description }}
                </option>
              </select>
            </div>

            <div v-if="!isEditing">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="Enter password (leave empty to generate)"
              />
              <p class="text-xs text-gray-500 mt-1">
                Leave empty to generate a random password. User will NOT be forced to change password on first login.
              </p>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-600">Active user</span>
              </label>
            </div>
          </div>

          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ error }}
          </div>

          <div v-if="generatedPassword" class="mt-4 p-3 bg-green-100 border border-green-200 rounded">
            <p class="text-sm text-green-800">
              <strong>Generated Password:</strong> 
              <code class="bg-green-50 px-2 py-1 rounded">{{ generatedPassword }}</code>
            </p>
            <p class="text-xs text-green-600 mt-1">
              Please save this password and provide it to the user. They can change it after logging in.
            </p>
            <button 
              type="button" 
              @click="copyToClipboard(generatedPassword)"
              class="btn btn-sm btn-secondary mt-2"
            >
              Copy Password
            </button>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="$emit('close')" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref(null)
const roles = ref([])
const generatedPassword = ref(null)

const form = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role_id: '',
  password: '',
  active: true
})

const isEditing = computed(() => !!props.user)

const fetchRoles = async () => {
  try {
    const response = await api.get('/auth/roles')
    roles.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch roles:', err)
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  generatedPassword.value = null

  try {
    let response
    if (isEditing.value) {
      // For editing, only send changed fields
      const updateData = {}
      if (form.value.email !== props.user.email) updateData.email = form.value.email
      if (form.value.first_name !== props.user.first_name) updateData.first_name = form.value.first_name
      if (form.value.last_name !== props.user.last_name) updateData.last_name = form.value.last_name
      if (form.value.role_id !== props.user.role_id) updateData.role_id = form.value.role_id
      if (form.value.active !== props.user.active) updateData.active = form.value.active

      response = await api.put(`/auth/users/${props.user.user_id}`, updateData)
    } else {
      // For new users, send all data
      const createData = {
        username: form.value.username,
        email: form.value.email,
        first_name: form.value.first_name || null,
        last_name: form.value.last_name || null,
        role_id: form.value.role_id,
        active: form.value.active
      }

      // Only include password if provided
      if (form.value.password) {
        createData.password = form.value.password
      }

      response = await api.post('/auth/users', createData)
      
      if (response.data.password) {
        generatedPassword.value = response.data.password
        // Don't close modal immediately if password was generated
        setTimeout(() => {
          emit('saved')
        }, 10000) // Give user more time to copy password
        return
      }
    }
    emit('saved')
  } catch (err) {
    console.error('Failed to save user:', err)
    error.value = err.response?.data?.message || 'Failed to save user'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchRoles()

  if (props.user) {
    form.value = {
      username: props.user.username || '',
      email: props.user.email || '',
      first_name: props.user.first_name || '',
      last_name: props.user.last_name || '',
      role_id: props.user.role_id || '',
      active: props.user.active !== false
    }
  }
})
</script>
