<template>
  <div class="card">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Role Permissions Matrix</h3>
      <p class="mt-1 text-sm text-gray-600">
        Configure permissions for each role. Changes are saved automatically.
      </p>
    </div>

    <div class="p-6">
      <!-- Quick Actions -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select
            v-model="selectedRole"
            @change="loadRolePermissions"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a role to edit</option>
            <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
              {{ role.name }} ({{ role.user_count || 0 }} users)
            </option>
          </select>

          <button
            v-if="selectedRole && !isSystemRole && canEditRoles"
            @click="toggleAllPermissions"
            class="btn btn-outline"
          >
            {{ hasAllPermissions ? 'Remove All' : 'Grant All' }}
          </button>

          <!-- No Permissions Indicator -->
          <div v-if="!canEditRoles" class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <ActionIcon name="eye" size="xs" class="mr-1" />
              View Only Mode
            </span>
          </div>
        </div>

        <div v-if="selectedRole" class="flex items-center space-x-2">
          <span :class="pendingChanges > 0 ? 'text-amber-600' : 'text-green-600'" class="text-sm font-medium">
            {{ pendingChanges > 0 ? `${pendingChanges} unsaved changes` : 'All changes saved' }}
          </span>
          <button
            v-if="pendingChanges > 0 && canEditRoles"
            @click="saveChanges"
            :disabled="saving"
            class="btn btn-primary"
          >
            <ActionIcon name="save" size="xs" class="mr-1" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Permissions Matrix -->
      <div v-if="selectedRole" class="space-y-6">
        <!-- System Role Warning -->
        <div v-if="isSystemRole" class="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="warning" size="sm" class="text-amber-400 mr-2" />
            <p class="text-amber-800 font-medium">System Role - Editing Disabled</p>
          </div>
          <p class="text-amber-700 text-sm mt-1">
            System roles cannot be edited to maintain security and platform stability. Use the clone feature to create a custom role based on this one.
          </p>
        </div>

        <!-- No Edit Permissions Warning -->
        <div v-else-if="!canEditRoles" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="eye" size="sm" class="text-blue-400 mr-2" />
            <p class="text-blue-800 font-medium">View Only Mode</p>
          </div>
          <p class="text-blue-700 text-sm mt-1">
            You have permission to view role permissions but cannot modify them. Contact an administrator to request permission changes.
          </p>
        </div>

        <!-- Permissions Grid by Category -->
        <div v-for="(categoryInfo, categoryKey) in permissionCategories" :key="categoryKey" class="space-y-4">
          <div class="flex items-center space-x-2">
            <ActionIcon :name="categoryInfo.icon" size="md" :class="categoryInfo.color" />
            <h3 class="text-lg font-semibold text-gray-900">{{ categoryInfo.label }}</h3>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="resource in getResourcesByCategory(categoryKey)"
              :key="resource.name"
              class="border border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Resource Header -->
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <ActionIcon :name="resource.icon" size="sm" :class="resource.color" class="mr-2" />
                    <h4 class="font-medium text-gray-900">{{ resource.label }}</h4>
                  </div>
                  <button
                    v-if="!isSystemRole && canEditRoles"
                    @click="toggleResourcePermissions(resource.name)"
                    class="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {{ hasAllResourcePermissions(resource.name) ? 'None' : 'All' }}
                  </button>
                  <div v-else-if="!canEditRoles" class="flex items-center">
                    <span class="text-xs text-gray-500">View Only</span>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ resource.description }}</p>
              </div>

              <!-- Actions List -->
              <div class="p-4 space-y-3">
                <label
                  v-for="action in resource.actions"
                  :key="`${resource.name}-${action.name}`"
                  class="flex items-center space-x-3 cursor-pointer group"
                  :class="{
                    'opacity-50 cursor-not-allowed': isSystemRole || !canEditRoles
                  }"
                >
                  <input
                    type="checkbox"
                    :checked="hasPermission(resource.name, action.name)"
                    @change="togglePermission(resource.name, action.name, $event.target.checked)"
                    :disabled="isSystemRole || !canEditRoles"
                    class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div class="flex items-center flex-1">
                    <ActionIcon :name="getActionIcon(action.name)" size="xs" :class="action.color" class="mr-2" />
                    <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {{ action.label }}
                    </span>
                  </div>
                  <span v-if="action.risk" :class="getRiskBadgeClass(action.risk)" class="text-xs px-2 py-1 rounded-full">
                    {{ action.risk }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Permission Summary -->
        <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <h4 class="font-medium text-purple-900 mb-2">Permission Summary</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(actions, resource) in currentPermissions"
              :key="resource"
              class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
            >
              {{ getResourceLabel(resource) }}: {{ actions.join(', ') }}
            </span>
          </div>
          <p class="text-xs text-purple-600 mt-2">
            Total: {{ Object.keys(currentPermissions).length }} resources,
            {{ Object.values(currentPermissions).flat().length }} permissions
          </p>
        </div>
      </div>

      <!-- No Role Selected State -->
      <div v-else class="text-center py-12">
        <ActionIcon name="shield" size="xl" class="mx-auto text-gray-400" />
        <p class="mt-2 text-lg font-medium text-gray-900">Select a Role</p>
        <p class="text-sm text-gray-500">Choose a role from the dropdown to edit its permissions</p>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md"
    >
      <div class="flex items-start">
        <ActionIcon name="warning" size="sm" class="mr-2 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="ml-2 text-red-700 hover:text-red-900 flex-shrink-0">
          <ActionIcon name="x" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { rolesService, roleUtils } from '@/services/roles'
import { useErrorHandler } from '@/utils/errorHandling'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['role-updated'])

