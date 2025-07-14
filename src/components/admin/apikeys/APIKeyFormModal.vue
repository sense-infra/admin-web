<template>
  <FormModal
    :open="!!apiKey || showModal"
    :entity-name="!!apiKey ? 'API key (Edit)' : 'API key'"
    :initial-data="initialData"
    :validation-rules="validationRules"
    :submit-handler="handleSubmit"
    :validate-on-change="true"
    size="extra-large"
    @close="$emit('close')"
    @saved="handleSaved"
  >
    <template #default="{ form, errors, isFormValid, updateField, validateField, clearError }">
      <div class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            :model-value="form.key_name"
            @update:model-value="updateField('key_name', $event)"
            type="text"
            label="API Key Name"
            placeholder="e.g., Production API Key"
            :error="errors.key_name"
            required
          />

          <FormField
            :model-value="form.rate_limit_per_hour"
            @update:model-value="updateField('rate_limit_per_hour', $event)"
            type="number"
            label="Rate Limit (requests/hour)"
            placeholder="1000"
            :min="1"
            :max="10000"
            :error="errors.rate_limit_per_hour"
          />
        </div>

        <!-- Description -->
        <FormField
          :model-value="form.description"
          @update:model-value="updateField('description', $event)"
          type="textarea"
          label="Description"
          placeholder="Optional description..."
          :rows="3"
          :error="errors.description"
        />

        <!-- Status (Edit mode only) -->
        <div v-if="isEditing">
          <FormField
            :model-value="form.active"
            @update:model-value="updateField('active', $event)"
            type="checkbox"
            label="Active"
            :error="errors.active"
          />
        </div>

        <!-- Permissions Section with Category Grouping -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">
              Permissions *
              <span class="text-xs font-normal text-gray-500 ml-1">
                ({{ getPermissionCount(form.permissions) }} selected)
              </span>
            </h4>
            <div class="flex gap-2">
              <button
                type="button"
                @click="selectAllPermissions(form, updateField)"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                type="button"
                @click="clearAllPermissions(form, updateField)"
                class="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <!-- Enhanced permission validation error display -->
          <div v-if="errors.permissions" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex items-start">
              <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-red-800">Permission Error</p>
                <p class="text-sm text-red-700">{{ errors.permissions }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <!-- Group permissions by category -->
            <div
              v-for="category in permissionCategories"
              :key="category.key"
              class="border rounded-lg bg-white p-4"
            >
              <!-- Category Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <ActionIcon
                    :name="category.icon"
                    :class="category.color"
                    size="sm"
                    class="mr-2"
                  />
                  <h5 class="font-medium text-gray-900">{{ category.label }}</h5>
                  <span class="ml-2 text-xs text-gray-500">
                    ({{ getCategoryPermissionCount(form.permissions, category.key) }}/{{ getCategoryMaxPermissions(category.key) }})
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="selectCategoryPermissions(form, category.key, updateField)"
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    @click="clearCategoryPermissions(form, category.key, updateField)"
                    class="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <p class="text-xs text-gray-500 mb-4">{{ category.description }}</p>

              <!-- Resources in this category -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="resource in category.resources"
                  :key="resource.name"
                  class="border rounded p-3 bg-gray-50"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                      <ActionIcon
                        :name="resource.icon"
                        :class="resource.color"
                        size="xs"
                        class="mr-2"
                      />
                      <h6 class="text-sm font-medium text-gray-900">{{ resource.label }}</h6>
                    </div>
                    <button
                      type="button"
                      @click="toggleAllResourcePermissions(form, resource.name, updateField)"
                      class="text-xs text-blue-600 hover:text-blue-800"
                      :title="hasAllResourcePermissions(form.permissions, resource) ? 'Deselect All' : 'Select All'"
                    >
                      {{ hasAllResourcePermissions(form.permissions, resource) ? 'None' : 'All' }}
                    </button>
                  </div>

                  <p class="text-xs text-gray-500 mb-3">{{ resource.description }}</p>

                  <div class="space-y-2">
                    <label
                      v-for="action in resource.actions"
                      :key="action.name"
                      class="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="hasPermission(form.permissions, resource.name, action.name)"
                        @change="togglePermission(form, resource.name, action.name, $event.target.checked, updateField)"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="flex items-center flex-1">
                        <ActionIcon :name="getActionIcon(action.name)" size="xs" class="mr-1 text-gray-500" />
                        <span class="flex-1" :class="action.color">{{ action.label }}</span>
                        <span
                          v-if="action.risk"
                          :class="getRiskBadgeClass(action.risk)"
                          class="text-xs px-1.5 py-0.5 rounded-full ml-1"
                        >
                          {{ action.risk }}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Permission Summary -->
          <div v-if="getPermissionCount(form.permissions) > 0" class="mt-4 p-3 bg-purple-50 rounded-lg">
            <div class="flex justify-between items-start mb-2">
              <h6 class="text-sm font-medium text-purple-900">Permission Summary</h6>
              <div class="text-xs text-purple-700">
                {{ getPermissionCount(form.permissions) }} total permissions
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 class="text-xs font-medium text-purple-800 mb-2">Resources:</h6>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="resource in Object.keys(form.permissions || {})"
                    :key="resource"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {{ getResourceLabel(resource) }}
                  </span>
                </div>
              </div>

              <div>
                <h6 class="text-xs font-medium text-purple-800 mb-2">Actions by Resource:</h6>
                <div class="space-y-1">
                  <div
                    v-for="(actions, resource) in (form.permissions || {})"
                    :key="resource"
                    class="flex justify-between text-xs"
                  >
                    <span class="text-purple-700">{{ getResourceLabel(resource) }}:</span>
                    <span class="text-purple-900 font-medium">{{ Array.isArray(actions) ? actions.length : 1 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Risk Analysis -->
            <div class="mt-3 pt-3 border-t border-purple-200">
              <h6 class="text-xs font-medium text-purple-800 mb-2">Risk Analysis:</h6>
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div v-for="(count, risk) in getRiskAnalysis(form.permissions)" :key="risk" class="flex justify-between">
                  <span :class="getRiskTextColor(risk)">{{ risk }}:</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expiration Date -->
        <div>
          <label class="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              :checked="hasExpirationDate"
              @change="toggleExpirationDate($event.target.checked, updateField)"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Set expiration date</span>
          </label>
          <div v-if="hasExpirationDate">
            <FormField
              :model-value="form.expires_at"
              @update:model-value="updateField('expires_at', $event)"
              type="datetime-local"
              label="Expiration Date"
              :error="errors.expires_at"
            />
          </div>
        </div>
      </div>
    </template>
  </FormModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import FormModal from '@/components/ui/FormModal.vue'
import FormField from '@/components/forms/FormField.vue'
import ActionIcon from '@/components/icons/ActionIcons.vue'
import { apiKeyService } from '@/services/apiKeys'
import { usePermissions, useAPIKeyPermissions } from '@/composables/usePermissions'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: Object,
    default: null
  },
  allApiKeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

// Use centralized permissions
const { getCategories, getResourcesByCategory } = usePermissions()
const {
  availableResources,
  hasPermission: baseHasPermission,
  togglePermission: baseTogglePermission
} = useAPIKeyPermissions()

// FIXED: Create our own hasPermission function that works with form data
const hasPermission = (permissions, resourceName, actionName) => {
  if (!permissions || typeof permissions !== 'object') return false
  if (!permissions[resourceName]) return false
  if (!Array.isArray(permissions[resourceName])) return false
  return permissions[resourceName].includes(actionName)
}

const hasExpirationDate = ref(false)

// Organize resources by category for better UI
const permissionCategories = computed(() => {
  const categories = getCategories()
  const result = []

  Object.entries(categories).forEach(([key, category]) => {
    const categoryResources = getResourcesByCategory(key).filter(resource =>
      availableResources.value.find(r => r.name === resource.name)
    )

    if (categoryResources.length > 0) {
      result.push({
        key,
        ...category,
        resources: categoryResources
      })
    }
  })

  return result
})

const initialData = computed(() => {
  if (isEditing.value && props.apiKey) {
    // FIXED: Ensure permissions are properly parsed and set
    let permissions = {}
    if (props.apiKey.permissions) {
      if (typeof props.apiKey.permissions === 'string') {
        try {
          permissions = JSON.parse(props.apiKey.permissions)
        } catch (e) {
          console.warn('Failed to parse permissions string:', props.apiKey.permissions)
          permissions = {}
        }
      } else if (typeof props.apiKey.permissions === 'object') {
        permissions = JSON.parse(JSON.stringify(props.apiKey.permissions)) // Deep clone
      }
    }
    
    const data = {
      api_key_id: props.apiKey.api_key_id,
      key_name: props.apiKey.key_name || '',
      description: props.apiKey.description || '',
      rate_limit_per_hour: props.apiKey.rate_limit_per_hour || 1000,
      active: props.apiKey.active !== undefined ? props.apiKey.active : true,
      permissions: permissions, // FIXED: Use properly parsed permissions
      expires_at: props.apiKey.expires_at ?
        new Date(props.apiKey.expires_at).toISOString().slice(0, 16) : ''
    }
    
    return data
  }
  
  return {
    key_name: '',
    description: '',
    rate_limit_per_hour: 1000,
    active: true,
    permissions: {},
    expires_at: ''
  }
})

const isEditing = computed(() => {
  const result = !!(props.apiKey && props.apiKey.api_key_id)
  console.log('isEditing computed:', result, 'apiKey:', props.apiKey)
  return result
})

// FIXED: Enhanced validation rules with proper uniqueness check and permission validation
const validationRules = computed(() => ({
  key_name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    validator: (value, form) => {
      if (!value || value.toString().trim().length === 0) {
        return 'API key name is required'
      }

      const trimmedValue = value.toString().trim()
      
      if (trimmedValue.length < 3) {
        return 'API key name must be at least 3 characters long'
      }

      if (trimmedValue.length > 100) {
        return 'API key name must be less than 100 characters'
      }

      // FIXED: Check uniqueness (skip for editing same API key)
      const existingApiKey = props.allApiKeys.find(k =>
        k.key_name.toLowerCase() === trimmedValue.toLowerCase() &&
        (!isEditing.value || k.api_key_id !== props.apiKey.api_key_id)
      )

      if (existingApiKey) {
        return 'This API key name is already in use'
      }

      return true
    }
  },
  description: {
    required: false,
    maxLength: 500,
    validator: (value) => {
      if (value && value.toString().trim().length > 500) {
        return 'Description must be less than 500 characters'
      }
      return true
    }
  },
  rate_limit_per_hour: {
    required: false,
    validator: (value) => {
      if (value !== null && value !== undefined && value !== '') {
        const num = parseInt(value)
        if (isNaN(num) || num < 1) {
          return 'Rate limit must be at least 1 request per hour'
        }
        if (num > 10000) {
          return 'Rate limit cannot exceed 10,000 requests per hour'
        }
      }
      return true
    }
  },
  // FIXED: Enhanced permissions validation that matches the FormModal logic
  permissions: {
    required: true,
    validator: (value, form) => {
      if (!value || typeof value !== 'object') {
        return 'At least one permission must be selected'
      }

      // Check if there are any resources with actions
      const resourceKeys = Object.keys(value)
      if (resourceKeys.length === 0) {
        return 'At least one permission must be selected'
      }

      // Check if any resource has at least one action
      const hasAnyPermission = resourceKeys.some(resource => {
        const actions = value[resource]
        if (Array.isArray(actions)) {
          return actions.length > 0
        }
        return !!actions
      })

      if (!hasAnyPermission) {
        return 'At least one permission must be selected'
      }

      return true
    }
  },
  expires_at: {
    required: false,
    validator: (value) => {
      if (hasExpirationDate.value && (!value || value.toString().trim() === '')) {
        return 'Expiration date is required when expiration is enabled'
      }

      if (value && value.toString().trim() !== '') {
        const expiryDate = new Date(value)
        const now = new Date()

        if (expiryDate <= now) {
          return 'Expiration date must be in the future'
        }

        // Check if expiry is more than 5 years in the future
        const fiveYearsFromNow = new Date()
        fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5)

        if (expiryDate > fiveYearsFromNow) {
          return 'Expiration date cannot be more than 5 years in the future'
        }
      }

      return true
    }
  },
  active: {
    required: false
  }
}))

