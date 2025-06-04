<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Customer Management</h1>
      <p class="text-gray-600">Manage customer records and information</p>
    </div>
    
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Customers</h2>
          <div class="flex space-x-2">
            <button @click="fetchCustomers" class="btn btn-secondary btn-sm">Refresh</button>
            <button class="btn btn-primary">Add Customer</button>
          </div>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">ID</th>
                <th class="table-header-cell">Name</th>
                <th class="table-header-cell">Email</th>
                <th class="table-header-cell">Phone</th>
                <th class="table-header-cell">Address</th>
                <th class="table-header-cell">Created</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="7" class="table-cell text-center">Loading customers...</td>
              </tr>
              <tr v-else-if="customers.length === 0" class="table-row">
                <td colspan="7" class="table-cell text-center">No customers found</td>
              </tr>
              <tr v-else v-for="customer in customers" :key="customer.customer_id" class="table-row">
                <td class="table-cell">{{ customer.customer_id }}</td>
                <td class="table-cell">{{ customer.name_on_contract }}</td>
                <td class="table-cell">{{ customer.email || 'N/A' }}</td>
                <td class="table-cell">{{ customer.phone_number || 'N/A' }}</td>
                <td class="table-cell">{{ customer.address }}</td>
                <td class="table-cell">{{ formatDate(customer.created_at) }}</td>
                <td class="table-cell">
                  <button class="btn btn-sm btn-outline mr-2">Edit</button>
                  <button class="btn btn-sm btn-danger">Delete</button>
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

const customers = ref([])
const loading = ref(false)
const error = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const fetchCustomers = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('Fetching customers from:', api.defaults.baseURL + '/customers')
    const response = await api.get('/customers')
    console.log('Customers response:', response.data)
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      customers.value = response.data
    } else if (response.data && response.data.customers) {
      customers.value = response.data.customers
    } else if (response.data && response.data.data) {
      customers.value = response.data.data
    } else {
      customers.value = []
    }
    
    console.log('Parsed customers:', customers.value)
  } catch (err) {
    console.error('Failed to fetch customers:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch customers'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})
</script>
