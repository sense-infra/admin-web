<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Role Management</h1>
      <p class="text-gray-600">Manage system roles, permissions, and user assignments</p>
    </div>

    <!-- ✅ CONSOLIDATED: Stats Grid using reusable component -->
    <StatsGrid :stats="roleStatsFormatted" />

    <!-- ✅ CONSOLIDATED: Filter Bar -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex gap-2">
            <select v-model="statusFilter" class="border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select v-model="typeFilter" class="border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Types</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
          </div>
          <div class="flex gap-2 ml-auto">
            <button @click="clearFilters" class="btn btn-outline">
              <ActionIcon name="clear" size="xs" class="mr-1" />
              Clear Filters
            </button>
            <button @click="loadRoles" class="btn btn-outline">
              <ActionIcon name="refresh" size="xs" class="mr-1" />
              Refresh
            </button>
            <button v-if="canManageRoles" @click="showCreateModal = true" class="btn btn-primary">
              <ActionIcon name="add" size="xs" class="mr-1" />
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ CONSOLIDATED: Tab Navigation -->
    <div class="mb-6">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          <ActionIcon :name="tab.icon" size="xs" class="mr-2" />
          {{ tab.name }}
          <span v-if="tab.count !== undefined" class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- ✅ CONSOLIDATED: Tab Content -->
    <div v-if="activeTab === 'overview'">
      <!-- DataTable -->
      <DataTable
        :items="filteredRoles"
        :columns="roleColumns"
        :loading="loading"
        :error="error"
        title="System Roles"
        :searchable="true"
        search-placeholder="Search roles..."
        :search-columns="['name', 'description']"
        :paginated="true"
        :sortable="true"
        :clickable-rows="true"
        @refresh="loadRoles"
        @row-click="viewRole"
      >
        <!-- Custom cell templates -->
        <template #cell-name="{ item }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <ActionIcon name="shield" size="sm" class="text-white" />
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900 flex items-center">
                {{ item.name }}
                <span v-if="roleUtils.isSystemRole(item)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <ActionIcon name="lock" size="xs" class="mr-1" />
                  System
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ item.description || 'No description' }}
              </div>
            </div>
          </div>
        </template>

        <template #cell-permissions="{ item }">
          <div class="max-w-xs">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(actions, resource) in (item.permissions || {})"
                :key="resource"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ getResourceLabel(resource) }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ roleUtils.countPermissions(item) }} total permissions
            </div>
          </div>
        </template>

        <template #cell-status="{ item }">
          <span :class="roleUtils.getStatusBadgeClass(item.active)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            <ActionIcon :name="item.active ? 'success' : 'warning'" size="xs" class="mr-1" />
            {{ item.active ? 'Active' : 'Inactive' }}
          </span>
        </template>

        <template #cell-users="{ item }">
          <div class="flex items-center text-sm text-gray-500">
            <ActionIcon name="users" size="xs" class="mr-2 text-gray-400" />
            {{ item.user_count || 0 }} users
          </div>
        </template>

        <template #cell-created_at="{ item }">
          <div class="text-sm text-gray-500">
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <template #cell-actions="{ item }">
          <RoleActionButtons
            :role="item"
            :can-manage="canManageRoles"
            :is-protected="roleUtils.isSystemRole(item)"
            @view="viewRole"
            @edit="editRole"
            @clone="cloneRole"
            @delete="deleteRole"
            @toggle-status="toggleRoleStatus"
          />
        </template>
      </DataTable>
    </div>

    <!-- Permissions Matrix Tab -->
    <div v-if="activeTab === 'permissions'">
      <RolePermissionsMatrix
        :roles="roles"
        @role-updated="handleRoleUpdated"
      />
    </div>

    <!-- Users Management Tab -->
    <div v-if="activeTab === 'users'">
      <RoleUsersList
        :roles="roles"
        @user-updated="handleUserUpdated"
        @role-changed="handleRoleChanged"
        @users-loaded="handleUsersLoaded"
      />
    </div>

    <!-- ✅ FIXED: Modals with proper state management and safety checks -->
    <RoleFormModal
      v-if="canShowCreateModal"
      key="create-role-modal"
      :show-modal="showCreateModal"
      :all-roles="roles"
      @close="closeCreateModal"
      @saved="handleRoleSaved"
    />

    <RoleFormModal
      v-if="canShowEditModal"
      :key="`edit-role-modal-${safeSelectedRole.role_id || 'new'}-${isCloning ? 'clone' : 'edit'}`"
      :role="safeSelectedRole"
      :is-clone="isCloning"
      :all-roles="roles"
      @close="closeEditModal"
      @saved="handleRoleSaved"
    />

    <!-- View Role Modal -->
    <BaseModal
      :open="showViewModal && !!selectedRole"
      title="Role Details"
      size="large"
      @close="showViewModal = false"
    >
      <div v-if="safeSelectedRole.role_id" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Role Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Name:</strong> {{ safeSelectedRole.name }}</div>
              <div><strong>Description:</strong> {{ safeSelectedRole.description || 'No description' }}</div>
              <div><strong>Type:</strong>
                <span :class="roleUtils.isSystemRole(safeSelectedRole) ? 'text-blue-600' : 'text-purple-600'">
                  {{ roleUtils.isSystemRole(safeSelectedRole) ? 'System Role' : 'Custom Role' }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Role Status</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Role ID:</strong> #{{ safeSelectedRole.role_id }}</div>
              <div><strong>Status:</strong>
                <span :class="roleUtils.getStatusBadgeClass(safeSelectedRole.active)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  <ActionIcon
                    :name="safeSelectedRole.active ? 'success' : 'warning'"
                    size="xs"
                    class="mr-1"
                  />
                  {{ safeSelectedRole.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div><strong>Users:</strong> {{ safeSelectedRole.user_count || 0 }}</div>
              <div><strong>Created:</strong> {{ formatDate(safeSelectedRole.created_at) }}</div>
              <div><strong>Last Updated:</strong> {{ formatDate(safeSelectedRole.updated_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Role Permissions -->
        <div v-if="safeSelectedRole.permissions && Object.keys(safeSelectedRole.permissions).length > 0">
          <h4 class="font-medium text-gray-900 mb-3">Role Permissions</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(actions, resource) in safeSelectedRole.permissions"
                :key="resource"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ getResourceLabel(resource) }}: {{ Array.isArray(actions) ? actions.join(', ') : actions }}
              </span>
            </div>
            <div class="mt-2 text-sm text-gray-600">
              Total: {{ roleUtils.countPermissions(safeSelectedRole) }} permissions
            </div>
          </div>
        </div>

        <!-- System Role Notice -->
        <div v-if="roleUtils.isSystemRole(safeSelectedRole)" class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <ActionIcon name="info" size="sm" class="text-blue-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm text-blue-800">
                <strong>System Role:</strong> This is a protected system role that cannot be modified or deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="showViewModal = false" class="btn btn-outline">
            Close
          </button>
          <button
            v-if="canManageRoles && safeSelectedRole.role_id && !roleUtils.isSystemRole(safeSelectedRole)"
            @click="editFromView"
            class="btn btn-primary"
          >
            <ActionIcon name="edit" size="xs" class="mr-1" />
            Edit Role
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- ✅ CONSOLIDATED: Delete Confirmation Modal -->
    <RoleDeleteConfirmationModal
      v-if="showDeleteModal && selectedRole"
      :role="selectedRole"
      :available-roles="availableRolesForReassignment"
      @close="showDeleteModal = false"
      @deleted="handleRoleDeleted"
      @reassigned="handleUsersReassigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { rolesService, roleUtils } from '@/services/roles'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'
import { usePermissions } from '@/composables/usePermissions'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import DataTable from '@/components/tables/DataTable.vue'
import RoleFormModal from '@/components/admin/roles/RoleFormModal.vue'
import RolePermissionsMatrix from '@/components/admin/roles/RolePermissionsMatrix.vue'
import RoleUsersList from '@/components/admin/roles/RoleUsersList.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import RoleActionButtons from '@/components/admin/roles/RoleActionButtons.vue'
import RoleDeleteConfirmationModal from '@/components/admin/roles/RoleDeleteConfirmationModal.vue'

const authStore = useAuthStore()
const route = useRoute()
const { handleError } = useErrorHandler('Role Management')

// ✅ CONSOLIDATED: Use centralized permissions for resource labels
const { getResource } = usePermissions()

// Reactive state
const loading = ref(false)
const error = ref('')
const roles = ref([])
const roleStats = ref({ total: 0, active: 0, inactive: 0, system: 0 })
const userStats = ref({ total: 0, active: 0, inactive: 0 })

// ✅ CONSOLIDATED: Filter states
const statusFilter = ref('')
const typeFilter = ref('')

// Tabs
const activeTab = ref('overview')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const isCloning = ref(false)

// ✅ FIXED: Safety computed properties to prevent null access
const safeSelectedRole = computed(() => {
  return selectedRole.value || {}
})

const canShowEditModal = computed(() => {
  return showEditModal.value && selectedRole.value && selectedRole.value.role_id
})

const canShowCreateModal = computed(() => {
  return showCreateModal.value && !showEditModal.value
})

// ✅ CONSOLIDATED: Define table columns for DataTable
const roleColumns = [
  {
    key: 'name',
    label: 'Role',
    sortable: true,
    searchable: true
  },
  {
    key: 'permissions',
    label: 'Permissions',
    sortable: false
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    formatter: (value) => value ? 'Active' : 'Inactive'
  },
  {
    key: 'users',
    label: 'Users',
    sortable: true,
    formatter: (value, item) => `${item.user_count || 0} users`
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
    sortable: false,
    cellClass: 'text-right'
  }
]

// Computed properties
const canManageRoles = computed(() => {
  return authStore.hasPermission('roles', 'create') ||
         authStore.hasPermission('roles', 'update') ||
         authStore.user?.role?.name === 'admin'
})

const tabs = computed(() => [
  {
    id: 'overview',
    name: 'Overview',
    icon: 'shield',
    count: roles.value?.length || 0
  },
  {
    id: 'permissions',
    name: 'Permissions',
    icon: 'lock'
  },
  {
    id: 'users',
    name: 'User Management',
    icon: 'users',
    count: userStats.value?.total || 0
  }
])

// ✅ CONSOLIDATED: Format stats for StatsGrid component
const roleStatsFormatted = computed(() => [
  {
    title: 'Total Roles',
    value: roleStats.value?.total || 0,
    icon: 'shield',
    color: 'blue'
  },
  {
    title: 'Active',
    value: roleStats.value?.active || 0,
    icon: 'success',
    color: 'green'
  },
  {
    title: 'Inactive',
    value: roleStats.value?.inactive || 0,
    icon: 'warning',
    color: 'yellow'
  },
  {
    title: 'System Roles',
    value: roleStats.value?.system || 0,
    icon: 'lock',
    color: 'red'
  }
])

// ✅ CONSOLIDATED: Filtered roles for DataTable
const filteredRoles = computed(() => {
  if (!roles.value || !Array.isArray(roles.value)) return []

  let filtered = roles.value

  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(role => role.active === isActive)
  }

  // Apply type filter
  if (typeFilter.value) {
    const isSystem = typeFilter.value === 'system'
    filtered = filtered.filter(role => roleUtils.isSystemRole(role) === isSystem)
  }

  return filtered
})

// Available roles for reassignment (excluding the role being deleted)
const availableRolesForReassignment = computed(() => {
  if (!selectedRole.value) return roles.value
  return roles.value.filter(role =>
    role.role_id !== selectedRole.value.role_id &&
    role.active &&
    !roleUtils.isSystemRole(role)
  )
})

// ✅ FIXED: Watch for conflicting modal states and resolve them
watch([showCreateModal, showEditModal, showViewModal, showDeleteModal], ([create, edit, view, deleteModal]) => {
  // Ensure only one modal is open at a time
  if (create && (edit || view || deleteModal)) {
    showEditModal.value = false
    showViewModal.value = false
    showDeleteModal.value = false
  }
  if (edit && (view || deleteModal)) {
    showViewModal.value = false
    showDeleteModal.value = false
  }
  if (view && deleteModal) {
    showDeleteModal.value = false
  }
})

// ✅ FIXED: Clear selection when modals close
watch(showEditModal, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      if (!showCreateModal.value && !showViewModal.value && !showDeleteModal.value) {
        selectedRole.value = null
        isCloning.value = false
      }
    }, 100)
  }
})

