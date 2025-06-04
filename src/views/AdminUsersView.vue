<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
      <p class="text-gray-600">Manage admin users and their permissions</p>
    </div>
    
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Users</h2>
          <div class="flex space-x-2">
            <button @click="fetchUsers" class="btn btn-secondary btn-sm">Refresh</button>
            <button @click="openCreateModal" class="btn btn-primary">Add User</button>
          </div>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Username</th>
                <th class="table-header-cell">Email</th>
                <th class="table-header-cell">Name</th>
                <th class="table-header-cell">Role</th>
                <th class="table-header-cell">Status</th>
                <th class="table-header-cell">Last Login</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="7" class="table-cell text-center">Loading users...</td>
              </tr>
              <tr v-else-if="users.length === 0" class="table-row">
                <td colspan="7" class="table-cell text-center">No users found</td>
              </tr>
              <tr v-else v-for="user in users" :key="user.user_id" class="table-row">
                <td class="table-cell">{{ user.username }}</td>
                <td class="table-cell">{{ user.email }}</td>
                <td class="table-cell">{{ user.first_name }} {{ user.last_name }}</td>
                <td class="table-cell">
                  <span class="badge badge-info">{{ user.role?.name || 'No Role' }}</span>
                </td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    user.active ? 'badge-success' : 'badge-danger'
                  ]">
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                  <span v-if="user.force_password_change" class="badge badge-warning ml-1">
                    PWD Reset
                  </span>
                </td>
                <td class="table-cell">{{ formatDate(user.last_login) }}</td>
                <td class="table-cell">
                  <button @click="editUser(user)" class="btn btn-sm btn-outline mr-2">Edit</button>
                  <button 
                    @click="deactivateUser(user.user_id)" 
                    :class="[
                      'btn btn-sm',
                      user.active ? 'btn-danger' : 'btn-success'
                    ]"
                  >
                    {{ user.active ? 'Deactivate' : 'Activate' }}
                  </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const selectedUser = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

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

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const handleSaved = () => {
  closeModal()
  fetchUsers()
}

const deactivateUser = async (userId) => {
  const user = users.value.find(u => u.user_id === userId)
  const action = user.active ? 'deactivate' : 'activate'
  
  if (!confirm(`Are you sure you want to ${action} this user?`)) return
  
  try {
    if (user.active) {
      await api.delete(`/auth/users/${userId}`)
    } else {
      // For reactivation, we'd need an endpoint or update the user
      await api.put(`/auth/users/${userId}`, { active: true })
    }
    await fetchUsers()
  } catch (err) {
    console.error(`Failed to ${action} user:`, err)
    error.value = err.response?.data?.message || `Failed to ${action} user`
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