// FIXED: Permission helper functions with better error handling
const togglePermission = (form, resource, action, checked, updateField) => {
  const newPermissions = { ...form.permissions }
  baseTogglePermission(newPermissions, resource, action, checked)
  updateField('permissions', newPermissions)
}

const toggleExpirationDate = (enabled, updateField) => {
  hasExpirationDate.value = enabled
  if (!enabled) {
    updateField('expires_at', '')
  }
}

// Helper functions for permission grouping and counting
const hasAllResourcePermissions = (permissions, resource) => {
  if (!permissions || !permissions[resource.name]) return false
  return resource.actions.every(action =>
    permissions[resource.name].includes(action.name)
  )
}

const toggleAllResourcePermissions = (form, resourceName, updateField) => {
  const resource = availableResources.value.find(r => r.name === resourceName)
  if (!resource) return

  const newPermissions = { ...form.permissions }
  const hasAll = hasAllResourcePermissions(newPermissions, resource)

  if (hasAll) {
    delete newPermissions[resourceName]
  } else {
    newPermissions[resourceName] = resource.actions.map(action => action.name)
  }

  updateField('permissions', newPermissions)
}

const selectCategoryPermissions = (form, categoryKey, updateField) => {
  const newPermissions = { ...form.permissions }
  const categoryResources = getResourcesByCategory(categoryKey)

  categoryResources.forEach(resource => {
    if (availableResources.value.find(r => r.name === resource.name)) {
      newPermissions[resource.name] = resource.actions.map(action => action.name)
    }
  })

  updateField('permissions', newPermissions)
}

