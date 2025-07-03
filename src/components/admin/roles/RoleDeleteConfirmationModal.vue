<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ canDelete ? 'Confirm Role Deletion' : 'Cannot Delete Role' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2">Loading role information...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="font-medium">Error loading role information</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Role Information - FIXED: Add null checks -->
      <div v-else-if="roleUsage && roleUsage.role" class="space-y-6">
        <!-- Role Details -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">Role: {{ roleUsage.role.name }}</h4>
          <p class="text-sm text-gray-600">{{ roleUsage.role.description || 'No description' }}</p>
          <div class="mt-2 flex items-center space-x-4 text-sm">
            <span class="text-gray-500">
              <strong>Total Users:</strong> {{ roleUsage.total_user_count || 0 }}
            </span>
            <span class="text-gray-500">
              <strong>Active Users:</strong> {{ roleUsage.active_user_count || 0 }}
            </span>
            <span class="text-gray-500">
              <strong>Inactive Users:</strong> {{ roleUsage.inactive_user_count || 0 }}
            </span>
          </div>
        </div>

        <!-- System Role Warning -->
        <div v-if="roleUsage.is_system_role" class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-800 font-medium">System Role Protection</p>
          </div>
          <p class="text-red-700 text-sm mt-1">
            This is a system role and cannot be deleted. System roles are essential for platform operation.
          </p>
        </div>

        <!-- Active Users Warning -->
        <div v-else-if="(roleUsage.active_user_count || 0) > 0" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-yellow-800 font-medium">Active Users Assigned</p>
          </div>
          <p class="text-yellow-700 text-sm mt-1">
            This role has {{ roleUsage.active_user_count || 0 }} active user(s) assigned. You must reassign these users to another role before deletion.
          </p>
        </div>

        <!-- User List - FIXED: Add null checks -->
        <div v-if="roleUsage.users && roleUsage.users.length > 0" class="space-y-4">
          <h5 class="font-medium text-gray-900">Users Assigned to This Role</h5>

          <div class="border rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in roleUsage.users" :key="user.user_id" :class="user.active ? '' : 'bg-gray-50'">
                  <td class="px-4 py-3">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                      <div v-if="user.first_name || user.last_name" class="text-xs text-gray-400">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ user.last_login ? formatDate(user.last_login) : 'Never' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reassignment Section -->
        <div v-if="canReassign" class="space-y-4">
          <h5 class="font-medium text-gray-900">Reassign Users to Another Role</h5>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <select
                v-model="selectedNewRole"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a role for reassignment</option>
                <option v-for="role in availableRoles" :key="role.role_id" :value="role.role_id">
                  {{ role.name }} - {{ role.description }}
                </option>
              </select>
            </div>
            <button
              @click="reassignUsers"
              :disabled="!selectedNewRole || reassigning"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ reassigning ? 'Reassigning...' : 'Reassign Users' }}
            </button>
          </div>
        </div>

        <!-- Can Delete Confirmation -->
        <div v-if="canDelete" class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-800 font-medium">Permanent Deletion</p>
          </div>
          <p class="text-red-700 text-sm mt-1">
            This action cannot be undone. The role will be permanently deleted from the system.
          </p>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else-if="!loading && !error" class="text-center py-8">
        <p class="text-gray-500">No role information available</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button 
          @click="$emit('close')" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Cancel
        </button>

        <button
          v-if="canDelete"
          @click="confirmDelete"
          :disabled="deleting"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ deleting ? 'Deleting...' : 'Delete Role' }}
        </button>

        <button
          v-else-if="roleUsage && !roleUsage.is_system_role && (roleUsage.active_user_count || 0) === 0"
          @click="deactivateRole"
          :disabled="deactivating"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ deactivating ? 'Deactivating...' : 'Deactivate Role' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { rolesService } from '@/services/roles'
import api from '@/services/api'

const props = defineProps({
  role: {
    type: Object,
    required: true
  },
  availableRoles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'deleted', 'reassigned'])

const loading = ref(true)
const deleting = ref(false)
const deactivating = ref(false)
const reassigning = ref(false)
const error = ref('')
const roleUsage = ref(null)
const selectedNewRole = ref('')

const canDelete = computed(() => {
  return roleUsage.value && 
         roleUsage.value.can_delete && 
         !roleUsage.value.is_system_role && 
         (roleUsage.value.active_user_count || 0) === 0
})

const canReassign = computed(() => {
  return roleUsage.value &&
         (roleUsage.value.active_user_count || 0) > 0 &&
         !roleUsage.value.is_system_role &&
         props.availableRoles.length > 0
})

const fetchRoleUsage = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (!props.role?.role_id) {
      throw new Error('Invalid role ID')
    }

    console.log('🔍 Fetching role usage for role ID:', props.role.role_id)
    const response = await api.get(`/auth/roles/${props.role.role_id}/usage`)
    console.log('📊 Role usage response:', response.data)
    
    roleUsage.value = response.data || null
  } catch (err) {
    console.error('❌ Failed to fetch role usage:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch role information'
    roleUsage.value = null
  } finally {
    loading.value = false
  }
}

const reassignUsers = async () => {
  if (!selectedNewRole.value || !roleUsage.value) return

  try {
    reassigning.value = true
    error.value = ''

    console.log('🔄 Reassigning users from role', props.role.role_id, 'to role', selectedNewRole.value)
    
    await api.post(`/auth/roles/${props.role.role_id}/reassign`, {
      new_role_id: parseInt(selectedNewRole.value)
    })

    console.log('✅ Users reassigned successfully')

    // Refresh the role usage info
    await fetchRoleUsage()
    emit('reassigned')

    // Clear selection
    selectedNewRole.value = ''
  } catch (err) {
    console.error('❌ Failed to reassign users:', err)
    error.value = err.response?.data?.message || 'Failed to reassign users'
  } finally {
    reassigning.value = false
  }
}

const confirmDelete = async () => {
  if (!canDelete.value) return

  try {
    deleting.value = true
    error.value = ''

    console.log('🗑️ Deleting role:', props.role.role_id)
    await rolesService.delete(props.role.role_id)
    console.log('✅ Role deleted successfully')
    
    emit('deleted')
  } catch (err) {
    console.error('❌ Failed to delete role:', err)
    error.value = err.response?.data?.message || 'Failed to delete role'
  } finally {
    deleting.value = false
  }
}

const deactivateRole = async () => {
  try {
    deactivating.value = true
    error.value = ''

    console.log('⏸️ Deactivating role:', props.role.role_id)
    await api.post(`/auth/roles/${props.role.role_id}/deactivate`)
    console.log('✅ Role deactivated successfully')
    
    emit('deleted') // Treat deactivation as deletion for UI purposes
  } catch (err) {
    console.error('❌ Failed to deactivate role:', err)
    error.value = err.response?.data?.message || 'Failed to deactivate role'
  } finally {
    deactivating.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString()
  } catch (e) {
    return 'Invalid Date'
  }
}

onMounted(() => {
  if (props.role?.role_id) {
    fetchRoleUsage()
  } else {
    error.value = 'Invalid role provided'
    loading.value = false
  }
})
</script>
