<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
      <p class="text-gray-600">Manage user accounts, roles, and permissions</p>
    </div>

    <!-- ✅ CONSOLIDATED: Stats Grid using reusable component -->
    <StatsGrid :stats="userStatsFormatted" />

    <!-- ✅ CONSOLIDATED: Filter Bar (Search handled by DataTable) -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Filter Controls -->
          <div class="flex gap-2">
            <!-- Role Filter -->
            <select
              v-model="roleFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option
                v-for="role in availableRoles"
                :key="role.role_id"
                :value="role.role_id"
              >
                {{ role.name }}
              </option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 ml-auto">
            <button @click="clearFilters" class="btn btn-outline">
              <ActionIcon name="clear" size="xs" class="mr-1" />
              Clear Filters
            </button>
            <button @click="loadUsers" class="btn btn-outline">
              <ActionIcon name="refresh" size="xs" class="mr-1" />
              Refresh
            </button>
            <button
              v-if="canManageUsers"
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <ActionIcon name="add" size="xs" class="mr-1" />
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ CONSOLIDATED: Users Table using DataTable component -->
    <DataTable
      :items="filteredUsers"
      :columns="userColumns"
      :loading="loading"
      :error="error"
      title="Users"
      :searchable="true"
      search-placeholder="Search users by name, username, email, or role..."
      :search-columns="['username', 'email', 'first_name', 'last_name', 'display_name', 'role_name']"
      :paginated="true"
      :initial-page-size="25"
      :sortable="true"
      :initial-sort="{ column: 'created_at', direction: 'desc' }"
      :clickable-rows="true"
      :show-refresh="true"
      empty-state-title="No users found"
      :empty-state-message="roleFilter || statusFilter ? 'No users match your filter criteria' : 'No users have been created yet'"
      @refresh="loadUsers"
      @row-click="viewUser"
    >
      <!-- Custom cell renderers -->
      <template #cell-display_name="{ item }">
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
      </template>

      <template #cell-email="{ item }">
        <div>
          <div class="text-sm text-gray-900">{{ item.email }}</div>
          <div class="text-sm text-gray-500">ID: {{ item.user_id }}</div>
        </div>
      </template>

      <template #cell-role_name="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="userUtils.getRoleBadgeClass(item.role)">
          {{ item.role?.name || 'No Role' }}
        </span>
      </template>

      <template #cell-active="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="userUtils.getStatusBadgeClass(item.active)">
          <ActionIcon
            :name="item.active ? 'success' : 'warning'"
            size="xs"
            :class="item.active ? 'text-green-400 mr-1' : 'text-yellow-400 mr-1'"
          />
          {{ item.active ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #cell-last_login="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.last_login) }}
        </span>
      </template>

      <template #cell-created_at="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.created_at) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <!-- ✅ CONSOLIDATED: Use ActionColumn component -->
        <UserActionButtons
          :user="item"
          :can-manage="canManageUsers"
          :is-protected="userUtils.isSystemUser(item)"
          @view="viewUser"
          @edit="editUser"
          @password="changePassword"
          @toggle="toggleUserStatus"
          @delete="deleteUser"
        />
      </template>
    </DataTable>

    <!-- ✅ SAFETY: Create Modal with safe computed -->
    <UserFormModal
      v-if="canShowCreateModal"
      key="create-user-modal"
      :show-modal="showCreateModal"
      :all-users="users"
      @close="closeCreateModal"
      @saved="handleUserSaved"
    />

    <!-- ✅ SAFETY: Edit Modal with safe computed -->
    <UserFormModal
      v-if="canShowEditModal"
      :key="`edit-user-modal-${safeSelectedUser.user_id || 'new'}`"
      :user="safeSelectedUser"
      :all-users="users"
      @close="closeEditModal"
      @saved="handleUserSaved"
    />

    <!-- ✅ SAFETY: View User Modal with safe computed -->
    <BaseModal
      :open="canShowViewModal"
      title="User Details"
      size="large"
      @close="showViewModal = false"
    >
      <div v-if="safeSelectedUser.user_id" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Account Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Username:</strong> {{ safeSelectedUser.username }}</div>
              <div><strong>Email:</strong> {{ safeSelectedUser.email }}</div>
              <div><strong>Full Name:</strong> {{ userUtils.getDisplayName(safeSelectedUser) }}</div>
              <div><strong>Role:</strong>
                <span :class="userUtils.getRoleBadgeClass(safeSelectedUser.role)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  {{ safeSelectedUser.role?.name || 'No Role' }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Account Status</h4>
            <div class="space-y-2 text-sm">
              <div><strong>User ID:</strong> #{{ safeSelectedUser.user_id }}</div>
              <div><strong>Status:</strong>
                <span :class="userUtils.getStatusBadgeClass(safeSelectedUser.active)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  <ActionIcon
                    :name="safeSelectedUser.active ? 'success' : 'warning'"
                    size="xs"
                    :class="safeSelectedUser.active ? 'text-green-400 mr-1' : 'text-yellow-400 mr-1'"
                  />
                  {{ safeSelectedUser.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div><strong>Last Login:</strong> {{ formatDate(safeSelectedUser.last_login) }}</div>
              <div><strong>Created:</strong> {{ formatDate(safeSelectedUser.created_at) }}</div>
              <div><strong>Last Updated:</strong> {{ formatDate(safeSelectedUser.updated_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Role Permissions -->
        <div v-if="safeSelectedUser.role && safeSelectedUser.role.permissions">
          <h4 class="font-medium text-gray-900 mb-3">Role Permissions</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(actions, resource) in safeSelectedUser.role.permissions"
                :key="resource"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ getResourceLabel(resource) }}: {{ Array.isArray(actions) ? actions.join(', ') : actions }}
              </span>
            </div>
          </div>
        </div>

        <!-- System User Notice -->
        <div v-if="userUtils.isSystemUser(safeSelectedUser)" class="bg-blue-50 border border-blue-200 rounded-md p-4">
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
        <button @click="showViewModal = false" class="btn btn-outline">
          Close
        </button>
      </template>
    </BaseModal>

    <!-- ✅ SAFETY: Password Modal with safe computed -->
    <PasswordManagementModal
      v-if="canShowPasswordModal"
      :user="safeSelectedUser"
      @close="showPasswordModal = false"
      @updated="handlePasswordChanged"
    />

    <!-- ✅ SAFETY: Delete Confirmation Modal with safe computed -->
    <ConfirmationModal
      :open="canShowDeleteModal"
      type="danger"
      entity-name="user"
      :entity-value="safeSelectedUser?.username"
      :loading="deleteLoading"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete user "{{ safeSelectedUser?.username }}"? This action cannot be undone.
        </p>

        <div v-if="safeSelectedUser.user_id && getActiveSessionsCount(safeSelectedUser) > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Warning:</strong> This user has {{ getActiveSessionsCount(safeSelectedUser) }} active session(s).
                Deleting the user will immediately terminate all active sessions.
              </p>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>

    <!-- ✅ SAFETY: Status Toggle Confirmation Modal with safe computed -->
    <ConfirmationModal
      :open="canShowStatusModal"
      :type="statusAction === 'deactivate' ? 'warning' : 'info'"
      :title="`${statusAction === 'deactivate' ? 'Deactivate' : 'Activate'} User`"
      :loading="statusLoading"
      @close="showStatusModal = false"
      @confirm="confirmStatusChange"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to {{ statusAction }} user "{{ safeSelectedUser?.username }}"?
        </p>

        <div v-if="statusAction === 'deactivate' && safeSelectedUser.user_id && getActiveSessionsCount(safeSelectedUser) > 0"
             class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Note:</strong> Deactivating this user will immediately terminate {{ getActiveSessionsCount(safeSelectedUser) }} active session(s).
              </p>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService, userUtils } from '@/services/users'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'
import { usePermissions } from '@/composables/usePermissions'
import api from '@/services/api'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import DataTable from '@/components/tables/DataTable.vue'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'
import PasswordManagementModal from '@/components/admin/users/PasswordManagementModal.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import UserActionButtons from '@/components/admin/users/UserActionButtons.vue'

const authStore = useAuthStore()
const route = useRoute()

// ✅ CONSOLIDATED: Use centralized error handling and permissions
const { handleError } = useErrorHandler('User Management')
const { getResource } = usePermissions()

// Reactive data
const loading = ref(false)
const error = ref('')
const users = ref([])
const availableRoles = ref([]) // For filter dropdown
const userStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  recent: 0
})

// ✅ CONSOLIDATED: Filter states (search handled by DataTable)
const roleFilter = ref('')
const statusFilter = ref('')

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

// ✅ SAFETY: Computed properties to prevent null access
const safeSelectedUser = computed(() => {
  return selectedUser.value || {}
})

const canShowEditModal = computed(() => {
  return !!(showEditModal.value && selectedUser.value && selectedUser.value.user_id)
})

const canShowCreateModal = computed(() => {
  return !!(showCreateModal.value && !showEditModal.value)
})

const canShowPasswordModal = computed(() => {
  return !!(showPasswordModal.value && selectedUser.value && selectedUser.value.user_id)
})

const canShowViewModal = computed(() => {
  return !!(showViewModal.value && selectedUser.value && selectedUser.value.user_id)
})

const canShowDeleteModal = computed(() => {
  return !!(showDeleteModal.value && selectedUser.value && selectedUser.value.user_id)
})

const canShowStatusModal = computed(() => {
  return !!(showStatusModal.value && selectedUser.value && selectedUser.value.user_id)
})

// ✅ SAFETY: Watch for conflicting modal states and resolve them
watch([showCreateModal, showEditModal, showViewModal, showPasswordModal, showDeleteModal, showStatusModal], 
  ([create, edit, view, password, deleteModal, status]) => {
  // Ensure only one modal is open at a time
  const activeModals = [create, edit, view, password, deleteModal, status].filter(Boolean).length
  
  if (activeModals > 1) {
    // Priority order: delete > status > password > edit > view > create
    if (deleteModal) {
      showCreateModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      showPasswordModal.value = false
      showStatusModal.value = false
    } else if (status) {
      showCreateModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      showPasswordModal.value = false
    } else if (password) {
      showCreateModal.value = false
      showEditModal.value = false
      showViewModal.value = false
    } else if (edit) {
      showCreateModal.value = false
      showViewModal.value = false
    } else if (view) {
      showCreateModal.value = false
    }
  }
})

// ✅ SAFETY: Clear selection when modals close
watch([showEditModal, showPasswordModal, showDeleteModal, showStatusModal], 
  ([edit, password, deleteModal, status]) => {
  // If all action modals are closed, clear selection after a delay
  if (!edit && !password && !deleteModal && !status) {
    setTimeout(() => {
      if (!showCreateModal.value && !showViewModal.value && 
          !showEditModal.value && !showPasswordModal.value && 
          !showDeleteModal.value && !showStatusModal.value) {
        selectedUser.value = null
        statusAction.value = ''
      }
    }, 100)
  }
})

// ✅ CONSOLIDATED: Define table columns for DataTable with proper sorting paths
const userColumns = [
  {
    key: 'display_name', // We'll add this computed field to each user
    label: 'User',
    sortable: true,
    searchable: true
  },
  {
    key: 'email',
    label: 'Email & ID',
    sortable: true,
    searchable: true
  },
  {
    key: 'role_name', // We'll add this computed field to each user
    label: 'Role',
    sortable: true,
    searchable: true,
    formatter: (value, item) => value || 'No Role'
  },
  {
    key: 'active', // Sort by boolean value directly
    label: 'Status',
    sortable: true,
    formatter: (value, item) => item.active ? 'Active' : 'Inactive'
  },
  {
    key: 'last_login',
    label: 'Last Login',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false, // Actions column shouldn't be sortable
    cellClass: 'text-right'
  }
]

// ✅ CONSOLIDATED: Permission checks using centralized permissions
const canManageUsers = computed(() => {
  return authStore.hasPermission('users', 'create') ||
         authStore.hasPermission('users', 'update') ||
         authStore.user?.role?.name === 'admin'
})

// ✅ CONSOLIDATED: Format stats for StatsGrid component (matches Contracts pattern)
const userStatsFormatted = computed(() => [
  {
    title: 'Total Users',
    value: userStats.value.total,
    icon: 'users',
    color: 'blue'
  },
  {
    title: 'Active Users',
    value: userStats.value.active,
    icon: 'success',
    color: 'green'
  },
  {
    title: 'Inactive Users',
    value: userStats.value.inactive,
    icon: 'warning',
    color: 'yellow'
  },
  {
    title: 'Recent (30 days)',
    value: userStats.value.recent,
    icon: 'clock',
    color: 'purple'
  }
])

// ✅ CONSOLIDATED: Filtered users for DataTable with enhanced sorting fields
const filteredUsers = computed(() => {
  let filtered = users.value.map(user => ({
    ...user,
    // Add computed fields for better sorting
    display_name: userUtils.getDisplayName(user),
    role_name: user.role?.name || 'No Role',
    status_text: user.active ? 'Active' : 'Inactive'
  }))

  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role_id === parseInt(roleFilter.value))
  }

  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(user => user.active === isActive)
  }

  return filtered
})