const clearCategoryPermissions = (form, categoryKey, updateField) => {
  const newPermissions = { ...form.permissions }
  const categoryResources = getResourcesByCategory(categoryKey)

  categoryResources.forEach(resource => {
    delete newPermissions[resource.name]
  })

  updateField('permissions', newPermissions)
}

const selectAllPermissions = (form, updateField) => {
  const newPermissions = {}
  availableResources.value.forEach(resource => {
    newPermissions[resource.name] = resource.actions.map(action => action.name)
  })
  updateField('permissions', newPermissions)
}

const clearAllPermissions = (form, updateField) => {
  updateField('permissions', {})
}

// FIXED: Helper functions for UI feedback and statistics
const getPermissionCount = (permissions) => {
  if (!permissions || typeof permissions !== 'object') return 0
  return Object.values(permissions).reduce((total, actions) => {
    if (Array.isArray(actions)) {
      return total + actions.length
    }
    return total + (actions ? 1 : 0)
  }, 0)
}

const getCategoryPermissionCount = (permissions, categoryKey) => {
  if (!permissions) return 0
  const categoryResources = getResourcesByCategory(categoryKey)
  let count = 0
  
  categoryResources.forEach(resource => {
    if (permissions[resource.name] && Array.isArray(permissions[resource.name])) {
      count += permissions[resource.name].length
    }
  })
  
  return count
}

