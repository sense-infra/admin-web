<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h1 class="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              <svg class="inline-block w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              User Management
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage admin users, roles, and permissions for your security platform
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button 
              @click="fetchUsers" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <button 
              v-if="canCreateUsers"
              @click="openCreateModal" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow-xl rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">System Users</h2>
          <p class="mt-1 text-sm text-gray-600">{{ users.length }} total users</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Loading users...</p>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="users.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p class="mt-2 text-lg font-medium text-gray-900">No users found</p>
                    <p class="text-sm text-gray-500">Get started by creating your first user.</p>
                  </div>
                </td>
              </tr>

              <!-- User Rows -->
              <tr v-else v-for="user in users" :key="user.user_id" class="hover:bg-gray-50 transition-colors duration-150">
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ getUserInitial(user) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ getUserName(user) }}
                      </div>
                      <div class="text-sm text-gray-500">
                        @{{ user.username }} • {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.role?.name)">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    {{ user.role?.name || 'No Role' }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col space-y-1">
                    <!-- Active/Inactive Status -->
                    <span :class="getStatusBadgeClass(user.active)">
                      <svg :class="getStatusIconClass(user.active)" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </span>

                    <!-- Locked Status -->
                    <span v-if="isUserLocked(user)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg class="w-3 h-3 mr-1 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                      </svg>
                      Locked
                    </span>

                    <!-- REMOVED: Password Reset Required badge as requested -->
                  </div>
                </td>

                <!-- Last Activity -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ formatDate(user.last_login) }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <!-- Edit Button -->
                    <button 
                      v-if="canEditUsers"
                      @click="editUser(user)" 
                      class="action-btn action-btn-blue"
                      title="Edit user"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>

                    <!-- Password Management Button -->
                    <button 
                      v-if="canEditUsers"
                      @click="openPasswordModal(user)" 
                      class="action-btn action-btn-purple"
                      title="Manage password"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
                      </svg>
                    </button>
                    
                    <!-- Unlock Button -->
                    <button 
                      v-if="canEditUsers && isUserLocked(user)"
                      @click="unlockUser(user)" 
                      class="action-btn action-btn-orange"
                      title="Unlock user account"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    
                    <!-- Activate/Deactivate Button -->
                    <button 
                      v-if="canEditUsers && !isCurrentUser(user)"
                      @click="toggleUserStatus(user)" 
                      :class="user.active ? 'action-btn action-btn-yellow' : 'action-btn action-btn-green'"
                      :title="user.active ? 'Deactivate user' : 'Activate user'"
                    >
                      <svg v-if="user.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.914a2 2 0 011.516 1.947v9.058a2 2 0 01-1.516 1.947l-3.76.914a2 2 0 01-.485.06H8.736a2 2 0 01-1.789-1.106l-3.5-7A2 2 0 015.236 6H10v8z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20.027a2 2 0 01-1.516-1.947V9.022A2 2 0 017 7.075l3.76-.914A2 2 0 0111.244 6h4.017A2 2 0 0117.051 7.106l3.5 7A2 2 0 0118.764 16H14v-6z"></path>
                      </svg>
                    </button>
                    
                    <!-- Permanent Delete Button -->
                    <button 
                      v-if="canDeleteUsers && !isCurrentUser(user)"
                      @click="permanentlyDeleteUser(user)" 
                      class="action-btn action-btn-red"
                      title="Permanently delete user"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserFormModal
      v-if="showModal"
      :user="selectedUser"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Password Management Modal -->
    <PasswordManagementModal
      v-if="showPasswordModal"
      :user="selectedUserForPassword"
      @close="closePasswordModal"
      @updated="handlePasswordUpdated"
    />

    <!-- Change Own Password Modal -->
    <ChangePasswordModal
      v-if="showChangePasswordModal"
      @close="closeChangePasswordModal"
      @updated="handlePasswordUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'
import PasswordManagementModal from '@/components/admin/users/PasswordManagementModal.vue'
import ChangePasswordModal from '@/components/admin/users/ChangePasswordModal.vue'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const selectedUser = ref(null)
const showPasswordModal = ref(false)
const selectedUserForPassword = ref(null)
const showChangePasswordModal = ref(false)

// Permission checks based on current user's role
const canCreateUsers = computed(() => {
  const userPermissions = authStore.user?.role?.permissions?.users || []
  return userPermissions.includes('create')
})

const canEditUsers = computed(() => {
  const userPermissions = authStore.user?.role?.permissions?.users || []
  return userPermissions.includes('update')
})

