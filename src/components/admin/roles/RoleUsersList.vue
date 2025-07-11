<template>
  <div class="card">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Role User Management</h3>
          <p class="mt-1 text-sm text-gray-600">
            View and manage users assigned to different roles
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <select
            v-model="selectedRole"
            @change="loadRoleUsers"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All roles</option>
            <option v-for="role in rolesWithCurrentCounts" :key="role.role_id" :value="role.role_id">
              {{ role.name }} ({{ role.user_count || 0 }} users)
            </option>
          </select>
          <button @click="refreshData" class="btn btn-outline">
            <ActionIcon name="refresh" size="xs" class="mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Bulk Actions -->
      <div v-if="selectedUsers.length > 0" class="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <ActionIcon name="success" size="sm" class="text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">
              {{ selectedUsers.length }} user(s) selected
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <select
              v-model="bulkActionRole"
              :disabled="!canEditUsers"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">Select new role</option>
              <option v-for="role in availableRoles" :key="role.role_id" :value="role.role_id">
                {{ role.name }}
              </option>
            </select>
            <button
              @click="performBulkRoleChange"
              :disabled="!bulkActionRole || bulkActionLoading || !canEditUsers"
              class="btn btn-primary"
            >
              <ActionIcon name="edit" size="xs" class="mr-1" />
              {{ bulkActionLoading ? 'Updating...' : 'Change Role' }}
            </button>
            <button @click="clearSelection" class="btn btn-outline">
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Users DataTable -->
      <DataTable
        :items="users"
        :columns="userColumns"
        :loading="loading"
        :error="error"
        title="Users"
        :searchable="true"
        search-placeholder="Search users..."
        :search-columns="['username', 'email', 'first_name', 'last_name']"
        :paginated="true"
        :sortable="true"
        :clickable-rows="false"
        :selectable="true"
        :selected-items="selectedUsers"
        @refresh="refreshData"
        @selection-change="handleSelectionChange"
      >
        <!-- Custom cell templates -->
        <template #cell-user="{ item }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <span class="text-white font-medium text-sm">
                  {{ getUserInitials(item) }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">
                {{ item.username }}
              </div>
              <div class="text-sm text-gray-500">
                {{ item.email }}
              </div>
              <div v-if="item.first_name || item.last_name" class="text-xs text-gray-400">
                {{ item.first_name }} {{ item.last_name }}
              </div>
            </div>
          </div>
        </template>

        <template #cell-role="{ item }">
          <div class="flex items-center">
            <span :class="getRoleBadgeClass(item.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ item.role?.name || 'No Role' }}
            </span>
            <span v-if="item.role && item.role.active === false" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Inactive Role
            </span>
          </div>
        </template>

        <template #cell-status="{ item }">
          <span :class="item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            <ActionIcon :name="item.active ? 'success' : 'warning'" size="xs" class="mr-1" />
            {{ item.active ? 'Active' : 'Inactive' }}
          </span>
        </template>

        <template #cell-last_login="{ item }">
          <div class="flex items-center text-sm text-gray-500">
            <ActionIcon name="clock" size="xs" class="mr-2 text-gray-400" />
            {{ formatDate(item.last_login) }}
          </div>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2">
            <!-- Edit Button -->
            <button
              v-if="canEditUsers && !isCurrentUser(item)"
              @click="editUser(item)"
              class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
              title="Edit user"
            >
              <ActionIcon name="edit" size="sm" />
            </button>

            <!-- Change Role Button -->
            <button
              v-if="canEditUsers && !isCurrentUser(item)"
              @click="changeUserRole(item)"
              class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
              title="Change role"
            >
              <ActionIcon name="refresh" size="sm" />
            </button>

            <!-- Activate/Deactivate Button -->
            <button
              v-if="canEditUsers && !isCurrentUser(item)"
              @click="toggleUserStatus(item)"
              :class="item.active 
                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100' 
                : 'text-green-600 hover:text-green-900 hover:bg-green-100'"
              class="p-1 rounded"
              :title="item.active ? 'Deactivate user' : 'Activate user'"
            >
              <ActionIcon :name="item.active ? 'deactivate' : 'activate'" size="sm" />
            </button>

            <!-- Current User Indicator -->
            <div v-if="isCurrentUser(item)" class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <ActionIcon name="user" size="xs" class="mr-1" />
                You
              </span>
            </div>

            <!-- No Permissions Indicator -->
            <div v-if="!canEditUsers" class="flex items-center">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                <ActionIcon name="view" size="xs" class="mr-1" />
                View Only
              </span>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- User Edit Modal -->
    <UserFormModal
      v-if="showUserEditModal"
      :user="userToEdit"
      @close="closeUserEditModal"
      @saved="handleUserSaved"
    />

    <!-- Role Change Modal -->
    <BaseModal 
      v-if="showRoleChangeModal" 
      :open="true" 
      title="Change User Role" 
      size="medium"
      @close="closeRoleChangeModal"
    >
      <template #default>
        <div v-if="userToChangeRole" class="space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm font-medium text-gray-900">User: {{ userToChangeRole.username }}</p>
            <p class="text-sm text-gray-500">Current Role: {{ userToChangeRole.role?.name || 'No Role' }}</p>
            <p class="text-xs text-gray-400">User ID: {{ userToChangeRole.user_id }}</p>
          </div>

          <FormField
            v-model="newRoleId"
            type="select"
            label="New Role"
            :options="roleOptions"
            required
          />

          <!-- Error Display -->
          <div v-if="roleChangeError" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex items-start">
              <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-red-800">{{ roleChangeError }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeRoleChangeModal" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="confirmRoleChange"
            :disabled="!newRoleId || roleChangeLoading || !userToChangeRole?.user_id"
            class="btn btn-primary"
          >
            <ActionIcon name="save" size="xs" class="mr-1" />
            {{ roleChangeLoading ? 'Changing...' : 'Change Role' }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { rolesService } from '@/services/roles'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'
import api from '@/services/api'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FormField from '@/components/forms/FormField.vue'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['user-updated', 'role-changed', 'users-loaded'])

const authStore = useAuthStore()
const { handleError } = useErrorHandler('Role Users')

// Data
const users = ref([])
const selectedRole = ref('')
const loading = ref(false)
const error = ref('')
const roleStats = ref(null)

// Selection and bulk actions
const selectedUsers = ref([])
const bulkActionRole = ref('')
const bulkActionLoading = ref(false)

// Role change modal
const showRoleChangeModal = ref(false)
const userToChangeRole = ref(null)
const newRoleId = ref('')
const roleChangeLoading = ref(false)
const roleChangeError = ref('')

// User edit modal
const showUserEditModal = ref(false)
const userToEdit = ref(null)

// Table columns
const userColumns = [
  { key: 'user', label: 'User', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'last_login', label: 'Last Login', sortable: true, formatter: formatDate },
  { key: 'actions', label: 'Actions', sortable: false }
]

// Permission checks
const canEditUsers = computed(() => {
  return authStore.hasPermission('users', 'update')
})

// Helper functions
const isCurrentUser = (user) => {
  return user.user_id === authStore.user?.user_id
}

// Computed properties
const availableRoles = computed(() => props.roles.filter(role => role.active !== false))

const rolesWithCurrentCounts = computed(() => {
  // Use the user_count from props.roles (loaded by parent component)
  // and only override with locally calculated counts if we have loaded all users
  if (selectedRole.value) {
    // When a specific role is selected, use the counts from props
    return props.roles.map(role => ({
      ...role,
      user_count: role.user_count || 0
    }))
  } else {
    // When showing all users, calculate counts from loaded users
    const roleCounts = {}
    users.value.forEach(user => {
      if (user.role && user.role.role_id) {
        const roleId = user.role.role_id
        roleCounts[roleId] = (roleCounts[roleId] || 0) + 1
      }
    })

    return props.roles.map(role => ({
      ...role,
      user_count: users.value.length > 0 ? (roleCounts[role.role_id] || 0) : (role.user_count || 0)
    }))
  }
})

const roleOptions = computed(() => {
  return availableRoles.value.map(role => ({
    value: role.role_id.toString(),
    label: `${role.name} - ${role.description || 'No description'}`
  }))
})

const roleStatsFormatted = computed(() => {
  if (!roleStats.value) return []

  return [
    { title: 'Total Users', value: roleStats.value.total_user_count || 0, icon: 'users', color: 'blue' },
    { title: 'Active Users', value: roleStats.value.active_user_count || 0, icon: 'success', color: 'green' },
    { title: 'Inactive Users', value: roleStats.value.inactive_user_count || 0, icon: 'warning', color: 'yellow' },
    { title: 'Recent Logins', value: getRecentLoginCount(), icon: 'clock', color: 'purple' }
  ]
})

// Methods
const loadRoleUsers = async () => {
  try {
    loading.value = true
    error.value = ''

    if (selectedRole.value) {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get(`/auth/roles/${selectedRole.value}/users`),
        api.get(`/auth/roles/${selectedRole.value}/usage`)
      ])

      const selectedRoleData = props.roles.find(r => r.role_id == selectedRole.value)

      users.value = (usersResponse.data || []).map(user => ({
        ...user,
        role: selectedRoleData ? {
          role_id: selectedRoleData.role_id,
          name: selectedRoleData.name,
          description: selectedRoleData.description,
          active: selectedRoleData.active !== false
        } : user.role
      }))

      roleStats.value = statsResponse.data || null
    } else {
      const response = await api.get('/auth/users')
      const rolesMap = new Map(props.roles.map(role => [role.role_id, role]))

      users.value = (response.data || []).map(user => {
        if (!user.role) return { ...user, role: null }

        const correctRoleData = rolesMap.get(user.role.role_id)
        return {
          ...user,
          role: correctRoleData ? {
            role_id: correctRoleData.role_id,
            name: correctRoleData.name,
            description: correctRoleData.description || '',
            active: correctRoleData.active !== false
          } : user.role
        }
      })

      roleStats.value = null
    }

    selectedUsers.value = []
    updateRoleUserCounts()
  } catch (err) {
    error.value = handleError(err)
  } finally {
    loading.value = false
  }
}

