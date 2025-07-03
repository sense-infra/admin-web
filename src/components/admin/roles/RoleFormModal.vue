<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
      <form @submit.prevent="handleSubmit">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEdit ? (isClone ? 'Clone Role' : 'Edit Role') : 'Create Role' }}
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                :disabled="isSystemRole"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="e.g., Manager"
              />
              <p v-if="isSystemRole" class="mt-1 text-xs text-yellow-600">
                System role names cannot be changed
              </p>
            </div>

            <div class="flex items-end">
              <label class="flex items-center space-x-2">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span class="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Describe this role and its purpose..."
            ></textarea>
          </div>

          <!-- Role Type Quick Selection -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Setup</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  @click="applyRoleDefaults('admin')"
                  class="px-3 py-2 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Admin (Full Access)
                </button>
                <button
                  type="button"
                  @click="applyRoleDefaults('manager')"
                  class="px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Manager
                </button>
                <button
                  type="button"
                  @click="applyRoleDefaults('operator')"
                  class="px-3 py-2 text-sm font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Operator
                </button>
                <button
                  type="button"
                  @click="applyRoleDefaults('viewer')"
                  class="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Viewer (Read Only)
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-600">
                Start with a template, then customize below. Current pattern: 
                <span class="font-medium">{{ currentRoleType }}</span>
              </p>
            </div>
          </div>

          <!-- Permissions Section -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-medium text-gray-700">Permissions *</h4>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="setAllPermissions(form.permissions)"
                  class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Select All
                </button>
                <button
                  type="button"
                  @click="clearAllPermissions(form.permissions)"
                  class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg space-y-6">
              <!-- Permission Categories -->
              <div v-for="(category, categoryKey) in categories" :key="categoryKey" class="bg-white rounded-lg border p-4">
                <!-- Category Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <component :is="getCategoryIcon(categoryKey)" class="w-5 h-5 mr-3" :class="category.color" />
                    <div>
                      <h5 class="font-medium text-gray-900">{{ category.label }}</h5>
                      <p class="text-xs text-gray-500">{{ category.description }}</p>
                    </div>
                  </div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="hasAllCategoryPermissions(form.permissions, categoryKey)"
                      @change="setCategoryPermissions(form.permissions, categoryKey, $event.target.checked)"
                      class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">All</span>
                  </label>
                </div>

                <!-- Resources in Category -->
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div 
                    v-for="resource in getResourcesByCategory(categoryKey)" 
                    :key="resource.name" 
                    class="border rounded-lg p-3 bg-gray-50"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h6 class="font-medium text-gray-900 text-sm flex items-center">
                        <component :is="getResourceIcon(resource.name)" class="w-4 h-4 mr-2" :class="resource.color" />
                        {{ resource.label }}
                      </h6>
                      <button
                        type="button"
                        @click="toggleResourcePermissions(form.permissions, resource.name)"
                        class="text-xs px-2 py-1 rounded"
                        :class="hasAllResourcePermissions(resource.name) ? 
                          'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'"
                      >
                        {{ hasAllResourcePermissions(resource.name) ? 'All' : 'None' }}
                      </button>
                    </div>
                    
                    <div class="space-y-2">
                      <label
                        v-for="action in resource.actions"
                        :key="action.name"
                        class="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          :checked="hasPermission(form.permissions, resource.name, action.name)"
                          @change="togglePermission(form.permissions, resource.name, action.name, $event.target.checked)"
                          class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span class="flex items-center flex-1">
                          <component :is="getActionIcon(action.name)" class="w-3 h-3 mr-1" :class="action.color" />
                          <span class="flex-1">{{ action.label }}</span>
                          <span 
                            v-if="action.risk && ['high', 'critical'].includes(action.risk)"
                            class="text-xs px-1 py-0.5 rounded ml-1"
                            :class="action.risk === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'"
                          >
                            {{ action.risk }}
                          </span>
                        </span>
                      </label>
                    </div>
                    
                    <p v-if="resource.description" class="text-xs text-gray-500 mt-2 italic">
                      {{ resource.description }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Permission Summary -->
              <div v-if="Object.keys(form.permissions).length > 0" class="mt-6 p-4 bg-purple-50 rounded-lg">
                <div class="flex justify-between items-start mb-3">
                  <h6 class="text-sm font-medium text-purple-900">Permission Summary</h6>
                  <div class="text-xs text-purple-700">
                    {{ permissionStats.totalResources }} resources, {{ permissionStats.totalActions }} actions
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 class="text-xs font-medium text-purple-800 mb-2">By Category:</h6>
                    <div class="space-y-1">
                      <div 
                        v-for="(count, category) in permissionStats.resourceBreakdown" 
                        :key="category"
                        class="flex justify-between text-xs"
                      >
                        <span class="text-purple-700">{{ categories[category]?.label || category }}:</span>
                        <span class="text-purple-900 font-medium">{{ count }} actions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h6 class="text-xs font-medium text-purple-800 mb-2">Risk Breakdown:</h6>
                    <div class="space-y-1">
                      <div 
                        v-for="(count, risk) in permissionStats.riskBreakdown" 
                        :key="risk"
                        v-show="count > 0"
                        class="flex justify-between text-xs"
                      >
                        <span class="text-purple-700 capitalize">{{ risk }} Risk:</span>
                        <span 
                          class="font-medium"
                          :class="{
                            'text-green-700': risk === 'low',
                            'text-yellow-700': risk === 'medium', 
                            'text-orange-700': risk === 'high',
                            'text-red-700': risk === 'critical'
                          }"
                        >
                          {{ count }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            {{ loading ? 'Saving...' : (isEdit ? 'Update Role' : 'Create Role') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, h } from 'vue'
import { rolesService } from '@/services/roles'
import { useRolePermissions } from '@/composables/usePermissions'

const props = defineProps({
  role: {
    type: Object,
    default: null
  },
  isClone: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref('')

// Use the centralized permissions composable
const {
  availableResources,
  categories,
  generateDefaultPermissions,
  getResourcesByCategory,
  validateRoleData,
  matchesRoleType,
  hasPermission,
  togglePermission,
  toggleResourcePermissions,
  setCategoryPermissions,
  hasAllCategoryPermissions,
  setAllPermissions,
  clearAllPermissions
} = useRolePermissions()

// Import the permission stats function
import { usePermissions } from '@/composables/usePermissions'
const { getPermissionStats } = usePermissions()

// Form data
const form = ref({
  name: '',
  description: '',
  permissions: {},
  active: true
})

// Computed properties
const isEdit = computed(() => !!props.role?.role_id && !props.isClone)
const isSystemRole = computed(() => props.role && ['admin', 'viewer'].includes(props.role.name))

const isFormValid = computed(() => {
  const validation = validateRoleData(form.value)
  return validation.isValid
})

const currentRoleType = computed(() => {
  const roleType = matchesRoleType(form.value.permissions)
  return roleType.charAt(0).toUpperCase() + roleType.slice(1)
})

const permissionStats = computed(() => {
  return getPermissionStats(form.value.permissions)
})

// Helper methods for checking resource permissions
const hasAllResourcePermissions = (resourceName) => {
  const resource = availableResources.value.find(r => r.name === resourceName)
  if (!resource) return false
  
  return resource.actions.every(action => 
    hasPermission(form.value.permissions, resourceName, action.name)
  )
}

// Apply role defaults
const applyRoleDefaults = (roleType) => {
  form.value.permissions = generateDefaultPermissions(roleType)
}

// Icon helper functions
const getResourceIcon = (resourceName) => {
  const icons = {
    users: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
    ]),
    roles: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ]),
    customers: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ]),
    contracts: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ]),
    service_tiers: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
    ]),
    api_keys: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1021 9z' })
    ]),
    controllers: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ]),
    cameras: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
    ]),
    nvrs: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' })
    ]),
    events: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 17h5l-5 5v-5zM12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    rf_monitoring: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' })
    ]),
    system_config: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' })
    ]),
    logs: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
    ]),
    diagnostics: () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
    ])
  }
  return icons[resourceName] || icons.users
}

