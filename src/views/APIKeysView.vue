<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">API Key Management</h1>
      <p class="text-gray-600">Manage API keys for external system access</p>
    </div>

    <!-- ✅ CONSOLIDATED: Stats Grid using reusable component -->
    <StatsGrid :stats="apiKeyStatsFormatted" />

    <!-- ✅ CONSOLIDATED: Filter Bar (Search handled by DataTable) -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Filter Controls -->
          <div class="flex gap-2">
            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
            </select>

            <!-- Usage Filter -->
            <select
              v-model="usageFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Keys</option>
              <option value="used">Recently Used</option>
              <option value="unused">Never Used</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 ml-auto">
            <button @click="clearFilters" class="btn btn-outline">
              <ActionIcon name="clear" size="xs" class="mr-1" />
              Clear Filters
            </button>
            <button @click="loadAPIKeys" class="btn btn-outline">
              <ActionIcon name="refresh" size="xs" class="mr-1" />
              Refresh
            </button>
            <button
              v-if="canManageAPIKeys"
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <ActionIcon name="add" size="xs" class="mr-1" />
              Create API Key
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ CONSOLIDATED: API Keys Table using DataTable component -->
    <DataTable
      :items="filteredAPIKeys"
      :columns="apiKeyColumns"
      :loading="loading"
      :error="error"
      title="API Keys"
      :searchable="true"
      search-placeholder="Search API keys by name, description, or prefix..."
      :search-columns="['key_name', 'description', 'key_prefix', 'display_name']"
      :paginated="true"
      :initial-page-size="25"
      :sortable="true"
      :initial-sort="{ column: 'created_at', direction: 'desc' }"
      :clickable-rows="true"
      :show-refresh="true"
      empty-state-title="No API keys found"
      :empty-state-message="statusFilter || usageFilter ? 'No API keys match your filter criteria' : 'Click \'Create API Key\' to create your first API key'"
      @refresh="loadAPIKeys"
      @row-click="viewAPIKey"
    >
      <!-- Custom cell renderers -->
      <template #cell-display_name="{ item }">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <ActionIcon name="key" size="sm" class="text-white" />
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">
              {{ item.key_name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ item.description || 'No description' }}
            </div>
            <div class="text-xs text-gray-400">
              by {{ item.created_by_user?.username || 'Unknown' }}
            </div>
          </div>
        </div>
      </template>

      <template #cell-key_prefix="{ item }">
        <code class="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
          {{ item.key_prefix }}...
        </code>
      </template>

      <template #cell-status="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="apiKeyUtils.getStatusColor(item)">
          <ActionIcon
            :name="getStatusIcon(item)"
            size="xs"
            :class="getStatusIconColor(item) + ' mr-1'"
          />
          {{ apiKeyUtils.getStatus(item) }}
        </span>
      </template>

      <template #cell-usage="{ item }">
        <div>
          <div class="text-sm font-medium text-gray-900">
            {{ apiKeyUtils.formatNumber(item.usage_count || 0) }} requests
          </div>
          <div class="text-xs text-gray-500">
            Total usage
          </div>
        </div>
      </template>

      <template #cell-rate_limit="{ item }">
        <div class="text-sm text-gray-900">
          {{ apiKeyUtils.formatNumber(item.rate_limit_per_hour || 0) }}/hour
        </div>
      </template>

      <template #cell-last_used="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.last_used) }}
        </span>
      </template>

      <template #cell-created_at="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.created_at) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <APIKeyActionButtons
          :api-key="item"
          :can-manage="canManageAPIKeys"
          @view="viewAPIKey"
          @usage="viewUsage"
          @edit="editAPIKey"
          @toggle="toggleAPIKeyStatus"
          @delete="deleteAPIKey"
        />
      </template>
    </DataTable>

    <!-- FIXED: Create API Key Modal with allApiKeys prop -->
    <APIKeyFormModal
      v-if="showCreateModal"
      :show-modal="showCreateModal"
      :all-api-keys="apiKeys"
      @close="closeCreateModal"
      @saved="handleAPIKeySaved"
    />

    <!-- FIXED: Edit API Key Modal with allApiKeys prop -->
    <APIKeyFormModal
      v-if="showEditModal && selectedAPIKey"
      :show-modal="showEditModal"
      :api-key="selectedAPIKey"
      :all-api-keys="apiKeys"
      @close="closeEditModal"
      @saved="handleAPIKeySaved"
    />

    <!-- View API Key Modal -->
    <BaseModal
      :open="showViewModal"
      title="API Key Details"
      size="large"
      @close="closeViewModal"
    >
      <div v-if="selectedAPIKey" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Name:</strong> {{ selectedAPIKey.key_name }}</div>
              <div><strong>Description:</strong> {{ selectedAPIKey.description || 'No description' }}</div>
              <div><strong>Key Prefix:</strong>
                <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ selectedAPIKey.key_prefix }}...</code>
              </div>
              <div><strong>Status:</strong>
                <span :class="apiKeyUtils.getStatusColor(selectedAPIKey)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1">
                  <ActionIcon
                    :name="getStatusIcon(selectedAPIKey)"
                    size="xs"
                    :class="getStatusIconColor(selectedAPIKey) + ' mr-1'"
                  />
                  {{ apiKeyUtils.getStatus(selectedAPIKey) }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Usage & Limits</h4>
            <div class="space-y-2 text-sm">
              <div><strong>API Key ID:</strong> #{{ selectedAPIKey.api_key_id }}</div>
              <div><strong>Total Usage:</strong> {{ apiKeyUtils.formatNumber(selectedAPIKey.usage_count || 0) }} requests</div>
              <div><strong>Rate Limit:</strong> {{ apiKeyUtils.formatNumber(selectedAPIKey.rate_limit_per_hour || 0) }} requests/hour</div>
              <div><strong>Last Used:</strong> {{ formatDate(selectedAPIKey.last_used) }}</div>
              <div><strong>Created:</strong> {{ formatDate(selectedAPIKey.created_at) }}</div>
              <div v-if="selectedAPIKey.expires_at"><strong>Expires:</strong> {{ formatDate(selectedAPIKey.expires_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Permissions Section -->
        <div v-if="selectedAPIKey.permissions">
          <h4 class="font-medium text-gray-900 mb-3">Permissions</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(actions, resource) in selectedAPIKey.permissions"
                :key="resource"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {{ getResourceLabel(resource) }}: {{ Array.isArray(actions) ? actions.join(', ') : actions }}
              </span>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div v-if="apiKeyUtils.isExpiringSoon(selectedAPIKey)" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Expiring Soon:</strong> This API key will expire on {{ formatDate(selectedAPIKey.expires_at) }}.
              </p>
            </div>
          </div>
        </div>

        <div v-if="apiKeyUtils.isExpired(selectedAPIKey)" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm text-red-800">
                <strong>Expired:</strong> This API key expired on {{ formatDate(selectedAPIKey.expires_at) }} and is no longer valid.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeViewModal" class="btn btn-outline">
            Close
          </button>
          <button
            v-if="canManageAPIKeys && selectedAPIKey"
            @click="viewUsageFromView"
            class="btn btn-secondary"
          >
            <ActionIcon name="chart" size="xs" class="mr-1" />
            View Usage
          </button>
          <button
            v-if="canManageAPIKeys && selectedAPIKey"
            @click="editFromView"
            class="btn btn-primary"
          >
            <ActionIcon name="edit" size="xs" class="mr-1" />
            Edit API Key
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Usage Modal -->
    <BaseModal
      :open="showUsageModal"
      title="API Key Usage"
      @close="closeUsageModal"
    >
      <div v-if="selectedAPIKey" class="space-y-4">
        <div>
          <h4 class="font-medium text-gray-900">{{ selectedAPIKey.key_name }}</h4>
          <p class="text-sm text-gray-500">{{ selectedAPIKey.description || 'No description' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">
              {{ apiKeyUtils.formatNumber(usageData?.total_requests || selectedAPIKey.usage_count || 0) }}
            </div>
            <div class="text-sm text-gray-500">Total Requests</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm font-medium text-gray-900">
              {{ formatDate(usageData?.last_used || selectedAPIKey.last_used) }}
            </div>
            <div class="text-sm text-gray-500">Last Used</div>
          </div>
        </div>

        <div v-if="usageData?.daily_usage && usageData.daily_usage.length > 0">
          <h5 class="font-medium text-gray-900 mb-2">Recent Usage</h5>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="day in usageData.daily_usage"
              :key="day.date"
              class="flex justify-between text-sm"
            >
              <span>{{ formatDate(day.date) }}</span>
              <span class="font-medium">{{ day.requests || day.request_count || 0 }} requests</span>
            </div>
          </div>
        </div>

        <div v-if="!usageData && usageLoading" class="p-4 text-center text-gray-500">
          <ActionIcon name="refresh" size="sm" class="animate-spin mr-2" />
          Loading usage data...
        </div>
      </div>

      <template #footer>
        <button @click="closeUsageModal" class="btn btn-outline">
          Close
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :open="showDeleteModal"
      type="danger"
      entity-name="API key"
      :entity-value="selectedAPIKey?.key_name"
      :loading="deleteLoading"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete API key "{{ selectedAPIKey?.key_name }}"?
          This action cannot be undone and will immediately invalidate the key.
        </p>

        <div v-if="selectedAPIKey && (selectedAPIKey.usage_count || 0) > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Warning:</strong> This API key has been used {{ apiKeyUtils.formatNumber(selectedAPIKey.usage_count) }} times.
                Any systems using this key will lose access immediately.
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
      :title="`${statusAction === 'deactivate' ? 'Deactivate' : 'Activate'} API Key`"
      :loading="statusLoading"
      @close="showStatusModal = false"
      @confirm="confirmStatusChange"
    >
      <template #default>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to {{ statusAction }} API key "{{ selectedAPIKey?.key_name }}"?
        </p>

        <div v-if="statusAction === 'deactivate' && selectedAPIKey && (selectedAPIKey.usage_count || 0) > 0"
             class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2" />
            <div>
              <p class="text-sm text-yellow-800">
                <strong>Note:</strong> Deactivating this API key will immediately stop {{ apiKeyUtils.formatNumber(selectedAPIKey.usage_count) }} active integrations.
              </p>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>

    <!-- New API Key Display Modal -->
    <BaseModal
      :open="!!newAPIKeyData"
      title="API Key Created Successfully"
      @close="closeNewAPIKeyModal"
    >
      <div v-if="newAPIKeyData" class="space-y-6">
        <div class="flex items-center justify-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <ActionIcon name="success" size="lg" class="text-green-600" />
          </div>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600 mb-4">
            Your API key has been created successfully. <strong>Please copy and save this key now</strong> - you won't be able to see it again.
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <div class="flex items-center gap-2">
            <input
              :value="newAPIKeyData.plain_key"
              readonly
              class="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
            />
            <button
              @click="copyAPIKey"
              class="btn btn-primary"
            >
              <ActionIcon name="copy" size="xs" class="mr-1" />
              {{ apiKeyCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>

        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>Key Name:</strong> {{ newAPIKeyData.api_key.key_name }}</p>
          <p><strong>Rate Limit:</strong> {{ newAPIKeyData.api_key.rate_limit_per_hour }} requests/hour</p>
          <p v-if="newAPIKeyData.api_key.expires_at">
            <strong>Expires:</strong> {{ formatDate(newAPIKeyData.api_key.expires_at) }}
          </p>
        </div>
      </div>

      <template #footer>
        <button @click="closeNewAPIKeyModal" class="btn btn-primary">
          <ActionIcon name="success" size="xs" class="mr-1" />
          Got it
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiKeyService, apiKeyUtils } from '@/services/apiKeys'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import DataTable from '@/components/tables/DataTable.vue'
import APIKeyFormModal from '@/components/admin/apikeys/APIKeyFormModal.vue'
import APIKeyActionButtons from '@/components/admin/apikeys/APIKeyActionButtons.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const authStore = useAuthStore()
const route = useRoute()

// ✅ CONSOLIDATED: Use centralized error handling
const { handleError } = useErrorHandler('API Key Management')

// Reactive data
const loading = ref(false)
const error = ref('')
const apiKeys = ref([])
const apiKeyStats = ref({
  total: 0,
  active: 0,
  expiring: 0,
  totalUsage: 0
})

// ✅ CONSOLIDATED: Filter states (search handled by DataTable)
const statusFilter = ref('')
const usageFilter = ref('')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showUsageModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const selectedAPIKey = ref(null)
const deleteLoading = ref(false)
const statusLoading = ref(false)
const statusAction = ref('') // 'activate' or 'deactivate'
const newAPIKeyData = ref(null)
const apiKeyCopied = ref(false)
const usageData = ref(null)
const usageLoading = ref(false)

// ✅ CONSOLIDATED: Define table columns for DataTable
const apiKeyColumns = [
  {
    key: 'display_name',
    label: 'API Key',
    sortable: true,
    searchable: true
  },
  {
    key: 'key_prefix',
    label: 'Prefix',
    sortable: false
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  },
  {
    key: 'usage',
    label: 'Usage',
    sortable: false
  },
  {
    key: 'rate_limit',
    label: 'Rate Limit',
    sortable: true,
    key_path: 'rate_limit_per_hour'
  },
  {
    key: 'last_used',
    label: 'Last Used',
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
    sortable: false,
    cellClass: 'text-right'
  }
]

// ✅ CONSOLIDATED: Permission checks
const canManageAPIKeys = computed(() => {
  return authStore.hasPermission('api_keys', 'create') ||
         authStore.hasPermission('api_keys', 'update') ||
         authStore.user?.role?.name === 'admin'
})

// ✅ CONSOLIDATED: Format stats for StatsGrid component
const apiKeyStatsFormatted = computed(() => [
  {
    title: 'Total Keys',
    value: apiKeyStats.value.total,
    icon: 'key',
    color: 'blue'
  },
  {
    title: 'Active Keys',
    value: apiKeyStats.value.active,
    icon: 'success',
    color: 'green'
  },
  {
    title: 'Expiring Soon',
    value: apiKeyStats.value.expiring,
    icon: 'warning',
    color: 'yellow'
  },
  {
    title: 'Total Usage',
    value: apiKeyUtils.formatNumber(apiKeyStats.value.totalUsage),
    icon: 'chart-bar',
    color: 'purple'
  }
])

// ✅ CONSOLIDATED: Filtered API keys for DataTable
const filteredAPIKeys = computed(() => {
  let filtered = apiKeys.value.map(apiKey => ({
    ...apiKey,
    display_name: apiKey.key_name,
    status_text: apiKeyUtils.getStatus(apiKey)
  }))

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(apiKey => {
      const status = apiKeyUtils.getStatus(apiKey).toLowerCase()
      if (statusFilter.value === 'active') return status === 'active'
      if (statusFilter.value === 'inactive') return status === 'inactive'
      if (statusFilter.value === 'expired') return status === 'expired'
      if (statusFilter.value === 'expiring') return status === 'expiring soon'
      return true
    })
  }

  // Apply usage filter
  if (usageFilter.value) {
    if (usageFilter.value === 'used') {
      filtered = filtered.filter(apiKey => apiKey.last_used)
    } else if (usageFilter.value === 'unused') {
      filtered = filtered.filter(apiKey => !apiKey.last_used)
    }
  }

  return filtered
})

// ✅ CONSOLIDATED: Clear filters
const clearFilters = () => {
  statusFilter.value = ''
  usageFilter.value = ''
}

// Helper functions for status display
const getStatusIcon = (apiKey) => {
  const status = apiKeyUtils.getStatus(apiKey)
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'warning'
    case 'Expired': return 'close'
    case 'Expiring Soon': return 'warning'
    default: return 'warning'
  }
}

const getStatusIconColor = (apiKey) => {
  const status = apiKeyUtils.getStatus(apiKey)
  switch (status) {
    case 'Active': return 'text-green-400'
    case 'Inactive': return 'text-gray-400'
    case 'Expired': return 'text-red-400'
    case 'Expiring Soon': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

const getResourceLabel = (resourceName) => {
  // Simple resource name formatting
  return resourceName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// API functions
const loadAPIKeys = async () => {
  loading.value = true
  error.value = ''

  try {
    const apiKeysData = await apiKeyService.apiKeys.getAll()
    apiKeys.value = apiKeysData

    // Generate stats from API key data
    const total = apiKeys.value.length
    const active = apiKeys.value.filter(key => key.active && !apiKeyUtils.isExpired(key)).length
    const expiring = apiKeys.value.filter(key => apiKeyUtils.isExpiringSoon(key)).length
    const totalUsage = apiKeys.value.reduce((sum, key) => sum + (key.usage_count || 0), 0)

    apiKeyStats.value = { total, active, expiring, totalUsage }

  } catch (err) {
    error.value = handleError(err)
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
  selectedAPIKey.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedAPIKey.value = null
}

const closeUsageModal = () => {
  showUsageModal.value = false
  usageData.value = null
  usageLoading.value = false
  selectedAPIKey.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedAPIKey.value = null
}

const closeNewAPIKeyModal = () => {
  newAPIKeyData.value = null
  apiKeyCopied.value = false
}

const handleAPIKeySaved = (result) => {
  loadAPIKeys()
  if (result?.plain_key) {
    newAPIKeyData.value = result
  }
  closeCreateModal()
  closeEditModal()
}

const viewAPIKey = (apiKey) => {
  selectedAPIKey.value = { ...apiKey }
  showViewModal.value = true
}

const editAPIKey = (apiKey) => {
  console.log('Edit API key clicked:', apiKey.api_key_id)

  if (!apiKey || !apiKey.api_key_id) {
    console.warn('Invalid API key for edit:', apiKey)
    return
  }

  // Close all other modals
  showCreateModal.value = false
  showViewModal.value = false
  showUsageModal.value = false
  showDeleteModal.value = false

  // Set API key and open modal
  selectedAPIKey.value = { ...apiKey }

  nextTick(() => {
    showEditModal.value = true
    console.log('Edit modal should be open now')
  })
}

const editFromView = () => {
  console.log('Edit from view clicked')

  if (!selectedAPIKey.value) {
    console.warn('No selected API key for edit from view')
    return
  }

  showViewModal.value = false

  nextTick(() => {
    showEditModal.value = true
    console.log('Edit modal opened from view')
  })
}

const viewUsageFromView = () => {
  console.log('View usage from view clicked')

  if (!selectedAPIKey.value) {
    console.warn('No selected API key for usage from view')
    return
  }

  showViewModal.value = false

  nextTick(() => {
    viewUsage(selectedAPIKey.value)
    console.log('Usage modal opened from view')
  })
}

const viewUsage = async (apiKey) => {
  selectedAPIKey.value = { ...apiKey }
  showUsageModal.value = true
  usageData.value = null
  usageLoading.value = true

  try {
    usageData.value = await apiKeyService.apiKeys.getUsage(apiKey.api_key_id)
  } catch (err) {
    console.error('Failed to load usage data:', err)
    // Fallback to basic data
    usageData.value = {
      total_requests: apiKey.usage_count || 0,
      last_used: apiKey.last_used
    }
  } finally {
    usageLoading.value = false
  }
}

const deleteAPIKey = (apiKey) => {
  selectedAPIKey.value = { ...apiKey }
  showDeleteModal.value = true
}

const toggleAPIKeyStatus = (apiKey) => {
  selectedAPIKey.value = { ...apiKey }
  statusAction.value = apiKey.active ? 'deactivate' : 'activate'
  showStatusModal.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    await apiKeyService.apiKeys.delete(selectedAPIKey.value.api_key_id)
    await loadAPIKeys()
    showDeleteModal.value = false
    selectedAPIKey.value = null
  } catch (err) {
    const errorMessage = handleError(err)
    alert('Failed to delete API key: ' + errorMessage)
  } finally {
    deleteLoading.value = false
  }
}

const confirmStatusChange = async () => {
  statusLoading.value = true

  try {
    const newStatus = statusAction.value === 'activate'
    await apiKeyService.apiKeys.update(selectedAPIKey.value.api_key_id, { active: newStatus })

    await loadAPIKeys()
    showStatusModal.value = false
    selectedAPIKey.value = null
    statusAction.value = ''
  } catch (err) {
    const errorMessage = handleError(err)
    alert(`Failed to ${statusAction.value} API key: ` + errorMessage)
  } finally {
    statusLoading.value = false
  }
}

const copyAPIKey = async () => {
  try {
    await navigator.clipboard.writeText(newAPIKeyData.value.plain_key)
    apiKeyCopied.value = true
    setTimeout(() => {
      apiKeyCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy API key:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = newAPIKeyData.value.plain_key
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    apiKeyCopied.value = true
    setTimeout(() => {
      apiKeyCopied.value = false
    }, 2000)
  }
}

onMounted(async () => {
  await loadAPIKeys()

  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    const apiKey = apiKeys.value.find(k => k.api_key_id === parseInt(viewId))
    if (apiKey) {
      viewAPIKey(apiKey)
    }
  }
})
</script>

<style scoped>
/* DataTable handles most styling, minimal custom styles needed */
</style>