const updateRoleUserCounts = async () => {
  try {
    const roleCounts = {}
    users.value.forEach(user => {
      if (user.role && user.role.role_id) {
        const roleId = user.role.role_id
        roleCounts[roleId] = (roleCounts[roleId] || 0) + 1
      }
    })

    const updatedRoles = props.roles.map(role => ({
      ...role,
      user_count: roleCounts[role.role_id] || 0
    }))

    emit('role-changed', {
      userCounts: roleCounts,
      updatedRoles: updatedRoles
    })
  } catch (err) {
    console.error('Failed to update role user counts:', err)
  }
}

const refreshData = async () => {
  await loadRoleUsers()
}

const getUserInitials = (user) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  return user.username.slice(0, 2).toUpperCase()
}

const getRoleBadgeClass = (role) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  if (!role || !role.name) {
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  switch (role.name.toLowerCase()) {
    case 'admin':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'manager':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'operator':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'viewer':
      return `${baseClasses} bg-green-100 text-green-800`
    default:
      return `${baseClasses} bg-purple-100 text-purple-800`
  }
}

const getRecentLoginCount = () => {
  if (!users.value.length) return 0
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return users.value.filter(user =>
    user.last_login && new Date(user.last_login) > sevenDaysAgo
  ).length
}

// Selection methods
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const clearSelection = () => {
  selectedUsers.value = []
  bulkActionRole.value = ''
}