const canDeleteUsers = computed(() => {
  const userPermissions = authStore.user?.role?.permissions?.users || []
  return userPermissions.includes('delete')
})

// Helper functions
const isCurrentUser = (user) => {
  return user.user_id === authStore.user?.user_id
}

const isUserLocked = (user) => {
  if (!user.locked_until) return false
  return new Date(user.locked_until) > new Date()
}

const getUserInitial = (user) => {
  return (user.first_name?.[0] || user.username[0]).toUpperCase()
}

const getUserName = (user) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  return user.username
}

const getRoleBadgeClass = (roleName) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  switch (roleName) {
    case 'admin':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'operator':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClasses} bg-green-100 text-green-800`
  }
}

const getStatusBadgeClass = (isActive) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  return isActive 
    ? `${baseClasses} bg-green-100 text-green-800`
    : `${baseClasses} bg-gray-100 text-gray-800`
}

const getStatusIconClass = (isActive) => {
  return isActive ? 'w-3 h-3 mr-1 text-green-400' : 'w-3 h-3 mr-1 text-gray-400'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
  if (diffInHours < 48) return 'Yesterday'
  return date.toLocaleDateString()
}

// API functions
const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/auth/users')
    
    if (Array.isArray(response.data)) {
      users.value = response.data
    } else if (response.data && response.data.users) {
      users.value = response.data.users
    } else if (response.data && response.data.data) {
      users.value = response.data.data
    } else {
      users.value = []
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedUser.value = null
  showModal.value = true
}

const editUser = (user) => {
  selectedUser.value = user
  showModal.value = true
}

const openPasswordModal = (user) => {
  selectedUserForPassword.value = user
  showPasswordModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUserForPassword.value = null
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
}

const handleSaved = () => {
  closeModal()
  fetchUsers()
}

const handlePasswordUpdated = () => {
  closePasswordModal()
  closeChangePasswordModal()
  fetchUsers()
}

const unlockUser = async (user) => {
  if (!confirm(`Are you sure you want to unlock user "${user.username}"?`)) return
  
  try {
    await api.post(`/auth/users/${user.user_id}/unlock`)
    await fetchUsers()
    error.value = null
  } catch (err) {
    console.error('Failed to unlock user:', err)
    error.value = err.response?.data?.message || 'Failed to unlock user'
  }
}

const toggleUserStatus = async (user) => {
  const action = user.active ? 'deactivate' : 'activate'
  
  if (!confirm(`Are you sure you want to ${action} user "${user.username}"?`)) return
  
  try {
    await api.put(`/auth/users/${user.user_id}`, { active: !user.active })
    await fetchUsers()
    error.value = null
  } catch (err) {
    console.error(`Failed to ${action} user:`, err)
    error.value = err.response?.data?.message || `Failed to ${action} user`
  }
}

const permanentlyDeleteUser = async (user) => {
  if (!confirm(`⚠️ PERMANENT DELETE ⚠️\n\nAre you sure you want to PERMANENTLY DELETE user "${user.username}"?\n\nThis action CANNOT be undone and will remove all user data from the database.`)) {
    return
  }
  
  const confirmText = prompt(`To confirm permanent deletion, type the username "${user.username}" exactly:`)
  if (confirmText !== user.username) {
    alert('Username confirmation failed. Deletion cancelled.')
    return
  }
  
  try {
    await api.delete(`/auth/users/${user.user_id}/permanent`)
    await fetchUsers()
    error.value = null
  } catch (err) {
    console.error('Failed to permanently delete user:', err)
    error.value = err.response?.data?.message || 'Failed to permanently delete user'
  }
}

// Show change password modal for current user
const openChangeOwnPasswordModal = () => {
  showChangePasswordModal.value = true
}

onMounted(() => {
  fetchUsers()
})

// Expose the change password function for the header component
defineExpose({
  openChangeOwnPasswordModal
})
</script>

<style scoped>
.action-btn {
  @apply inline-flex items-center p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150;
}

.action-btn-blue {
  @apply text-blue-600 hover:bg-blue-50 focus:ring-blue-500;
}

.action-btn-purple {
  @apply text-purple-600 hover:bg-purple-50 focus:ring-purple-500;
}

.action-btn-orange {
  @apply text-orange-600 hover:bg-orange-50 focus:ring-orange-500;
}

.action-btn-green {
  @apply text-green-600 hover:bg-green-50 focus:ring-green-500;
}

.action-btn-yellow {
  @apply text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500;
}

.action-btn-red {
  @apply text-red-600 hover:bg-red-50 focus:ring-red-500;
}
</style>
