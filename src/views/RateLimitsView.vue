<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Rate Limit Management</h1>
        <p class="text-gray-600">Monitor and manage API rate limiting</p>
      </div>
      <button
        @click="loadData"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        :disabled="loading"
      >
        <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total API Keys</dt>
              <dd class="text-lg font-medium text-gray-900">{{ metricsData.summary?.total_api_keys || 0 }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Active Keys</dt>
              <dd class="text-lg font-medium text-gray-900">{{ metricsData.summary?.active_api_keys || 0 }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Rate Limited</dt>
              <dd class="text-lg font-medium text-gray-900">{{ metricsData.summary?.rate_limited_keys || 0 }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Requests (Last Hour)</dt>
              <dd class="text-lg font-medium text-gray-900">{{ formatNumber(metricsData.summary?.total_requests_last_hour || 0) }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Rate Limit Status Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">API Key Rate Limit Status</h2>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading rate limit data...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600">
        <p>{{ error }}</p>
        <button @click="loadData" class="mt-2 text-blue-600 hover:text-blue-800">
          Try Again
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                API Key
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage (Last Hour)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate Limit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Usage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Used
              </th>
              <!-- Only show Actions column header if user is admin -->
              <th v-if="isAdmin" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in statusData.api_key_rate_limits" :key="item.api_key_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ item.key_name || 'Unknown Key' }}</div>
                  <code class="text-xs text-gray-500 bg-gray-100 px-1 rounded">{{ item.key_prefix }}...</code>
                  <div class="text-xs text-gray-400">by {{ item.created_by_username || 'Unknown' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm text-gray-900">{{ formatNumber(item.usage_last_hour || 0) }}</div>
                  <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full"
                         :class="getUsageBarColor(item)"
                         :style="{ width: Math.min(getUsagePercentage(item), 100) + '%' }">
                    </div>
                  </div>
                  <div class="ml-2 text-xs text-gray-500">{{ Math.round(getUsagePercentage(item)) }}%</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatNumber(item.rate_limit_per_hour || 0) }}</div>
                <div class="text-xs text-gray-500">requests/hour</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatNumber(item.remaining_requests || 0) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(item)">
                  {{ getStatusDisplay(item.status) }}
                </span>
                <div v-if="!item.active" class="text-xs text-red-500 mt-1">Inactive</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatNumber(item.total_usage_count || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.last_used) }}
              </td>
              <!-- Only show reset button if user is admin -->
              <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="resetApiKeyLimit(item.api_key_id)"
                  class="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="resetLoading"
                  title="Reset rate limit for this API key"
                >
                  {{ resetLoading ? 'Resetting...' : 'Reset' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!statusData.api_key_rate_limits || statusData.api_key_rate_limits.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"/>
          </svg>
          <p class="mt-2">No API keys found</p>
          <p class="text-sm text-gray-400">Create an API key to see rate limiting data</p>
        </div>
      </div>
    </div>

    <!-- Top Usage Section -->
    <div v-if="metricsData.top_usage_api_keys && metricsData.top_usage_api_keys.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Top API Keys by Usage</h2>
      </div>
      <div class="p-6">
        <div class="space-y-3">
          <div v-for="key in metricsData.top_usage_api_keys.slice(0, 5)" :key="key.api_key_id"
               class="flex items-center justify-between py-2">
            <div class="flex items-center">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ key.key_name }}</div>
                <code class="text-xs text-gray-500">{{ key.key_prefix }}...</code>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                {{ key.usage_last_hour }}/{{ key.rate_limit_per_hour }}
              </div>
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full bg-blue-600"
                     :style="{ width: Math.min(key.utilization_percent || 0, 100) + '%' }">
                </div>
              </div>
              <div class="text-sm text-gray-900 w-12 text-right">
                {{ Math.round(key.utilization_percent || 0) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Notice (only shown to non-admin users if there would be reset buttons) -->
    <div v-if="!isAdmin && statusData.api_key_rate_limits && statusData.api_key_rate_limits.length > 0" 
         class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="text-blue-800 font-medium">Read-Only View</p>
          <p class="text-blue-700 text-sm">Only administrators can reset API key rate limits. Contact an admin if you need to reset a rate limit.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiKeyService } from '@/services/apiKeys'

// Store
const authStore = useAuthStore()

// Permission check - only admin role can reset rate limits
const isAdmin = computed(() => {
  const userRole = authStore.user?.role?.name?.toLowerCase()
  return userRole === 'admin'
})

// Reactive data
const loading = ref(false)
const resetLoading = ref(false)
const error = ref('')
const metricsData = ref({
  summary: {},
  top_usage_api_keys: []
})
const statusData = ref({
  api_key_rate_limits: [],
  summary: {}
})

// Methods
const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('Loading rate limit data...')

    // Load metrics and status data - your backend returns different structure
    const [metricsResponse, statusResponse] = await Promise.all([
      apiKeyService.rateLimits.getMetrics(),
      apiKeyService.rateLimits.getStatus()
    ])

    console.log('Metrics response:', metricsResponse)
    console.log('Status response:', statusResponse)

    // Your backend returns data in this format
    metricsData.value = metricsResponse
    statusData.value = statusResponse

  } catch (err) {
    console.error('Failed to load rate limit data:', err)
    console.error('Error details:', err.response?.data)
    error.value = err.response?.data?.error || err.message || 'Failed to load rate limit data'

    // Set empty defaults on error
    metricsData.value = { summary: {}, top_usage_api_keys: [] }
    statusData.value = { api_key_rate_limits: [], summary: {} }
  } finally {
    loading.value = false
  }
}

