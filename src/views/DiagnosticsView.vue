<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">System Diagnostics</h1>
      <p class="text-gray-600">Run diagnostics and view system information</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Database Status</h3>
          <div class="space-y-3">
            <button 
              @click="runDatabaseDiagnostics"
              :disabled="loading"
              class="btn btn-primary w-full"
            >
              {{ loading ? 'Running...' : 'Check Database' }}
            </button>
            <div v-if="dbStatus" class="mt-4">
              <div :class="[
                'p-3 rounded text-sm',
                dbStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ dbStatus.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div class="space-y-3">
            <button 
              @click="getSystemInfo"
              :disabled="loading"
              class="btn btn-secondary w-full"
            >
              {{ loading ? 'Loading...' : 'Get System Info' }}
            </button>
            <div v-if="systemInfo" class="mt-4">
              <div class="bg-gray-100 p-3 rounded text-sm">
                <strong>Version:</strong> {{ systemInfo.version || 'Unknown' }}<br>
                <strong>Uptime:</strong> {{ systemInfo.uptime || 'Unknown' }}<br>
                <strong>Memory:</strong> {{ systemInfo.memory || 'Unknown' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Diagnostics Results -->
    <div v-if="diagnosticsData" class="card">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnostics Results</h3>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{{ JSON.stringify(diagnosticsData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const dbStatus = ref(null)
const systemInfo = ref(null)
const diagnosticsData = ref(null)

const runDatabaseDiagnostics = async () => {
  loading.value = true
  dbStatus.value = null
  
  try {
    console.log('Running database diagnostics:', api.defaults.baseURL + '/diagnostics/db-status')
    const response = await api.get('/diagnostics/db-status')
    diagnosticsData.value = response.data
    dbStatus.value = {
      success: true,
      message: 'Database connection successful'
    }
  } catch (error) {
    console.error('Database diagnostics failed:', error)
    dbStatus.value = {
      success: false,
      message: `Database check failed: ${error.response?.data?.message || error.message}`
    }
  } finally {
    loading.value = false
  }
}

const getSystemInfo = async () => {
  loading.value = true
  systemInfo.value = null
  
  try {
    console.log('Getting system info:', api.defaults.baseURL + '/diagnostics/system-info')
    const response = await api.get('/diagnostics/system-info')
    systemInfo.value = response.data || {}
    diagnosticsData.value = response.data
  } catch (error) {
    console.error('System info failed:', error)
    systemInfo.value = {
      error: error.response?.data?.message || error.message
    }
  } finally {
    loading.value = false
  }
}
</script>
