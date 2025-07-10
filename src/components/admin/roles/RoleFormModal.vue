<template>
  <FormModal
    :open="!!role || showModal"
    :entity-name="!!role && !isClone ? 'Role (Edit)' : 'Role'"
    :initial-data="initialData"
    :validation-rules="validationRules"
    :submit-handler="handleSubmit"
    :validate-on-change="true"
    size="xl"
    @close="$emit('close')"
    @saved="handleSaved"
  >
    <template #default="{ form, errors, isEditing, isFormValid }">
      <div class="space-y-6">
        <!-- Server Error Display -->
        <div v-if="serverError" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-start">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-red-800">{{ serverError }}</p>
            </div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            v-model="form.name"
            type="text"
            label="Role Name"
            :error="errors.name"
            :disabled="isSystemRole"
            required
            placeholder="e.g., Manager"
          />

          <div class="flex items-end">
            <FormField
              v-model="form.active"
              type="checkbox"
              label="Active"
              :error="errors.active"
            />
          </div>
        </div>

        <FormField
          v-model="form.description"
          type="textarea"
          label="Description"
          :error="errors.description"
          placeholder="Describe this role and its purpose..."
          rows="3"
        />

        <!-- System Role Warning -->
        <div v-if="isSystemRole" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <p class="text-yellow-800 font-medium">System Role Protection</p>
          </div>
          <p class="text-yellow-700 text-sm mt-1">
            System role names cannot be changed to maintain security and platform stability.
          </p>
        </div>

        <!-- Role Type Quick Selection -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Setup</h4>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="roleType in roleTypes"
                :key="roleType.id"
                type="button"
                @click="applyRoleDefaults(roleType.id)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  roleType.class
                ]"
              >
                {{ roleType.label }}
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
            <h4 class="text-sm font-medium text-gray-700">Permissions</h4>
            <div class="flex gap-2">
              <button
                type="button"
                @click="setAllPermissions"
                class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Select All
              </button>
              <button
                type="button"
                @click="clearAllPermissions"
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
                  <ActionIcon :name="category.icon" size="sm" class="mr-3 text-purple-600" />
                  <div>
                    <h5 class="font-medium text-gray-900">{{ category.label }}</h5>
                    <p class="text-xs text-gray-500">{{ category.description }}</p>
                  </div>
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="hasAllCategoryPermissions(categoryKey)"
                    @change="setCategoryPermissions(categoryKey, $event.target.checked)"
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
                      <ActionIcon :name="resource.icon" size="xs" class="mr-2 text-gray-600" />
                      {{ resource.label }}
                    </h6>
                    <button
                      type="button"
                      @click="toggleResourcePermissions(resource.name)"
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
                        :checked="hasPermission(resource.name, action.name)"
                        @change="togglePermission(resource.name, action.name, $event.target.checked)"
                        class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span class="flex items-center flex-1">
                        <ActionIcon :name="getActionIcon(action.name)" size="xs" class="mr-1 text-gray-500" />
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
    </template>
  </FormModal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import FormModal from '@/components/ui/FormModal.vue'
import FormField from '@/components/forms/FormField.vue'
import ActionIcon from '@/components/icons/ActionIcons.vue'
import { rolesService, roleUtils } from '@/services/roles'
import { useErrorHandler } from '@/utils/errorHandling'
import { validation } from '@/utils/validation'
import { useRolePermissions } from '@/composables/usePermissions'

const props = defineProps({
  role: {
    type: Object,
    default: null
  },
  isClone: {
    type: Boolean,
    default: false
  },
  showModal: {
    type: Boolean,
    default: false
  },
  allRoles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const { handleError } = useErrorHandler('Role Form')

// ✅ CONSOLIDATED: Use centralized permissions
const {
  availableResources,
  categories,
  generateDefaultPermissions,
  getResourcesByCategory,
  matchesRoleType,
  getPermissionStats
} = useRolePermissions()

const serverError = ref('')

const isEditing = computed(() => {
  return !!(props.role && props.role.role_id && !props.isClone)
})

const isSystemRole = computed(() => {
  return props.role && roleUtils.isSystemRole(props.role)
})

const initialData = computed(() => {
  if (props.role) {
    return {
      role_id: props.isClone ? null : props.role.role_id,
      name: props.isClone ? `${props.role.name} Copy` : props.role.name,
      description: props.role.description || '',
      permissions: props.role.permissions ? { ...props.role.permissions } : {},
      active: props.role.active !== false
    }
  } else {
    return {
      name: '',
      description: '',
      permissions: {},
      active: true
    }
  }
})

const validationRules = computed(() => {
  return {
    name: validation()
      .required('Role name')
      .minLength(2)
      .maxLength(50)
      .unique({
        items: props.allRoles,
        field: 'name',
        idField: 'role_id',
        currentItem: isEditing.value ? props.role : null,
        caseSensitive: false,
        errorMessage: 'This role name already exists'
      })
      .build(),

    description: validation()
      .maxLength(500)
      .build(),

    permissions: {
      required: false,
      validator: (value) => {
        if (!value || Object.keys(value).length === 0) {
          return 'At least one permission is required'
        }
        return true
      }
    },

    active: {
      required: false
    }
  }
})

const roleTypes = [
  { id: 'admin', label: 'Admin (Full Access)', class: 'bg-red-100 text-red-800 hover:bg-red-200' },
  { id: 'manager', label: 'Manager', class: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { id: 'operator', label: 'Operator', class: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { id: 'viewer', label: 'Viewer (Read Only)', class: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
]

const currentRoleType = computed(() => {
  // This would match the form permissions against known patterns
  return 'Custom' // Will implement with actual form integration
})

const permissionStats = computed(() => {
  // Calculate stats from current form permissions
  return getPermissionStats({}) // Will implement with actual form integration
})

// Permission methods that work with form data - these need to be connected to FormModal
const hasPermission = (resourceName, actionName) => {
  // This needs to work with the form data from FormModal
  return false // Will be implemented with actual form integration
}

const togglePermission = (resourceName, actionName, checked) => {
  // This needs to work with the form data from FormModal
}

const hasAllResourcePermissions = (resourceName) => {
  // This needs to work with the form data from FormModal
  return false
}

const toggleResourcePermissions = (resourceName) => {
  // This needs to work with the form data from FormModal
}

const hasAllCategoryPermissions = (categoryKey) => {
  // This needs to work with the form data from FormModal
  return false
}

const setCategoryPermissions = (categoryKey, checked) => {
  // This needs to work with the form data from FormModal
}

const setAllPermissions = () => {
  // This needs to work with the form data from FormModal
}

const clearAllPermissions = () => {
  // This needs to work with the form data from FormModal
}

const applyRoleDefaults = (roleType) => {
  // This needs to work with the form data from FormModal
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

const handleSubmit = async (formData, isEditingMode) => {
  serverError.value = ''

  try {
    let response

    if (isEditingMode) {
      response = await rolesService.update(props.role.role_id, formData)
    } else {
      response = await rolesService.create(formData)
    }

    return response
  } catch (error) {
    console.error('Failed to save role:', error)
    serverError.value = handleError(error)
    await nextTick()
    throw error
  }
}

const handleSaved = (result) => {
  emit('saved', result)
}

onMounted(() => {
  // Initialize any needed data
})
</script>