const resetApiKeyLimit = async (apiKeyId) => {
  // Double-check admin permission before allowing reset
  if (!isAdmin.value) {
    alert('Permission denied. Only administrators can reset API key rate limits.')
    return
  }

  if (!confirm('Reset rate limit for this API key? This will clear the usage history for the last hour.')) return

  resetLoading.value = true

  try {
    const response = await apiKeyService.rateLimits.resetApiKeyLimit(apiKeyId)
    console.log('Reset response:', response)
    await loadData()
    alert(`Rate limit reset successfully. ${response.records_removed || 0} usage records were removed.`)
  } catch (err) {
    console.error('Failed to reset rate limit:', err)
    if (err.response?.status === 403) {
      alert('Permission denied. Only administrators can reset API key rate limits.')
    } else {
      alert('Failed to reset rate limit: ' + (err.response?.data?.error || err.message))
    }
  } finally {
    resetLoading.value = false
  }
}

// Helper functions
const getUsagePercentage = (item) => {
  const usage = item.usage_last_hour || 0
  const limit = item.rate_limit_per_hour || 0

  if (limit === 0) return 0
  return (usage / limit) * 100
}

const getUsageBarColor = (item) => {
  const percentage = getUsagePercentage(item)

  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 90) return 'bg-yellow-500'
  if (percentage >= 70) return 'bg-orange-500'
  return 'bg-green-500'
}

const getStatusColor = (item) => {
  const status = item.status
  switch (status) {
    case 'RATE_LIMITED':
      return 'bg-red-100 text-red-800'
    case 'APPROACHING_LIMIT':
      return 'bg-yellow-100 text-yellow-800'
    case 'MODERATE_USAGE':
      return 'bg-orange-100 text-orange-800'
    case 'LOW_USAGE':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDisplay = (status) => {
  const statusMap = {
    'RATE_LIMITED': 'Rate Limited',
    'APPROACHING_LIMIT': 'Near Limit',
    'MODERATE_USAGE': 'Moderate',
    'LOW_USAGE': 'Normal'
  }
  return statusMap[status] || status
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`
    }
    return `${diffHours}h ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
