<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ user?.username || 'User' }}!</p>
    </div>
    
    <!-- Backend Connection Test -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Backend Connection Test</h3>
          <div class="space-y-3">
            <button 
              @click="testHealth"
              :disabled="testing"
              class="btn btn-primary btn-sm w-full"
            >
              {{ testing ? 'Testing...' : 'Test Health Endpoint' }}
            </button>
            
            <button 
              @click="testCustomers"
              :disabled="testing"
              class="btn btn-secondary btn-sm w-full"
            >
              Test Customers Endpoint
            </button>
            
            <div v-if="testResult" class="mt-4">
              <div 
                :class="[
                  'p-3 rounded text-sm',
                  testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ testResult.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Manual Login Test</h3>
          <div class="space-y-3">
            <input 
              v-model="testCredentials.username" 
              placeholder="Username" 
              class="form-input w-full"
            >
            <input 
              v-model="testCredentials.password" 
              type="password" 
              placeholder="Password" 
              class="form-input w-full"
            >
            <button 
              @click="testManualLogin"
              :disabled="testing"
              class="btn btn-primary btn-sm w-full"
            >
              Test These Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Navigation -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <router-link to="/customers" class="btn btn-outline btn-sm w-full">
              Manage Customers
            </router-link>
            <router-link to="/contracts" class="btn btn-outline btn-sm w-full">
              Manage Contracts
            </router-link>
            <router-link to="/admin/users" class="btn btn-outline btn-sm w-full">
              User Management
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Backend:</span>
              <span 
                :class="[
                  'text-sm font-medium',
                  backendStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ backendStatusText }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">User Role:</span>
              <span class="text-sm font-medium text-blue-600">{{ user?.role?.name || 'Unknown' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">User Info</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Username:</span>
              <span class="text-sm font-medium">{{ user?.username }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Email:</span>
              <span class="text-sm font-medium">{{ user?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Last Login:</span>
              <span class="text-sm font-medium">{{ formatDate(user?.last_login) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backend Response Display -->
    <div v-if="apiResponse" class="card">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Latest API Response</h3>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const testing = ref(false)
const testResult = ref(null)
const apiResponse = ref(null)
const backendStatus = ref('unknown')
const backendStatusText = ref('Unknown')

const testCredentials = ref({
  username: 'viewer',
  password: 'Viewer2025!'
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const testHealth = async () => {
  testing.value = true
  testResult.value = null
  apiResponse.value = null
  
  try {
    console.log('Testing health endpoint:', api.defaults.baseURL + '/health')
    
    const response = await api.get('/health')
    apiResponse.value = response.data
    testResult.value = {
      success: true,
      message: `Health check successful! Status: ${response.status}`
    }
    backendStatus.value = 'connected'
    backendStatusText.value = 'Connected'
  } catch (error) {
    console.error('Health check failed:', error)
    apiResponse.value = error.response?.data || error.message
    testResult.value = {
      success: false,
      message: `Health check failed: ${error.response?.status || error.message}`
    }
    backendStatus.value = 'error'
    backendStatusText.value = 'Connection Failed'
  } finally {
    testing.value = false
  }
}

const testCustomers = async () => {
  testing.value = true
  testResult.value = null
  apiResponse.value = null
  
  try {
    console.log('Testing customers endpoint:', api.defaults.baseURL + '/customers')
    
    const response = await api.get('/customers')
    apiResponse.value = response.data
    testResult.value = {
      success: true,
      message: `Customers endpoint successful! Status: ${response.status}. Found ${response.data?.length || 0} customers.`
    }
  } catch (error) {
    console.error('Customers test failed:', error)
    apiResponse.value = error.response?.data || error.message
    testResult.value = {
      success: false,
      message: `Customers test failed: ${error.response?.data?.message || error.response?.status || error.message}`
    }
  } finally {
    testing.value = false
  }
}

const testManualLogin = async () => {
  testing.value = true
  testResult.value = null
  apiResponse.value = null
  
  try {
    console.log('Testing manual login with:', testCredentials.value.username)
    
    // Use the correct endpoint path (no /api/v1 prefix)
    const response = await api.post('/auth/login', {
      username: testCredentials.value.username,
      password: testCredentials.value.password
    })
    
    apiResponse.value = response.data
    testResult.value = {
      success: true,
      message: `Login successful! Status: ${response.status}`
    }
  } catch (error) {
    console.error('Manual login test failed:', error)
    apiResponse.value = error.response?.data || error.message
    testResult.value = {
      success: false,
      message: `Login failed: ${error.response?.data?.message || error.response?.status || error.message}`
    }
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  // Test backend connection on page load
  testHealth()
})
</script>