const getCategoryIcon = (categoryKey) => {
  const icons = {
    administration: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ]),
    business: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M8 6v10c0 .552.448 1 1 1h6c.552 0 1-.448 1-1V6' })
    ]),
    security: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' })
    ]),
    infrastructure: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' })
    ]),
    monitoring: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
    ])
  }
  return icons[categoryKey] || icons.administration
}

const getActionIcon = (actionName) => {
  const icons = {
    read: () => h('svg', { class: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
    ]),
    create: () => h('svg', { class: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })
    ]),
    update: () => h('svg', { class: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' })
    ]),
    delete: () => h('svg', { class: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
    ])
  }
  return icons[actionName] || icons.read
}

// Form submission
const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const validation = validateRoleData(form.value)
    if (!validation.isValid) {
      error.value = validation.errors.join(', ')
      return
    }

    const roleData = {
      name: form.value.name,
      description: form.value.description || null,
      permissions: form.value.permissions,
      active: form.value.active
    }

    if (isEdit.value) {
      await rolesService.update(props.role.role_id, roleData)
    } else {
      await rolesService.create(roleData)
    }

    emit('saved')
  } catch (err) {
    console.error('Failed to save role:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to save role'
  } finally {
    loading.value = false
  }
}

// Initialize form data
const initializeForm = () => {
  if (props.role) {
    form.value = {
      name: props.isClone ? `${props.role.name} Copy` : props.role.name,
      description: props.role.description || '',
      permissions: props.role.permissions ? { ...props.role.permissions } : {},
      active: props.role.active !== false
    }
  } else {
    form.value = {
      name: '',
      description: '',
      permissions: {},
      active: true
    }
  }
}

// Watch for prop changes
watch(() => props.role, initializeForm, { immediate: true })

onMounted(() => {
  initializeForm()
})
</script>
