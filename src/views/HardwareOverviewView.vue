<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Hardware Overview</h1>
      <p class="text-gray-600">Monitor and manage all hardware components</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">NVR Systems</h3>
          <p class="text-3xl font-bold text-blue-600 mb-2">{{ hardwareStats.nvrs || 0 }}</p>
          <p class="text-sm text-gray-600">Network Video Recorders</p>
          <button class="btn btn-outline btn-sm mt-4 w-full">Manage NVRs</button>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cameras</h3>
          <p class="text-3xl font-bold text-green-600 mb-2">{{ hardwareStats.cameras || 0 }}</p>
          <p class="text-sm text-gray-600">Security Cameras</p>
          <button class="btn btn-outline btn-sm mt-4 w-full">Manage Cameras</button>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Controllers</h3>
          <p class="text-3xl font-bold text-purple-600 mb-2">{{ hardwareStats.controllers || 0 }}</p>
          <p class="text-sm text-gray-600">Edge Controllers</p>
          <button class="btn btn-outline btn-sm mt-4 w-full">Manage Controllers</button>
        </div>
      </div>
    </div>
    
    <div class="mt-8 card">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Hardware Status</h3>
        <div v-if="loading" class="text-center py-8 text-gray-600">
          Loading hardware data...
        </div>
        <div v-else class="text-center py-8 text-gray-600">
          Hardware management components will be implemented when backend endpoints are available
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const hardwareStats = ref({
  nvrs: 0,
  cameras: 0,
  controllers: 0
})
const loading = ref(false)

const fetchHardwareStats = async () => {
  loading.value = true
  
  try {
    // Note: These endpoints don't exist in your backend yet
    // So we'll just show 0 for now
    hardwareStats.value = {
      nvrs: 0,
      cameras: 0,
      controllers: 0
    }
  } catch (err) {
    console.error('Failed to fetch hardware stats:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHardwareStats()
})
</script>