// ✅ CONSOLIDATED: Clear filters (search handled by DataTable)
const clearFilters = () => {
  roleFilter.value = ''
  statusFilter.value = ''
}

// ✅ CONSOLIDATED: Use centralized permissions for resource labels
const getResourceLabel = (resourceName) => {
  const resource = getResource(resourceName)
  return resource?.label || resourceName
}

// ✅ SAFETY: Enhanced error handling with recovery
const handleUserError = (error, context = '') => {
  console.error(`User management error ${context}:`, error)
  
  // Reset modal states on error
  showCreateModal.value = false
  showEditModal.value = false
  showPasswordModal.value = false
  showDeleteModal.value = false
  showStatusModal.value = false
  selectedUser.value = null
  statusAction.value = ''
  deleteLoading.value = false
  statusLoading.value = false
  
  return handleError(error)
}

// API functions with enhanced error handling
const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    // First, load the users
    const usersData = await userService.getAll()
    users.value = usersData

    // Then try to get stats from API, but always fallback to generated stats
    let statsData = null
    try {
      statsData = await userService.getStats()
    } catch (statsError) {
      console.info('Stats API not available, generating from user data')
    }

    // Use API stats if available and valid, otherwise generate from user data
    if (statsData && typeof statsData === 'object' && statsData.total !== undefined) {
      userStats.value = statsData
    } else {
      userStats.value = userUtils.generateStats(users.value)
    }

  } catch (err) {
    error.value = handleUserError(err, 'loadUsers')
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await api.get('/auth/roles')
    availableRoles.value = response.data || []
  } catch (err) {
    console.error('Failed to load roles for filter:', err)
    availableRoles.value = []
  }
}

