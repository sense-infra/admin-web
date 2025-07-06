<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage user accounts, roles, and permissions</p>
      </div>
      <button
        v-if="canManageUsers"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <ActionIcon name="add" size="sm" class="mr-2" />
        Add User
      </button>
    </div>

    <!-- User Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ActionIcon name="users" size="lg" class="text-blue-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
              <dd class="text-lg font-medium text-gray-900">{{ userStats.total }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ActionIcon name="success" size="lg" class="text-green-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
              <dd class="text-lg font-medium text-gray-900">{{ userStats.active }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ActionIcon name="warning" size="lg" class="text-yellow-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Inactive Users</dt>
              <dd class="text-lg font-medium text-gray-900">{{ userStats.inactive }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ActionIcon name="clock" size="lg" class="text-purple-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Recent (30 days)</dt>
              <dd class="text-lg font-medium text-gray-900">{{ userStats.recent }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <DataTable
      :items="users"
      :columns="tableColumns"
      :loading="loading"
      :error="error"
      title="Users"
      searchable
      paginated
      :initial-page-size="25"
      search-placeholder="Search users by name, username, or email..."
      empty-state-title="No users found"
      empty-state-message="Click 'Add User' to create your first user"
      @refresh="loadUsers"
      @row-click="viewUser"
    >
      <template #row="{ item }">
        <td class="table-cell">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ userUtils.getInitials(item) }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">
                {{ userUtils.getDisplayName(item) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ item.username }}
              </div>
            </div>
          </div>
        </td>
        <td class="table-cell">
          <div class="text-sm text-gray-900">{{ item.email }}</div>
          <div class="text-sm text-gray-500">ID: {{ item.user_id }}</div>
        </td>
        <td class="table-cell">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="userUtils.getRoleBadgeClass(item.role)">
            {{ item.role?.name || 'No Role' }}
          </span>
        </td>
        <td class="table-cell">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="userUtils.getStatusBadgeClass(item.active)">
            <ActionIcon
              :name="item.active ? 'success' : 'warning'"
              size="xs"
              :class="item.active ? 'text-green-400 mr-1' : 'text-yellow-400 mr-1'"
            />
            {{ item.active ? 'Active' : 'Inactive' }}
          </span>
        </td>
        <td class="table-cell text-sm text-gray-500">
          {{ formatDate(item.last_login) }}
        </td>
        <td class="table-cell text-sm text-gray-500">
          {{ formatDate(item.created_at) }}
        </td>
        <td class="table-cell">
          <div class="flex items-center gap-2">
            <!-- View Button -->
            <button
              @click.stop="viewUser(item)"
              class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
              title="View User"
            >
              <ActionIcon name="view" size="sm" />
            </button>

            <!-- Edit Button -->
            <button
              v-if="canManageUsers"
              @click.stop="editUser(item)"
              class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
              title="Edit User"
            >
              <ActionIcon name="edit" size="sm" />
            </button>

            <!-- Password Button -->
            <button
              v-if="canManageUsers"
              @click.stop="changePassword(item)"
              class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
              title="Change Password"
            >
              <ActionIcon name="key" size="sm" />
            </button>

            <!-- Deactivate/Activate Button -->
            <button
              v-if="canManageUsers && !userUtils.isSystemUser(item)"
              @click.stop="toggleUserStatus(item)"
              :class="item.active
                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100'
                : 'text-green-600 hover:text-green-900 hover:bg-green-100'"
              class="p-1 rounded"
              :title="item.active ? 'Deactivate User' : 'Activate User'"
            >
              <ActionIcon :name="item.active ? 'deactivate' : 'activate'" size="sm" />
            </button>

            <!-- Delete Button -->
            <button
              v-if="canManageUsers && !userUtils.isSystemUser(item)"
              @click.stop="deleteUser(item)"
              class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
              title="Delete User"
            >
              <ActionIcon name="delete" size="sm" />
            </button>

            <!-- System User Protection Notice -->
            <div v-if="userUtils.isSystemUser(item)" class="ml-2">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <ActionIcon name="lock" size="xs" class="mr-1" />
                Protected
              </span>
            </div>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Create Modal -->
    <UserFormModal
      v-if="showCreateModal"
      :show-modal="showCreateModal"
      :all-users="users"
      @close="closeCreateModal"
      @saved="handleUserSaved"
    />

    <!-- Edit Modal -->
    <UserFormModal
      v-if="showEditModal"
      :user="selectedUser"
      :all-users="users"
      @close="closeEditModal"
      @saved="handleUserSaved"
    />

    <!-- View User Modal -->
    <BaseModal
      :open="showViewModal"
      title="User Details"
      size="large"
      @close="showViewModal = false"
    >
      <div v-if="selectedUser" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Account Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Username:</strong> {{ selectedUser.username }}</div>
              <div><strong>Email:</strong> {{ selectedUser.email }}</div>
              <div><strong>Full Name:</strong> {{ userUtils.getDisplayName(selectedUser) }}</div>
              <div><strong>Role:</strong>
                <span :class="userUtils.getRoleBadgeClass(selectedUser.role)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  {{ selectedUser.role?.name || 'No Role' }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Account Status</h4>
            <div class="space-y-2 text-sm">
              <div><strong>User ID:</strong> #{{ selectedUser.user_id }}</div>
              <div><strong>Status:</strong>
                <span :class="userUtils.getStatusBadgeClass(selectedUser.active)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  <ActionIcon
                    :name="selectedUser.active ? 'success' : 'warning'"
                    size="xs"
                    :class="selectedUser.active ? 'text-green-400 mr-1' : 'text-yellow-400 mr-1'"
                  />
                  {{ selectedUser.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div><strong>Last Login:</strong> {{ formatDate(selectedUser.last_login) }}</div>
              <div><strong>Created:</strong> {{ formatDate(selectedUser.created_at) }}</div>
              <div><strong>Last Updated:</strong> {{ formatDate(selectedUser.updated_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Role Permissions -->
        <div v-if="selectedUser.role && selectedUser.role.permissions">
          <h4 class="font-medium text-gray-900 mb-3">Role Permissions</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(actions, resource) in selectedUser.role.permissions"
                :key="resource"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ resource }}: {{ Array.isArray(actions) ? actions.join(', ') : actions }}
              </span>
            </div>
          </div>
        </div>

        <!-- System User Notice -->
        <div v-if="userUtils.isSystemUser(selectedUser)" class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <ActionIcon name="info" size="sm" class="text-blue-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm text-blue-800">
                <strong>System User:</strong> This is a protected system user account that cannot be modified or deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="showViewModal = false"
          class="btn btn-outline"
        >
          Close
        </button>
      </template>
    </BaseModal>

    <PasswordManagementModal
      v-if="showPasswordModal"
      :user="selectedUser"
      @close="showPasswordModal = false"
      @updated="handlePasswordChanged"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :open="showDeleteModal"
      type="danger"
      entity-name="user"
      :entity-value="selectedUser?.username"
      :loading="deleteLoading"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete user "{{ selectedUser?.username }}"? This action cannot be undone.
        </p>

        <div v-if="selectedUser && getActiveSessionsCount(selectedUser) > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Warning:</strong> This user has {{ getActiveSessionsCount(selectedUser) }} active session(s).
                Deleting the user will immediately terminate all active sessions.
              </p>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>

    <!-- Status Toggle Confirmation Modal -->
    <ConfirmationModal
      :open="showStatusModal"
      :type="statusAction === 'deactivate' ? 'warning' : 'info'"
      :title="`${statusAction === 'deactivate' ? 'Deactivate' : 'Activate'} User`"
      :loading="statusLoading"
      @close="showStatusModal = false"
      @confirm="confirmStatusChange"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to {{ statusAction }} user "{{ selectedUser?.username }}"?
        </p>

        <div v-if="statusAction === 'deactivate' && selectedUser && getActiveSessionsCount(selectedUser) > 0"
             class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Note:</strong> Deactivating this user will immediately terminate {{ getActiveSessionsCount(selectedUser) }} active session(s).
              </p>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService, userUtils } from '@/services/users'
import { formatDate } from '@/utils/formatters'

import ActionIcon from '@/components/icons/ActionIcons.vue'
import DataTable from '@/components/tables/DataTable.vue'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'
import PasswordManagementModal from '@/components/admin/users/PasswordManagementModal.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const authStore = useAuthStore()
const route = useRoute()

// Reactive data
const loading = ref(false)
const error = ref('')
const users = ref([])
const userStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  recent: 0
})

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const selectedUser = ref(null)
const deleteLoading = ref(false)
const statusLoading = ref(false)
const statusAction = ref('') // 'activate' or 'deactivate'

// Table configuration
const tableColumns = [
  { key: 'user', label: 'User', sortable: true, searchable: true },
  { key: 'email', label: 'Email & ID', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'last_login', label: 'Last Login', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

// Computed properties
const canManageUsers = computed(() => {
  return authStore.hasPermission('users', 'create') ||
         authStore.hasPermission('users', 'update') ||
         authStore.user?.role?.name === 'admin'
})

// API functions
const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('🔍 Loading users...')
    const [usersData, statsData] = await Promise.all([
      userService.getAll(),
      userService.getStats().catch(() => null) // Stats might not be available
    ])
    
    users.value = usersData
    
    // Use API stats if available, otherwise generate from user data
    if (statsData) {
      userStats.value = statsData
    } else {
      userStats.value = userUtils.generateStats(users.value)
    }
    
    console.log('✅ Users loaded successfully:', users.value.length)
  } catch (err) {
    error.value = userUtils.formatError(err)
    console.error('❌ Failed to load users:', err)
  } finally {
    loading.value = false
  }
}

// Modal handlers
const closeCreateModal = () => {
  showCreateModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserSaved = (result) => {
  console.log('🎉 User saved, refreshing list...')

  // Always refresh the user list when a user is saved
  loadUsers()

  // Only close modals if no password was generated (meaning user can close modal)
  if (!result || !result.password) {
    closeCreateModal()
    closeEditModal()
  }
  // If password was generated, keep modal open for user to copy password
  // Modal will close when user clicks "Copy & Close" or manually closes it
}

const handlePasswordChanged = () => {
  console.log('🔐 Password changed successfully')
  loadUsers()
  showPasswordModal.value = false
  selectedUser.value = null
}

const viewUser = (user) => {
  selectedUser.value = { ...user }
  showViewModal.value = true
}

const editUser = (user) => {
  selectedUser.value = { ...user }
  showEditModal.value = true
}

const changePassword = (user) => {
  selectedUser.value = { ...user }
  showPasswordModal.value = true
}

const deleteUser = (user) => {
  selectedUser.value = { ...user }
  showDeleteModal.value = true
}

const toggleUserStatus = (user) => {
  selectedUser.value = { ...user }
  statusAction.value = user.active ? 'deactivate' : 'activate'
  showStatusModal.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    console.log(`🗑️ Permanently deleting user ${selectedUser.value.user_id}`)
    await userService.delete(selectedUser.value.user_id)
    console.log('✅ User permanently deleted')

    await loadUsers()
    showDeleteModal.value = false
    selectedUser.value = null
  } catch (err) {
    console.error('❌ Failed to permanently delete user:', err)
    const errorMessage = userUtils.formatError(err)
    alert('Failed to delete user: ' + errorMessage)
  } finally {
    deleteLoading.value = false
  }
}

const confirmStatusChange = async () => {
  statusLoading.value = true

  try {
    const newStatus = statusAction.value === 'activate'
    await userService.toggleStatus(selectedUser.value.user_id, newStatus)

    await loadUsers()
    showStatusModal.value = false
    selectedUser.value = null
    statusAction.value = ''
  } catch (err) {
    const errorMessage = userUtils.formatError(err)
    alert(`Failed to ${statusAction.value} user: ` + errorMessage)
  } finally {
    statusLoading.value = false
  }
}

// Helper function for mock active sessions (this would come from backend)
const getActiveSessionsCount = (user) => {
  return user.active ? Math.floor(Math.random() * 3) : 0
}

onMounted(async () => {
  await loadUsers()

  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    const user = users.value.find(u => u.user_id === parseInt(viewId))
    if (user) {
      viewUser(user)
    }
  }
})
</script>

<style scoped>
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}
</style>