// Helper function to get resource label using centralized permissions
const getResourceLabel = (resourceName) => {
  const resource = getResource(resourceName)
  return resource?.label || resourceName
}

// ✅ CONSOLIDATED: Clear filters
const clearFilters = () => {
  statusFilter.value = ''
  typeFilter.value = ''
}

// API functions
const loadRoles = async () => {
  loading.value = true
  error.value = ''

  try {
    const rolesData = await rolesService.getAll()

    // Fetch user counts for each role
    const rolesWithCounts = await Promise.all(
      rolesData.map(async (role) => {
        try {
          const usageResponse = await rolesService.getUsage(role.role_id)
          const userCount = usageResponse?.total_user_count || 0
          return {
            ...role,
            user_count: userCount
          }
        } catch (err) {
          console.warn(`Failed to get user count for role ${role.name}:`, err)
          return {
            ...role,
            user_count: 0
          }
        }
      })
    )

    roles.value = Array.isArray(rolesWithCounts) ? rolesWithCounts : []
    roleStats.value = roleUtils.generateStats(roles.value)

    // Calculate total users across all roles
    const totalUsers = rolesWithCounts.reduce((sum, role) => sum + (role.user_count || 0), 0)
    userStats.value = {
      total: totalUsers,
      active: 0, // Will be updated when users tab is loaded
      inactive: 0
    }

  } catch (err) {
    console.error('Error loading roles:', err)
    error.value = handleError(err)
    roles.value = []
    roleStats.value = { total: 0, active: 0, inactive: 0, system: 0 }
    userStats.value = { total: 0, active: 0, inactive: 0 }
  } finally {
    loading.value = false
  }
}

