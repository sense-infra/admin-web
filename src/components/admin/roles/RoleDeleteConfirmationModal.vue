<template>
  <BaseModal
    :open="true"
    :title="modalTitle"
    size="large"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span class="ml-2">Loading role information...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <div class="flex items-center">
          <ActionIcon name="warning" size="sm" class="mr-2" />
          <div>
            <p class="font-medium">Error loading role information</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Role Information -->
      <div v-else-if="roleUsage && roleUsage.role" class="space-y-6">
        <!-- Role Details -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">Role: {{ roleUsage.role.name }}</h4>
          <p class="text-sm text-gray-600">{{ roleUsage.role.description || 'No description' }}</p>
          <div class="mt-2 flex items-center space-x-4 text-sm">
            <span class="text-gray-500">
              <strong>Total Users:</strong> {{ roleUsage.total_user_count || 0 }}
            </span>
            <span class="text-gray-500">
              <strong>Active Users:</strong> {{ roleUsage.active_user_count || 0 }}
            </span>
            <span class="text-gray-500">
              <strong>Inactive Users:</strong> {{ roleUsage.inactive_user_count || 0 }}
            </span>
          </div>
        </div>

        <!-- System Role Warning -->
        <div v-if="roleUsage.is_system_role" class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2" />
            <p class="text-red-800 font-medium">System Role Protection</p>
          </div>
          <p class="text-red-700 text-sm mt-1">
            This is a system role and cannot be deleted. System roles are essential for platform operation.
          </p>
        </div>

        <!-- Active Users Warning -->
        <div v-else-if="(roleUsage.active_user_count || 0) > 0" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <p class="text-yellow-800 font-medium">Active Users Assigned</p>
          </div>
          <p class="text-yellow-700 text-sm mt-1">
            This role has {{ roleUsage.active_user_count || 0 }} active user(s) assigned.
            You must reassign these users to another role before deletion.
          </p>
        </div>

        <!-- User List -->
        <div v-if="roleUsage.users && roleUsage.users.length > 0" class="space-y-4">
          <h5 class="font-medium text-gray-900">Users Assigned to This Role</h5>

          <div class="border rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in roleUsage.users" :key="user.user_id" :class="user.active ? '' : 'bg-gray-50'">
                  <td class="px-4 py-3">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                      <div v-if="user.first_name || user.last_name" class="text-xs text-gray-400">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ formatDate(user.last_login) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reassignment Section -->
        <div v-if="canReassign" class="space-y-4">
          <h5 class="font-medium text-gray-900">Reassign Users to Another Role</h5>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <select
                v-model="selectedNewRole"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a role for reassignment</option>
                <option v-for="role in availableRoles" :key="role.role_id" :value="role.role_id">
                  {{ role.name }} - {{ role.description }}
                </option>
              </select>
            </div>
            <button
              @click="reassignUsers"
              :disabled="!selectedNewRole || reassigning"
              class="btn btn-primary"
            >
              <ActionIcon name="refresh" size="xs" class="mr-1" />
              {{ reassigning ? 'Reassigning...' : 'Reassign Users' }}
            </button>
          </div>
        </div>

        <!-- Can Delete Confirmation -->
        <div v-if="canDelete" class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div class="flex items-center">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2" />
            <p class="text-red-800 font-medium">Permanent Deletion</p>
          </div>
          <p class="text-red-700 text-sm mt-1">
            This action cannot be undone. The role will be permanently deleted from the system.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button @click="$emit('close')" class="btn btn-outline">
          Cancel
        </button>

        <button
          v-if="canDelete"
          @click="confirmDelete"
          :disabled="deleting"
          class="btn btn-danger"
        >
          <ActionIcon name="delete" size="xs" class="mr-1" />
          {{ deleting ? 'Deleting...' : 'Delete Role' }}
        </button>

        <button
          v-else-if="roleUsage && !roleUsage.is_system_role && (roleUsage.active_user_count || 0) === 0"
          @click="deactivateRole"
          :disabled="deactivating"
          class="btn btn-warning"
        >
          <ActionIcon name="deactivate" size="xs" class="mr-1" />
          {{ deactivating ? 'Deactivating...' : 'Deactivate Role' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { rolesService } from '@/services/roles'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'

// ✅ CONSOLIDATED: Import reusable components
import BaseModal from '@/components/ui/BaseModal.vue'
import ActionIcon from '@/components/icons/ActionIcons.vue'

const props = defineProps({
  role: {
    type: Object,
    required: true
  },
  availableRoles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'deleted', 'reassigned'])

const { handleError } = useErrorHandler('Role Deletion')

const loading = ref(true)
const deleting = ref(false)
const deactivating = ref(false)
const reassigning = ref(false)
const error = ref('')
const roleUsage = ref(null)
const selectedNewRole = ref('')

const modalTitle = computed(() => {
  return canDelete.value ? 'Confirm Role Deletion' : 'Cannot Delete Role'
})

const canDelete = computed(() => {
  return roleUsage.value &&
         roleUsage.value.can_delete &&
         !roleUsage.value.is_system_role &&
         (roleUsage.value.active_user_count || 0) === 0
})

const canReassign = computed(() => {
  return roleUsage.value &&
         (roleUsage.value.active_user_count || 0) > 0 &&
         !roleUsage.value.is_system_role &&
         props.availableRoles.length > 0
})

const fetchRoleUsage = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!props.role?.role_id) {
      throw new Error('Invalid role ID')
    }

    const response = await rolesService.getUsage(props.role.role_id)
    roleUsage.value = response || null
  } catch (err) {
    error.value = handleError(err)
    roleUsage.value = null
  } finally {
    loading.value = false
  }
}

const reassignUsers = async () => {
  if (!selectedNewRole.value || !roleUsage.value) return

  try {
    reassigning.value = true
    error.value = ''

    await rolesService.reassignUsers(props.role.role_id, parseInt(selectedNewRole.value))

    await fetchRoleUsage()
    emit('reassigned')
    selectedNewRole.value = ''
  } catch (err) {
    error.value = handleError(err)
  } finally {
    reassigning.value = false
  }
}

const confirmDelete = async () => {
  if (!canDelete.value) return

  try {
    deleting.value = true
    error.value = ''

    await rolesService.delete(props.role.role_id)
    emit('deleted')
  } catch (err) {
    error.value = handleError(err)
  } finally {
    deleting.value = false
  }
}

const deactivateRole = async () => {
  try {
    deactivating.value = true
    error.value = ''

    await rolesService.toggleStatus(props.role.role_id, false)
    emit('deleted') // Treat deactivation as deletion for UI purposes
  } catch (err) {
    error.value = handleError(err)
  } finally {
    deactivating.value = false
  }
}

onMounted(() => {
  if (props.role?.role_id) {
    fetchRoleUsage()
  } else {
    error.value = 'Invalid role provided'
    loading.value = false
  }
})
</script>
