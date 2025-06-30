<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Service Tier Management</h1>
      <p class="text-gray-600">Create and manage service tier configurations</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Service Tiers</dt>
              <dd class="text-lg font-medium text-gray-900">{{ serviceTiers.length }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Premium Tiers</dt>
              <dd class="text-lg font-medium text-gray-900">{{ premiumTiers }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">With Configurations</dt>
              <dd class="text-lg font-medium text-gray-900">{{ tiersWithConfig }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Recent (30 days)</dt>
              <dd class="text-lg font-medium text-gray-900">{{ recentTiers }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Actions -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search service tiers by name or description..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="clearFilters" class="btn btn-outline">Clear</button>
            <button @click="loadServiceTiers" class="btn btn-outline">Refresh</button>
            <button @click="showCreateModal = true" class="btn btn-primary">Add Service Tier</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Tiers Table -->
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Service Tiers</h2>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>

        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Service Tier</th>
                <th class="table-header-cell">Description</th>
                <th class="table-header-cell">Configuration</th>
                <th class="table-header-cell">Created</th>
                <th class="table-header-cell">Updated</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="6" class="table-cell text-center">Loading service tiers...</td>
              </tr>
              <tr v-else-if="filteredServiceTiers.length === 0" class="table-row">
                <td colspan="6" class="table-cell text-center">
                  {{ searchQuery ? 'No service tiers match your search' : 'No service tiers found' }}
                </td>
              </tr>
              <template v-else v-for="tier in filteredServiceTiers" :key="tier.service_tier_id">
                <!-- Main row -->
                <tr class="table-row">
                  <td class="table-cell">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ tier.name }}</div>
                      <div class="text-xs text-gray-400">#{{ tier.service_tier_id }}</div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <div class="text-sm text-gray-900 max-w-xs">
                      {{ tier.description || 'No description' }}
                    </div>
                  </td>
                  <td class="table-cell">
                    <div class="flex items-center gap-2">
                      <div class="text-sm text-gray-900 max-w-xs">
                        {{ formatConfigSummary(tier.config) }}
                      </div>
                      <button
                        v-if="tier.config"
                        @click="toggleConfigExpansion(tier.service_tier_id)"
                        class="text-blue-600 hover:text-blue-900 focus:outline-none"
                        :title="expandedConfigs[tier.service_tier_id] ? 'Collapse' : 'Expand'"
                      >
                        <svg 
                          class="w-4 h-4 transition-transform duration-200" 
                          :class="{ 'transform rotate-180': expandedConfigs[tier.service_tier_id] }"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="table-cell">{{ formatDate(tier.created_at) }}</td>
                  <td class="table-cell">{{ formatDate(tier.updated_at) }}</td>
                  <td class="table-cell">
                    <div class="flex items-center gap-2">
                      <button
                        @click="viewServiceTier(tier)"
                        class="text-green-600 hover:text-green-900"
                        title="View Service Tier"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button
                        @click="editServiceTier(tier)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Edit Service Tier"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        @click="deleteServiceTier(tier)"
                        class="text-red-600 hover:text-red-900"
                        title="Delete Service Tier"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Expanded configuration row -->
                <tr v-if="expandedConfigs[tier.service_tier_id]" class="table-row bg-gray-50">
                  <td colspan="6" class="table-cell">
                    <div class="py-4 px-6">
                      <div class="mb-2">
                        <span class="text-sm font-medium text-gray-700">Full Configuration:</span>
                      </div>
                      <div class="bg-white border rounded-lg p-4 overflow-auto max-h-96">
                        <pre class="text-xs text-gray-800 whitespace-pre-wrap font-mono">{{ formatConfigForDisplay(tier.config) }}</pre>
                      </div>
                      <div class="mt-3 flex justify-end">
                        <button
                          @click="copyToClipboard(formatConfigForDisplay(tier.config))"
                          class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                          </svg>
                          Copy JSON
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Service Tier Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeCreateModal"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Service Tier</h3>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="createError" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ createError }}
          </div>

          <form @submit.prevent="handleCreateServiceTier">
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="tierName" class="form-label">Service Tier Name *</label>
                  <input
                    id="tierName"
                    v-model="createForm.name"
                    type="text"
                    required
                    class="form-input"
                    placeholder="Enter service tier name"
                  />
                </div>

                <div>
                  <label for="tierTemplate" class="form-label">Use Template</label>
                  <select
                    id="tierTemplate"
                    v-model="selectedTemplate"
                    @change="applyTemplate"
                    class="form-input"
                  >
                    <option value="">Custom Configuration</option>
                    <option value="Silver">Silver Tier</option>
                    <option value="Gold">Gold Tier</option>
                    <option value="Platinum">Platinum Tier</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="tierDescription" class="form-label">Description</label>
                <textarea
                  id="tierDescription"
                  v-model="createForm.description"
                  rows="3"
                  class="form-input"
                  placeholder="Enter service tier description"
                ></textarea>
              </div>

              <div>
                <label for="tierConfig" class="form-label">Configuration (JSON)</label>
                <textarea
                  id="tierConfig"
                  v-model="createForm.config"
                  rows="8"
                  class="form-input font-mono text-sm"
                  placeholder="Enter JSON configuration or use a template above"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">
                  Configuration includes features like response time SLA, video retention, priority level, etc.
                </p>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeCreateModal" class="btn btn-outline">Cancel</button>
              <button type="submit" :disabled="createLoading || !isCreateFormValid" class="btn btn-primary">
                {{ createLoading ? 'Creating...' : 'Create Service Tier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Service Tier Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeEditModal"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Service Tier</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="editError" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ editError }}
          </div>

          <form @submit.prevent="handleUpdateServiceTier">
            <div class="space-y-4">
              <div>
                <label for="editTierName" class="form-label">Service Tier Name *</label>
                <input
                  id="editTierName"
                  v-model="editForm.name"
                  type="text"
                  required
                  class="form-input"
                />
              </div>

              <div>
                <label for="editTierDescription" class="form-label">Description</label>
                <textarea
                  id="editTierDescription"
                  v-model="editForm.description"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>

              <div>
                <label for="editTierConfig" class="form-label">Configuration (JSON)</label>
                <textarea
                  id="editTierConfig"
                  v-model="editForm.config"
                  rows="8"
                  class="form-input font-mono text-sm"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeEditModal" class="btn btn-outline">Cancel</button>
              <button type="submit" :disabled="editLoading || !isEditFormValid" class="btn btn-primary">
                {{ editLoading ? 'Updating...' : 'Update Service Tier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Service Tier Modal -->
    <div v-if="showViewModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="showViewModal = false"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Service Tier Details</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedServiceTier" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Name:</strong> {{ selectedServiceTier.name }}</div>
                  <div><strong>Description:</strong> {{ selectedServiceTier.description || 'No description' }}</div>
                </div>
              </div>

              <div v-if="selectedServiceTier.config">
                <h4 class="font-medium text-gray-900 mb-2">Configuration</h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{ formatConfigForDisplay(selectedServiceTier.config) }}</pre>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Record Information</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Service Tier ID:</strong> #{{ selectedServiceTier.service_tier_id }}</div>
                  <div><strong>Created:</strong> {{ formatDate(selectedServiceTier.created_at) }}</div>
                  <div><strong>Last Updated:</strong> {{ formatDate(selectedServiceTier.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button @click="showViewModal = false" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Service Tier</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete <strong>{{ selectedServiceTier?.name }}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                @click="confirmDelete"
                :disabled="deleteLoading"
                class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
              >
                {{ deleteLoading ? 'Deleting...' : 'Delete' }}
              </button>
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Success Toast -->
    <div v-if="showCopyToast" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
      Configuration copied to clipboard!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useRoute } from 'vue-router'

// Store
const authStore = useAuthStore()

// Routes
const route = useRoute()

// Reactive data
const loading = ref(false)
const error = ref('')
const serviceTiers = ref([])
const searchQuery = ref('')
const expandedConfigs = ref({})
const showCopyToast = ref(false)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedServiceTier = ref(null)

// Form states
const createLoading = ref(false)
const createError = ref('')
const editLoading = ref(false)
const editError = ref('')
const deleteLoading = ref(false)

// Template selection
const selectedTemplate = ref('')

// Form data
const createForm = ref({
  name: '',
  description: '',
  config: ''
})

const editForm = ref({
  name: '',
  description: '',
  config: ''
})

// Computed properties
const filteredServiceTiers = computed(() => {
  if (!searchQuery.value) {
    return serviceTiers.value
  }

  const query = searchQuery.value.toLowerCase()
  return serviceTiers.value.filter(tier =>
    tier.name.toLowerCase().includes(query) ||
    tier.description?.toLowerCase().includes(query)
  )
})

const premiumTiers = computed(() => {
  return serviceTiers.value.filter(tier =>
    ['Gold', 'Platinum', 'Premium'].some(premium =>
      tier.name.toLowerCase().includes(premium.toLowerCase())
    )
  ).length
})

const tiersWithConfig = computed(() => {
  return serviceTiers.value.filter(tier => tier.config).length
})

const recentTiers = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return serviceTiers.value.filter(tier =>
    new Date(tier.created_at) >= thirtyDaysAgo
  ).length
})

const isCreateFormValid = computed(() => {
  return createForm.value.name.trim() !== ''
})

const isEditFormValid = computed(() => {
  return editForm.value.name.trim() !== ''
})

// Methods
const loadServiceTiers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/service-tiers')
    serviceTiers.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load service tiers'
    console.error('Failed to load service tiers:', err)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
}

// Config expansion methods
const toggleConfigExpansion = (tierId) => {
  expandedConfigs.value[tierId] = !expandedConfigs.value[tierId]
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showCopyToast.value = true
      setTimeout(() => {
        showCopyToast.value = false
      }, 2000)
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}

// Template management
const applyTemplate = () => {
  if (!selectedTemplate.value) return

  const templates = {
    Silver: {
      response_time_sla: '15 minutes',
      video_retention_days: 30,
      priority_level: 'standard',
      max_cameras: 5,
      rf_frequencies: 5,
      features: ['Basic monitoring', 'Email alerts']
    },
    Gold: {
      response_time_sla: '10 minutes',
      video_retention_days: 60,
      priority_level: 'high',
      max_cameras: 10,
      rf_frequencies: 15,
      features: ['Enhanced monitoring', 'SMS alerts', 'Phone alerts']
    },
    Platinum: {
      response_time_sla: '5 minutes',
      video_retention_days: 90,
      priority_level: 'critical',
      max_cameras: 20,
      rf_frequencies: 46,
      features: ['Premium monitoring', 'Real-time alerts', '24/7 support', 'Custom frequencies']
    }
  }

  const template = templates[selectedTemplate.value]
  if (template) {
    createForm.value.config = JSON.stringify(template, null, 2)
  }
}

// Modal management
const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    name: '',
    description: '',
    config: ''
  }
  selectedTemplate.value = ''
  createError.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedServiceTier.value = null
  editError.value = ''
}

// Service tier operations
const handleCreateServiceTier = async () => {
  createLoading.value = true
  createError.value = ''

  try {
    const tierData = {
      name: createForm.value.name,
      description: createForm.value.description || null,
      config: createForm.value.config || null
    }

    await api.post('/service-tiers', tierData)
    await loadServiceTiers()
    closeCreateModal()
  } catch (err) {
    console.error('Service tier creation failed:', err)
    createError.value = err.response?.data?.message || 'Failed to create service tier'
  } finally {
    createLoading.value = false
  }
}

const viewServiceTier = (tier) => {
  selectedServiceTier.value = { ...tier }
  showViewModal.value = true
}

const editServiceTier = (tier) => {
  selectedServiceTier.value = { ...tier }
  editForm.value = {
    name: tier.name,
    description: tier.description || '',
    config: tier.config ? (typeof tier.config === 'string' ? tier.config : JSON.stringify(tier.config, null, 2)) : ''
  }
  editError.value = ''
  showEditModal.value = true
}

const handleUpdateServiceTier = async () => {
  editLoading.value = true
  editError.value = ''

  try {
    const updateData = {
      name: editForm.value.name,
      description: editForm.value.description || null,
      config: editForm.value.config || null
    }

    await api.put(`/service-tiers/${selectedServiceTier.value.service_tier_id}`, updateData)
    await loadServiceTiers()
    closeEditModal()
  } catch (err) {
    console.error('Service tier update failed:', err)
    editError.value = err.response?.data?.message || 'Failed to update service tier'
  } finally {
    editLoading.value = false
  }
}

const deleteServiceTier = (tier) => {
  selectedServiceTier.value = { ...tier }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    await api.delete(`/service-tiers/${selectedServiceTier.value.service_tier_id}`)
    await loadServiceTiers()
    showDeleteModal.value = false
    selectedServiceTier.value = null
  } catch (err) {
    alert('Failed to delete service tier: ' + (err.response?.data?.message || err.message))
  } finally {
    deleteLoading.value = false
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Never'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

const formatConfigSummary = (config) => {
  if (!config) return 'No configuration'

  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config

    if (Object.keys(parsed).length === 0) {
      return 'No configuration'
    }

    // Format common config fields for summary
    const summary = []

    if (parsed.response_time_sla) {
      summary.push(`SLA: ${parsed.response_time_sla}`)
    }
    if (parsed.priority_level) {
      summary.push(`Priority: ${parsed.priority_level}`)
    }
    if (parsed.max_cameras) {
      summary.push(`Cameras: ${parsed.max_cameras}`)
    }
    if (parsed.rf_frequencies) {
      summary.push(`RF: ${parsed.rf_frequencies}`)
    }

    if (summary.length > 0) {
      return summary.slice(0, 2).join(', ') + (summary.length > 2 ? '...' : '')
    }

    return `${Object.keys(parsed).length} settings`
  } catch (error) {
    return 'Invalid configuration'
  }
}

const formatConfig = (config) => {
  if (!config) return 'No configuration'

  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config

    if (Object.keys(parsed).length === 0) {
      return 'No configuration'
    }

    // Format common config fields
    const formatted = []

    if (parsed.response_time_sla) {
      formatted.push(`Response SLA: ${parsed.response_time_sla}`)
    }
    if (parsed.video_retention_days) {
      formatted.push(`Video Retention: ${parsed.video_retention_days} days`)
    }
    if (parsed.priority_level) {
      formatted.push(`Priority: ${parsed.priority_level}`)
    }
    if (parsed.max_cameras) {
      formatted.push(`Max Cameras: ${parsed.max_cameras}`)
    }
    if (parsed.rf_frequencies) {
      formatted.push(`RF Frequencies: ${parsed.rf_frequencies}`)
    }

    return formatted.length > 0 ? formatted.join(', ') : 'Custom configuration'
  } catch (error) {
    return 'Invalid configuration'
  }
}

const formatConfigForDisplay = (config) => {
  if (!config) return 'No configuration'

  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return config
  }
}

onMounted(async () => {
  await loadServiceTiers()

  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    // Find the service tier and open the view modal
    const tier = serviceTiers.value.find(t => t.service_tier_id === parseInt(viewId))
    if (tier) {
      viewServiceTier(tier)
    }
  }
})
</script>