// ✅ FIXED: Modal handlers with enhanced safety
const closeCreateModal = () => {
  showCreateModal.value = false
  selectedRole.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedRole.value = null
  isCloning.value = false
}

const handleRoleSaved = async (result) => {
  await loadRoles()
  
  // Close modals safely
  if (showCreateModal.value) {
    closeCreateModal()
  }
  if (showEditModal.value) {
    closeEditModal()
  }
}

const handleRoleUpdated = async () => {
  await loadRoles()
}

const handleUserUpdated = async () => {
  await loadRoles()
}

const handleRoleChanged = async () => {
  await loadRoles()
}

const handleUsersLoaded = (usersData) => {
  userStats.value = {
    total: usersData?.total || 0,
    active: usersData?.active || 0,
    inactive: usersData?.inactive || 0
  }
}

const handleRoleDeleted = async () => {
  showDeleteModal.value = false
  selectedRole.value = null
  await loadRoles()
}

const handleUsersReassigned = async () => {
  await loadRoles()
}

// ✅ FIXED: Role actions with null safety
const viewRole = (role) => {
  if (!role) return
  selectedRole.value = { ...role }
  showViewModal.value = true
}

const editRole = (role) => {
  if (!role) return
  
  // Close any open modals first
  showCreateModal.value = false
  showViewModal.value = false
  
  // Then open edit modal
  selectedRole.value = { ...role }
  isCloning.value = false
  showEditModal.value = true
}