const getCategoryMaxPermissions = (categoryKey) => {
  const categoryResources = getResourcesByCategory(categoryKey)
  return categoryResources.reduce((total, resource) => {
    return total + (resource.actions ? resource.actions.length : 0)
  }, 0)
}

const getResourceLabel = (resourceName) => {
  const resource = availableResources.value.find(r => r.name === resourceName)
  return resource?.label || resourceName
}

// ADDED: Action icon mapping function to match Role form
const getActionIcon = (actionName) => {
  const icons = {
    read: 'view',
    create: 'add',
    update: 'edit',
    delete: 'delete'
  }
  return icons[actionName] || 'cog'
}

// ADDED: Risk analysis function similar to RoleFormModal
const getRiskAnalysis = (permissions) => {
  if (!permissions || typeof permissions !== 'object') {
    return { low: 0, medium: 0, high: 0, critical: 0 }
  }

  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 }

  Object.keys(permissions).forEach(resourceName => {
    const actions = permissions[resourceName]
    if (!Array.isArray(actions)) return

    const resource = availableResources.value.find(r => r.name === resourceName)
    if (!resource) return

    actions.forEach(actionName => {
      const action = resource.actions.find(a => a.name === actionName)
      if (action && action.risk) {
        riskCounts[action.risk] = (riskCounts[action.risk] || 0) + 1
      } else {
        riskCounts.low += 1
      }
    })
  })

  return riskCounts
}

