<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Contract Management</h1>
      <p class="text-gray-600">Manage service contracts and agreements</p>
    </div>
    
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Contracts</h2>
          <div class="flex space-x-2">
            <button @click="fetchContracts" class="btn btn-secondary btn-sm">Refresh</button>
            <button @click="openCreateModal" class="btn btn-primary">Add Contract</button>
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
                <th class="table-header-cell">Service Address</th>
                <th class="table-header-cell">Start Date</th>
                <th class="table-header-cell">End Date</th>
                <th class="table-header-cell">Status</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="6" class="table-cell text-center">Loading contracts...</td>
              </tr>
              <tr v-else-if="contracts.length === 0" class="table-row">
                <td colspan="6" class="table-cell text-center">No contracts found</td>
              </tr>
              <tr v-else v-for="contract in contracts" :key="contract.contract_id" class="table-row">
                <td class="table-cell">{{ contract.contract_id }}</td>
                <td class="table-cell">{{ contract.service_address }}</td>
                <td class="table-cell">{{ formatDate(contract.start_date) }}</td>
                <td class="table-cell">{{ formatDate(contract.end_date) }}</td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    getContractStatus(contract) === 'Active' ? 'badge-success' : 
                    getContractStatus(contract) === 'Expired' ? 'badge-danger' : 'badge-warning'
                  ]">
                    {{ getContractStatus(contract) }}
                  </span>
                </td>
                <td class="table-cell">
                  <button @click="editContract(contract)" class="btn btn-sm btn-outline mr-2">Edit</button>
                  <button @click="deleteContract(contract.contract_id)" class="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contract Form Modal -->
    <ContractFormModal
      v-if="showModal"
      :contract="selectedContract"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import ContractFormModal from '@/components/contracts/ContractFormModal.vue'

const contracts = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const selectedContract = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const getContractStatus = (contract) => {
  const now = new Date()
  const startDate = new Date(contract.start_date)
  const endDate = new Date(contract.end_date)
  
  if (now < startDate) return 'Pending'
  if (now > endDate) return 'Expired'
  return 'Active'
}

const fetchContracts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/contracts')
    
    if (Array.isArray(response.data)) {
      contracts.value = response.data
    } else if (response.data && response.data.contracts) {
      contracts.value = response.data.contracts
    } else if (response.data && response.data.data) {
      contracts.value = response.data.data
    } else {
      contracts.value = []
    }
  } catch (err) {
    console.error('Failed to fetch contracts:', err)
    if (err.response?.status === 403) {
      error.value = 'Access denied. You may not have permission to view contracts.'
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch contracts'
    }
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedContract.value = null
  showModal.value = true
}

const editContract = (contract) => {
  selectedContract.value = contract
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedContract.value = null
}

const handleSaved = () => {
  closeModal()
  fetchContracts()
}

const deleteContract = async (contractId) => {
  if (!confirm('Are you sure you want to delete this contract?')) return
  
  try {
    await api.delete(`/contracts/${contractId}`)
    await fetchContracts()
  } catch (err) {
    console.error('Failed to delete contract:', err)
    error.value = err.response?.data?.message || 'Failed to delete contract'
  }
}

onMounted(() => {
  fetchContracts()
})
</script>