const editFromView = () => {
  if (!selectedRole.value) return
  
  showViewModal.value = false
  showEditModal.value = true
}

const cloneRole = (role) => {
  if (!role) return
  
  // Close any open modals first
  showCreateModal.value = false
  showViewModal.value = false
  
  // Then open clone modal
  selectedRole.value = { ...role }
  isCloning.value = true
  showEditModal.value = true
}

const deleteRole = (role) => {
  if (!role) return
  selectedRole.value = { ...role }
  showDeleteModal.value = true
}

const toggleRoleStatus = async (role) => {
  if (!role || roleUtils.isSystemRole(role)) {
    error.value = 'Cannot modify system roles'
    return
  }

  const action = role.active ? 'deactivate' : 'activate'

  if (!confirm(`Are you sure you want to ${action} role "${role.name}"?`)) return

  try {
    await rolesService.toggleStatus(role.role_id, !role.active)
    await loadRoles()
  } catch (err) {
    console.error(`Error ${action}ing role:`, err)
    error.value = handleError(err)
  }
}

onMounted(async () => {
  await loadRoles()

  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    const role = roles.value.find(r => r.role_id === parseInt(viewId))
    if (role) {
      viewRole(role)
    }
  }
})
</script>

<style scoped>
/* DataTable handles most styling, minimal custom styles needed */
</style>
