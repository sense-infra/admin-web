<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">API Key Management</h1>
      <p class="text-gray-600">Manage API keys and their permissions</p>
    </div>
    
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">API Keys</h2>
          <div class="flex space-x-2">
            <button @click="fetchAPIKeys" class="btn btn-secondary btn-sm">Refresh</button>
            <button class="btn btn-primary">Create API Key</button>
          </div>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Name</th>
                <th class="table-header-cell">Key (First 8 chars)</th>
                <th class="table-header-cell">Permissions</th>
                <th class="table-header-cell">Last Used</th>
                <th class="table-header-cell">Status</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="6" class="table-cell text-center">Loading API keys...</td>
              </tr>
              <tr v-else-if="apiKeys.length === 0" class="table-row">
                <td colspan="6" class="table-cell text-center">No API keys found</td>
              </tr>
              <tr v-else v-for="apiKey in apiKeys" :key="apiKey.api_key_id" class="table-row">
                <td class="table-cell">{{ apiKey.name }}</td>
                <td class="table-cell font-mono">{{ apiKey.key_hash?.substring(0, 8) }}...</td>
                <td class="table-cell">
                  <span class="text-sm text-gray-600">{{ Object.keys(apiKey.permissions || {}).length }} permissions</span>
                </td>
                <td class="table-cell">{{ formatDate(apiKey.last_used_at) }}</td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    apiKey.active ? 'badge-success' : 'badge-danger'
                  ]">
                    {{ apiKey.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="table-cell">
                  <button class="btn btn-sm btn-outline mr-2">View</button>
                  <button class="btn btn-sm btn-danger">Revoke</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const apiKeys = ref([])
const loading = ref(false)
const error = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

const fetchAPIKeys = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('Fetching API keys from:', api.defaults.baseURL + '/auth/api-keys')
    const response = await api.get('/auth/api-keys')
    console.log('API keys response:', response.data)
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      apiKeys.value = response.data
    } else if (response.data && response.data.api_keys) {
      apiKeys.value = response.data.api_keys
    } else if (response.data && response.data.data) {
      apiKeys.value = response.data.data
    } else {
      apiKeys.value = []
    }
  } catch (err) {
    console.error('Failed to fetch API keys:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch API keys'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAPIKeys()
})
</script>