// ✅ SAFETY: Enhanced modal handlers with null safety
const closeCreateModal = () => {
  showCreateModal.value = false
  // Don't clear selectedUser here as it might be used by other modals
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserSaved = (result) => {
  loadUsers()
  if (!result || !result.password) {
    closeCreateModal()
    closeEditModal()
  }
}

const handlePasswordChanged = () => {
  loadUsers()
  showPasswordModal.value = false
  selectedUser.value = null
}

const viewUser = (user) => {
  if (!user || !user.user_id) return
  
  // Close any conflicting modals
  showCreateModal.value = false
  showEditModal.value = false
  showPasswordModal.value = false
  showDeleteModal.value = false
  showStatusModal.value = false
  
  selectedUser.value = { ...user }
  showViewModal.value = true
}

const editUser = (user) => {
  if (!user || !user.user_id) return
  
  // Close any conflicting modals
  showCreateModal.value = false
  showViewModal.value = false
  showPasswordModal.value = false
  showDeleteModal.value = false
  showStatusModal.value = false
  
  selectedUser.value = { ...user }
  showEditModal.value = true
}

const changePassword = (user) => {
  if (!user || !user.user_id) return
  
  // Close any conflicting modals
  showCreateModal.value = false
  showEditModal.value = false
  showViewModal.value = false
  showDeleteModal.value = false
  showStatusModal.value = false
  
  selectedUser.value = { ...user }
  showPasswordModal.value = true
}

const deleteUser = (user) => {
  if (!user || !user.user_id) return
  
  // Close any conflicting modals
  showCreateModal.value = false
  showEditModal.value = false
  showViewModal.value = false
  showPasswordModal.value = false
  showStatusModal.value = false
  
  selectedUser.value = { ...user }
  showDeleteModal.value = true
}

const toggleUserStatus = (user) => {
  if (!user || !user.user_id) return
  
  // Close any conflicting modals
  showCreateModal.value = false
  showEditModal.value = false
  showViewModal.value = false
  showPasswordModal.value = false
  showDeleteModal.value = false
  
  selectedUser.value = { ...user }
  statusAction.value = user.active ? 'deactivate' : 'activate'
  showStatusModal.value = true
}

// ✅ SAFETY: Enhanced deletion with error handling
const confirmDelete = async () => {
  if (!selectedUser.value?.user_id) {
    handleUserError(new Error('No user selected for deletion'), 'confirmDelete')
    return
  }

  deleteLoading.value = true

  try {
    await userService.delete(selectedUser.value.user_id)
    await loadUsers()
    showDeleteModal.value = false
    selectedUser.value = null
  } catch (err) {
    handleUserError(err, 'confirmDelete')
  } finally {
    deleteLoading.value = false
  }
}

// ✅ SAFETY: Enhanced status change with error handling
const confirmStatusChange = async () => {
  if (!selectedUser.value?.user_id || !statusAction.value) {
    handleUserError(new Error('Invalid user or status action'), 'confirmStatusChange')
    return
  }

  statusLoading.value = true

  try {
    const newStatus = statusAction.value === 'activate'
    await userService.toggleStatus(selectedUser.value.user_id, newStatus)

    await loadUsers()
    showStatusModal.value = false
    selectedUser.value = null
    statusAction.value = ''
  } catch (err) {
    handleUserError(err, 'confirmStatusChange')
  } finally {
    statusLoading.value = false
  }
}

// Helper function for mock active sessions (this would come from backend)
const getActiveSessionsCount = (user) => {
  return user.active ? Math.floor(Math.random() * 3) : 0
}

onMounted(async () => {
  // Load data in parallel
  await Promise.allSettled([
    loadUsers(),
    loadRoles()
  ])

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
/* DataTable handles most styling, minimal custom styles needed */
</style>