// Bulk actions
const performBulkRoleChange = async () => {
  if (!canEditUsers.value || !bulkActionRole.value || selectedUsers.value.length === 0) return

  const usersToUpdate = selectedUsers.value.filter(userId => {
    const user = users.value.find(u => u.user_id === userId)
    return user && !isCurrentUser(user)
  })

  if (usersToUpdate.length === 0) {
    error.value = 'Cannot modify your own role or no valid users selected'
    return
  }

  try {
    bulkActionLoading.value = true

    const promises = usersToUpdate.map(userId =>
      api.put(`/auth/users/${userId}`, { role_id: parseInt(bulkActionRole.value) })
    )

    await Promise.all(promises)
    await loadRoleUsers()
    clearSelection()

    emit('role-changed', { userIds: usersToUpdate, newRoleId: bulkActionRole.value })
  } catch (err) {
    error.value = handleError(err)
  } finally {
    bulkActionLoading.value = false
  }
}

// Individual user actions
const editUser = (user) => {
  if (!canEditUsers.value || isCurrentUser(user)) return

  userToEdit.value = user
  showUserEditModal.value = true
}

const closeUserEditModal = () => {
  showUserEditModal.value = false
  userToEdit.value = null
}

const handleUserSaved = async () => {
  closeUserEditModal()
  await loadRoleUsers()
  emit('user-updated', userToEdit.value)
}

const changeUserRole = (user) => {
  if (!canEditUsers.value || isCurrentUser(user)) return

  userToChangeRole.value = { ...user }
  newRoleId.value = user.role?.role_id?.toString() || ''
  roleChangeError.value = ''
  showRoleChangeModal.value = true
}

const closeRoleChangeModal = () => {
  showRoleChangeModal.value = false
  userToChangeRole.value = null
  newRoleId.value = ''
  roleChangeLoading.value = false
  roleChangeError.value = ''
}

const confirmRoleChange = async () => {
  if (!newRoleId.value || !userToChangeRole.value || !userToChangeRole.value.user_id) {
    roleChangeError.value = 'Invalid user or role selection'
    return
  }

  try {
    roleChangeLoading.value = true
    roleChangeError.value = ''

    const userId = userToChangeRole.value.user_id
    const newRole = newRoleId.value

    await api.put(`/auth/users/${userId}`, {
      role_id: parseInt(newRole)
    })

    closeRoleChangeModal()
    await loadRoleUsers()

    emit('role-changed', {
      userIds: [userId],
      newRoleId: newRole
    })
  } catch (err) {
    roleChangeError.value = handleError(err)
  } finally {
    roleChangeLoading.value = false
  }
}

const toggleUserStatus = async (user) => {
  if (!canEditUsers.value || isCurrentUser(user)) return

  const action = user.active ? 'deactivate' : 'activate'

  if (!confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
    return
  }

  try {
    await api.put(`/auth/users/${user.user_id}`, {
      active: !user.active
    })

    await loadRoleUsers()
    emit('user-updated', user)
  } catch (err) {
    error.value = handleError(err)
  }
}

// Watch for role selection changes
watch(selectedRole, () => {
  loadRoleUsers()
})

// Initialize
onMounted(() => {
  refreshData()
})
</script>