const authStore = useAuthStore()
const { handleError } = useErrorHandler('Role Permissions')

// ✅ CONSOLIDATED: Use centralized permissions system
const {
  getAllResources,
  getResourcesByCategory,
  getCategories,
  getResource,
  hasPermission: checkUserPermission
} = usePermissions()

const selectedRole = ref('')
const currentPermissions = ref({})
const originalPermissions = ref({})
const pendingChanges = ref(0)
const saving = ref(false)
const error = ref('')

// Get centralized permission data
const permissionResources = getAllResources()
const permissionCategories = getCategories()

// Permission checks based on current user's role
const canReadRoles = computed(() => {
  return checkUserPermission('roles', 'read')
})

const canEditRoles = computed(() => {
  return checkUserPermission('roles', 'update')
})

// Computed properties
const isSystemRole = computed(() => {
  const role = props.roles.find(r => r.role_id === selectedRole.value)
  return role && roleUtils.isSystemRole(role)
})

const hasAllPermissions = computed(() => {
  const totalActions = permissionResources.reduce((sum, resource) => sum + resource.actions.length, 0)
  const currentActions = Object.values(currentPermissions.value).flat().length
  return currentActions === totalActions
})

// Helper methods using centralized data
const getResourceLabel = (resourceName) => {
  const resource = getResource(resourceName)
  return resource?.label || resourceName
}

const getActionIcon = (actionName) => {
  const icons = {
    read: 'view',
    create: 'add',
    update: 'edit',
    delete: 'delete'
  }
  return icons[actionName] || 'cog'
}

const getRiskBadgeClass = (risk) => {
  const classes = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return classes[risk] || classes.low
}

// Permission management methods
const hasPermission = (resource, action) => {
  return currentPermissions.value[resource]?.includes(action) || false
}

const hasAllResourcePermissions = (resource) => {
  const resourceConfig = getResource(resource)
  if (!resourceConfig) return false

  const userActions = currentPermissions.value[resource] || []
  return resourceConfig.actions.every(action => userActions.includes(action.name))
}

const togglePermission = (resource, action, checked) => {
  if (isSystemRole.value || !canEditRoles.value) return

  if (!currentPermissions.value[resource]) {
    currentPermissions.value[resource] = []
  }

  if (checked) {
    if (!currentPermissions.value[resource].includes(action)) {
      currentPermissions.value[resource].push(action)
    }
  } else {
    currentPermissions.value[resource] = currentPermissions.value[resource].filter(a => a !== action)
    if (currentPermissions.value[resource].length === 0) {
      delete currentPermissions.value[resource]
    }
  }

  calculatePendingChanges()
}

const toggleResourcePermissions = (resource) => {
  if (isSystemRole.value || !canEditRoles.value) return

  const resourceConfig = getResource(resource)
  if (!resourceConfig) return

  const hasAll = hasAllResourcePermissions(resource)

  if (hasAll) {
    delete currentPermissions.value[resource]
  } else {
    currentPermissions.value[resource] = resourceConfig.actions.map(action => action.name)
  }

  calculatePendingChanges()
}

const toggleAllPermissions = () => {
  if (isSystemRole.value || !canEditRoles.value) return

  if (hasAllPermissions.value) {
    currentPermissions.value = {}
  } else {
    const allPermissions = {}
    permissionResources.forEach(resource => {
      allPermissions[resource.name] = resource.actions.map(action => action.name)
    })
    currentPermissions.value = allPermissions
  }

  calculatePendingChanges()
}

const calculatePendingChanges = () => {
  const original = JSON.stringify(originalPermissions.value)
  const current = JSON.stringify(currentPermissions.value)
  pendingChanges.value = original === current ? 0 : 1
}

const loadRolePermissions = async () => {
  if (!selectedRole.value) {
    currentPermissions.value = {}
    originalPermissions.value = {}
    pendingChanges.value = 0
    return
  }

  if (!canReadRoles.value) {
    error.value = 'Permission denied. You do not have permission to view role details.'
    return
  }

  try {
    const role = await rolesService.getById(selectedRole.value)

    let permissions = role.permissions || {}
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions)
      } catch (e) {
        console.warn('Failed to parse permissions string:', permissions)
        permissions = {}
      }
    }

    currentPermissions.value = { ...permissions }
    originalPermissions.value = { ...permissions }
    pendingChanges.value = 0
    error.value = ''
  } catch (err) {
    error.value = handleError(err)
  }
}

const saveChanges = async () => {
  if (!selectedRole.value || saving.value || isSystemRole.value || !canEditRoles.value) return

  try {
    saving.value = true

    const role = props.roles.find(r => r.role_id === selectedRole.value)
    if (!role) {
      throw new Error('Role not found')
    }

    const updateData = {
      name: role.name,
      description: role.description || null,
      permissions: currentPermissions.value,
      active: role.active !== false
    }

    await rolesService.update(selectedRole.value, updateData)

    originalPermissions.value = { ...currentPermissions.value }
    pendingChanges.value = 0
    error.value = ''

    emit('role-updated')
  } catch (err) {
    error.value = handleError(err)
  } finally {
    saving.value = false
  }
}

// Auto-save debounced
let saveTimeout = null
watch(currentPermissions, () => {
  if (pendingChanges.value > 0 && !isSystemRole.value && canEditRoles.value) {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveChanges()
    }, 2000)
  }
}, { deep: true })

// Watch for role selection changes
watch(selectedRole, () => {
  loadRolePermissions()
})

onMounted(() => {
  if (!canReadRoles.value) {
    error.value = 'Permission denied. You do not have permission to view roles.'
  }
})
</script>