const getRiskTextColor = (risk) => {
  const colors = {
    low: 'text-green-700',
    medium: 'text-yellow-700',
    high: 'text-orange-700',
    critical: 'text-red-700'
  }
  return colors[risk] || colors.low
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

// FIXED: Watch for modal changes and properly set expiration flag
watch(() => props.showModal, (newVal) => {
  if (!newVal) {
    hasExpirationDate.value = false
  }
})

watch(() => props.apiKey, (newVal) => {
  if (newVal?.expires_at) {
    hasExpirationDate.value = true
  } else {
    hasExpirationDate.value = false
  }
}, { immediate: true })

const handleSubmit = async (formData, isEditingMode) => {
  console.log('APIKeyFormModal: handleSubmit called')
  console.log('- formData:', formData)
  console.log('- isEditingMode param:', isEditingMode)
  console.log('- computed isEditing:', isEditing.value)
  console.log('- props.apiKey:', props.apiKey)

  try {
    // Prepare the data for submission
    const submitData = {
      key_name: formData.key_name,
      description: formData.description || null,
      rate_limit_per_hour: formData.rate_limit_per_hour || 1000,
      permissions: formData.permissions,
      expires_at: hasExpirationDate.value && formData.expires_at ?
        new Date(formData.expires_at).toISOString() : null
    }

    // Add active field for updates
    if (isEditingMode) {
      submitData.active = formData.active
    }

    // Use FormModal's isEditingMode parameter (this is the reliable one)
    if (isEditingMode && props.apiKey?.api_key_id) {
      console.log('=== UPDATING API KEY ===')
      console.log('- API Key ID:', props.apiKey.api_key_id)
      console.log('- Submit data:', submitData)
      return await apiKeyService.apiKeys.update(props.apiKey.api_key_id, submitData)
    } else {
      console.log('=== CREATING NEW API KEY ===')
      console.log('- Submit data:', submitData)
      return await apiKeyService.apiKeys.create(submitData)
    }
  } catch (error) {
    console.error('Submit error:', error)
    throw error
  }
}

const handleSaved = (result) => {
  console.log('API key saved:', result)
  emit('saved', result)
}
</script>

<style scoped>
/* Any additional styles can go here */
.permission-grid {
  max-height: 400px;
  overflow-y: auto;
}

/* Ensure checkboxes are properly aligned */
.permission-checkbox {
  margin-top: 2px;
}

/* Better spacing for permission items */
.permission-item {
  padding: 4px 0;
}

/* Risk badge styling */
.risk-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 9999px;
  font-weight: 500;
}
</style>
