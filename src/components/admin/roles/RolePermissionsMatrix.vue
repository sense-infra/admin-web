<template>
  <div class="bg-white border border-gray-200 rounded-lg">
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
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ hasAllPermissions ? 'Remove All' : 'Grant All' }}
          </button>

          <!-- No Permissions Indicator -->
          <div v-if="!canEditRoles" class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
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
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Permissions Matrix -->
      <div v-if="selectedRole" class="space-y-6">
        <!-- System Role Warning -->
        <div v-if="isSystemRole" class="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-amber-800 font-medium">System Role - Editing Disabled</p>
          </div>
          <p class="text-amber-700 text-sm mt-1">
            System roles cannot be edited to maintain security and platform stability. Use the clone feature to create a custom role based on this one.
          </p>
        </div>

        <!-- No Edit Permissions Warning -->
        <div v-else-if="!canEditRoles" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p class="text-blue-800 font-medium">View Only Mode</p>
          </div>
          <p class="text-blue-700 text-sm mt-1">
            You have permission to view role permissions but cannot modify them. Contact an administrator to request permission changes.
          </p>
        </div>

        <!-- Permissions Grid by Category -->
        <div v-for="(categoryInfo, categoryKey) in permissionCategories" :key="categoryKey" class="space-y-4">
          <div class="flex items-center space-x-2">
            <component :is="getCategoryIcon(categoryInfo.icon)" :class="categoryInfo.color" class="w-6 h-6" />
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
                    <component :is="getResourceIcon(resource.icon)" :class="resource.color" class="w-5 h-5 mr-2" />
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
                    <component :is="getActionIcon(action.name)" :class="action.color" class="w-4 h-4 mr-2" />
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
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
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
        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="ml-2 text-red-700 hover:text-red-900 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { rolesService } from '@/services/roles'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['role-updated'])

// Use centralized permissions system
const { 
  getAllResources, 
  getResourcesByCategory, 
  getCategories,
  getResource,
  hasPermission: checkUserPermission
} = usePermissions()

// Add auth store for permission checks
const authStore = useAuthStore()

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

const canCreateRoles = computed(() => {
  return checkUserPermission('roles', 'create')
})

const canDeleteRoles = computed(() => {
  return checkUserPermission('roles', 'delete')
})

// Computed properties
const isSystemRole = computed(() => {
  const role = props.roles.find(r => r.role_id === selectedRole.value)
  return role && ['admin', 'viewer'].includes(role.name.toLowerCase())
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

const getResourceIcon = (iconName) => {
  const icons = {
    'users': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ]),
    'shield-check': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ]),
    'users-multiple': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ]),
    'document-text': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ]),
    'collection': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
    ]),
    'key': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z' })
    ]),
    'desktop-computer': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ]),
    'video-camera': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
    ]),
    'server': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' })
    ]),
    'bell': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 17h5l-5 5v-5zM12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    'wifi': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' })
    ]),
    'cog': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' })
    ]),
    'book-open': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
    ]),
    'chart-bar': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
    ]),
    'briefcase': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v10a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2' })
    ]),
    'lock-closed': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' })
    ]),
    'eye': () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
    ])
  }

  return icons[iconName] || icons.users
}

const getCategoryIcon = (iconName) => {
  return getResourceIcon(iconName)
}

const getActionIcon = (actionName) => {
  const icons = {
    read: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
    ]),
    create: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })
    ]),
    update: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' })
    ]),
    delete: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
    ])
  }

  return icons[actionName] || icons.read
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

  // Check if user has permission to read roles
  if (!canReadRoles.value) {
    error.value = 'Permission denied. You do not have permission to view role details.'
    return
  }

  try {
    console.log('📋 Loading permissions for role:', selectedRole.value)

    const role = await rolesService.getById(selectedRole.value)

    console.log('📊 Role data received:', role)

    // Ensure permissions is an object, not a string
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

    console.log('✅ Permissions loaded:', currentPermissions.value)
  } catch (err) {
    if (err.response?.status === 403) {
      error.value = 'Permission denied. You do not have permission to view role details.'
    } else {
      error.value = 'Failed to load role permissions'
    }
    console.error('❌ Failed to load role permissions:', err)
  }
}

const saveChanges = async () => {
  if (!selectedRole.value || saving.value || isSystemRole.value || !canEditRoles.value) return

  try {
    saving.value = true

    // Get the full role data first
    const role = props.roles.find(r => r.role_id === selectedRole.value)
    if (!role) {
      throw new Error('Role not found')
    }

    console.log('🔧 Updating role permissions:', {
      roleId: selectedRole.value,
      roleName: role.name,
      permissions: currentPermissions.value
    })

    // Update with complete role data, not just permissions
    const updateData = {
      name: role.name,
      description: role.description || null,
      permissions: currentPermissions.value,
      active: role.active !== false
    }

    console.log('📤 Sending update data:', updateData)

    await rolesService.update(selectedRole.value, updateData)

    console.log('✅ Role permissions updated successfully')

    originalPermissions.value = { ...currentPermissions.value }
    pendingChanges.value = 0
    error.value = ''

    // Emit event to parent to refresh roles
    emit('role-updated')
  } catch (err) {
    console.error('❌ Failed to save permissions:', err)

    // More detailed error handling
    if (err.response?.status === 403) {
      error.value = 'Permission denied. You may not have the required permissions to update roles.'
    } else if (err.response?.status === 400) {
      error.value = `Invalid request: ${err.response?.data?.message || 'Bad request'}`
    } else if (err.response?.status === 404) {
      error.value = 'Role not found. It may have been deleted.'
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to save permissions'
    }
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
    }, 2000) // Auto-save after 2 seconds of inactivity
  }
}, { deep: true })

// Watch for role selection changes
watch(selectedRole, () => {
  loadRolePermissions()
})

onMounted(() => {
  // Check if user has permission to read roles at all
  if (!canReadRoles.value) {
    error.value = 'Permission denied. You do not have permission to view roles.'
  }
})
</script>
