<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Rate Limit Management</h1>
      <p class="text-gray-600">Monitor and manage API rate limits</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Total Requests (24h)</h3>
          <p class="text-3xl font-bold text-blue-600">{{ metrics.total_requests || 0 }}</p>
        </div>
      </div>
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Rate Limited Requests</h3>
          <p class="text-3xl font-bold text-red-600">{{ metrics.rate_limited || 0 }}</p>
        </div>
      </div>
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Active API Keys</h3>
          <p class="text-3xl font-bold text-green-600">{{ metrics.active_keys || 0 }}</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Rate Limit Status</h2>
          <button @click="fetchRateLimits" class="btn btn-secondary btn-sm">Refresh</button>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div class="space-y-4">
          <div v-if="loading" class="text-center py-4">Loading rate limit data...</div>
          <div v-else-if="rateLimits.length === 0" class="text-center py-4">No rate limit data available</div>
          <div v-else v-for="limit in rateLimits" :key="limit.api_key_id" class="border rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-medium">API Key: {{ limit.api_key_name }}</h4>
                <p class="text-sm text-gray-600">Current: {{ limit.current_requests }} / {{ limit.limit_requests }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span :class="[
                  'badge',
                  limit.is_limited ? 'badge-danger' : 'badge-success'
                ]">
                  {{ limit.is_limited ? 'Limited' : 'OK' }}
                </span>
                <button 
                  v-if="limit.is_limited" 
                  @click="resetRateLimit(limit.api_key_id)"
                  class="btn btn-sm btn-warning"
                >
                  Reset
                </button>
              </div>
            </div>
            <div class="mt-2">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(limit.current_requests / limit.limit_requests) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const rateLimits = ref([])
const metrics = ref({})
const loading = ref(false)
const error = ref(null)

const fetchRateLimits = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/admin/rate-limits/status')
    rateLimits.value = response.data || []
    
    const metricsResponse = await api.get('/admin/rate-limits/metrics')
    metrics.value = metricsResponse.data || {}
  } catch (err) {
    console.error('Failed to fetch rate limits:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch rate limits'
  } finally {
    loading.value = false
  }
}

const resetRateLimit = async (apiKeyId) => {
  try {
    await api.post(`/admin/rate-limits/${apiKeyId}/reset`)
    await fetchRateLimits() // Refresh data
  } catch (err) {
    console.error('Failed to reset rate limit:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to reset rate limit'
  }
}

onMounted(() => {
  fetchRateLimits()
})
</script>
