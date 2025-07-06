<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p class="text-gray-600">Create and manage customer records</p>
      </div>
      <button
        v-if="canManageCustomers"
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Customer
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
              <dd class="text-lg font-medium text-gray-900">{{ customers.length }}</dd>
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
              <dt class="text-sm font-medium text-gray-500 truncate">Recent (30 days)</dt>
              <dd class="text-lg font-medium text-gray-900">{{ recentCustomers }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">With Email</dt>
              <dd class="text-lg font-medium text-gray-900">{{ customersWithEmail }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">With Contracts</dt>
              <dd class="text-lg font-medium text-gray-900">{{ customersWithContracts }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <DataTable
      :items="customers"
      :columns="tableColumns"
      :loading="loading"
      :error="error"
      title="Customers"
      searchable
      paginated
      :initial-page-size="25"
      search-placeholder="Search customers by name, email, or unique ID..."
      empty-state-title="No customers found"
      :empty-state-message="'Click \'Add Customer\' to create your first customer'"
      @refresh="loadCustomers"
      @row-click="viewCustomer"
    >

      <template #row="{ item }">
        <td class="table-cell">
          <div>
            <div class="text-sm font-medium text-gray-900">{{ item.name_on_contract }}</div>
            <div class="text-sm text-gray-500">ID: {{ item.unique_id }}</div>
            <div class="text-xs text-gray-400">#{{ item.customer_id }}</div>
          </div>
        </td>
        <td class="table-cell">
          <div>
            <div class="text-sm text-gray-900">{{ item.email || 'No email' }}</div>
            <div class="text-sm text-gray-500">{{ item.phone_number || 'No phone' }}</div>
          </div>
        </td>
        <td class="table-cell">
          <div class="text-sm text-gray-900 max-w-xs truncate" :title="item.address">
            {{ item.address }}
          </div>
        </td>
        <td class="table-cell">
          <div class="text-sm text-gray-900">
            <template v-if="getCustomerContracts(item.customer_id).length > 0">
              <template v-for="(contract, index) in getCustomerContracts(item.customer_id)" :key="contract.contract_id">
                <div class="mb-1" v-if="index < 2">
                  <router-link
                    :to="`/contracts?view=${contract.contract_id}`"
                    class="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium block truncate max-w-xs"
                    :title="`View contract for ${contract.service_address}`"
                  >
                    {{ contract.service_address }}
                  </router-link>
                  <div class="text-xs text-gray-500">
                    <span :class="getContractStatusClass(contract.start_date, contract.end_date)">
                      {{ getContractStatus(contract.start_date, contract.end_date).label }}
                    </span>
                  </div>
                </div>
              </template>
              <div v-if="getCustomerContracts(item.customer_id).length > 2" class="text-xs text-gray-500">
                +{{ getCustomerContracts(item.customer_id).length - 2 }} more contracts
              </div>
            </template>
            <span v-else class="text-gray-400 italic text-xs">No contracts</span>
          </div>
        </td>
        <td class="table-cell text-sm text-gray-500">
          {{ formatDate(item.created_at) }}
        </td>
        <td class="table-cell text-sm text-gray-500">
          {{ formatDate(item.updated_at) }}
        </td>
        <td class="table-cell">
          <div class="flex items-center gap-2">
            <button
              @click.stop="viewCustomer(item)"
              class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
              title="View Customer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button
              v-if="canManageCustomers"
              @click.stop="editCustomer(item)"
              class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
              title="Edit Customer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              v-if="canManageCustomers"
              @click.stop="deleteCustomer(item)"
              class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
              title="Delete Customer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Create Customer Modal -->
    <FormModal
      :open="showCreateModal"
      entity-name="Customer"
      :validation-rules="customerValidationRules"
      :submit-handler="handleCreateCustomer"
      @close="closeCreateModal"
      @saved="handleCustomerSaved"
    >
      <template #default="{ form, errors }">
        <div class="space-y-4">
          <FormField
            v-model="form.name_on_contract"
            type="text"
            label="Customer Name"
            placeholder="Enter customer name"
            :error="errors.name_on_contract"
            required
          />

          <FormField
            v-model="form.unique_id"
            type="text"
            label="Unique ID"
            placeholder="Enter unique identifier"
            :error="errors.unique_id"
            required
          />

          <FormField
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="Enter email address"
            :error="errors.email"
          />

          <FormField
            v-model="form.phone_number"
            type="tel"
            label="Phone Number"
            placeholder="Enter phone number"
            :error="errors.phone_number"
          />

          <FormField
            v-model="form.address"
            type="textarea"
            label="Address"
            placeholder="Enter full address"
            :rows="3"
            :error="errors.address"
            required
          />
        </div>
      </template>
    </FormModal>

    <!-- Edit Customer Modal -->
    <FormModal
      :open="showEditModal"
      entity-name="Customer"
      :initial-data="selectedCustomer"
      :validation-rules="customerValidationRules"
      :submit-handler="handleUpdateCustomer"
      @close="closeEditModal"
      @saved="handleCustomerSaved"
    >
      <template #default="{ form, errors }">
        <div class="space-y-4">
          <FormField
            v-model="form.name_on_contract"
            type="text"
            label="Customer Name"
            placeholder="Enter customer name"
            :error="errors.name_on_contract"
            required
          />

          <FormField
            v-model="form.unique_id"
            type="text"
            label="Unique ID"
            placeholder="Enter unique identifier"
            :error="errors.unique_id"
            required
          />

          <FormField
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="Enter email address"
            :error="errors.email"
          />

          <FormField
            v-model="form.phone_number"
            type="tel"
            label="Phone Number"
            placeholder="Enter phone number"
            :error="errors.phone_number"
          />

          <FormField
            v-model="form.address"
            type="textarea"
            label="Address"
            placeholder="Enter full address"
            :rows="3"
            :error="errors.address"
            required
          />
        </div>
      </template>
    </FormModal>

    <!-- View Customer Modal -->
    <BaseModal
      :open="showViewModal"
      title="Customer Details"
      size="large"
      @close="showViewModal = false"
    >
      <div v-if="selectedCustomer" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Name:</strong> {{ selectedCustomer.name_on_contract }}</div>
              <div><strong>Unique ID:</strong> {{ selectedCustomer.unique_id }}</div>
              <div><strong>Email:</strong> {{ selectedCustomer.email || 'Not provided' }}</div>
              <div><strong>Phone:</strong> {{ selectedCustomer.phone_number || 'Not provided' }}</div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Record Information</h4>
            <div class="space-y-2 text-sm">
              <div><strong>Customer ID:</strong> #{{ selectedCustomer.customer_id }}</div>
              <div><strong>Created:</strong> {{ formatDate(selectedCustomer.created_at) }}</div>
              <div><strong>Last Updated:</strong> {{ formatDate(selectedCustomer.updated_at) }}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-900 mb-3">Address</h4>
          <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            {{ selectedCustomer.address }}
          </div>
        </div>

        <!-- Customer Contracts Section -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Associated Contracts</h4>
          <div class="text-sm">
            <template v-if="getCustomerContracts(selectedCustomer.customer_id).length > 0">
              <div class="space-y-3">
                <div 
                  v-for="contract in getCustomerContracts(selectedCustomer.customer_id)" 
                  :key="contract.contract_id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <router-link
                        :to="`/contracts?view=${contract.contract_id}`"
                        class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        :title="`View contract for ${contract.service_address}`"
                      >
                        {{ contract.service_address }}
                      </router-link>
                      <div class="text-xs text-gray-500 mt-1">
                        Contract #{{ contract.contract_id }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(contract.start_date) }} - {{ formatDate(contract.end_date) }}
                      </div>
                    </div>
                    <span :class="getContractStatusClass(contract.start_date, contract.end_date)">
                      {{ getContractStatus(contract.start_date, contract.end_date).label }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="text-gray-400 italic text-center py-4">
              No contracts associated with this customer
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="showViewModal = false"
          class="btn btn-outline"
        >
          Close
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :open="showDeleteModal"
      type="danger"
      :entity-name="'customer'"
      :entity-value="selectedCustomer?.name_on_contract"
      :loading="deleteLoading"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { customerService, customerUtils } from '@/services/customers'
import api from '@/services/api'

// Components
import DataTable from '@/components/tables/DataTable.vue'
import FormModal from '@/components/ui/FormModal.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import FormField from '@/components/forms/FormField.vue'

// Store and route
const authStore = useAuthStore()
const route = useRoute()

// Reactive data
const loading = ref(false)
const error = ref('')
const customers = ref([])
const contracts = ref([])

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedCustomer = ref(null)
const deleteLoading = ref(false)

// Helper functions (defined before using in reactive computations)
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

// Table configuration
const tableColumns = [
  { key: 'customer', label: 'Customer', sortable: true, searchable: true },
  { key: 'contact', label: 'Contact Info', sortable: false },
  { key: 'address', label: 'Address', sortable: true, searchable: true },
  { key: 'contracts', label: 'Contracts', sortable: false },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'updated_at', label: 'Updated', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

// Form validation rules
const customerValidationRules = {
  name_on_contract: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  unique_id: {
    required: true,
    minLength: 1,
    maxLength: 255,
    validator: (value, form) => {
      if (!value) return true
      
      // Check uniqueness (skip for editing same customer)
      const existingCustomer = customers.value.find(c => 
        c.unique_id === value && 
        (!selectedCustomer.value || c.customer_id !== selectedCustomer.value.customer_id)
      )
      
      return !existingCustomer || 'This unique ID is already in use'
    }
  },
  email: {
    email: true,
    maxLength: 255
  },
  phone_number: {
    phone: true,
    maxLength: 15
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 1000
  }
}

// Computed properties
const canManageCustomers = computed(() => {
  return authStore.hasPermission('customers', 'create') ||
         authStore.hasPermission('customers', 'update') ||
         authStore.user?.role?.name === 'admin'
})

const recentCustomers = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return customers.value.filter(customer =>
    new Date(customer.created_at) >= thirtyDaysAgo
  ).length
})

const customersWithEmail = computed(() => {
  return customers.value.filter(customer => customer.email).length
})

const customersWithContracts = computed(() => {
  return customers.value.filter(customer => 
    getCustomerContracts(customer.customer_id).length > 0
  ).length
})

// Methods
const loadCustomers = async () => {
  loading.value = true
  error.value = ''

  try {
    customers.value = await customerService.customers.getAll()
  } catch (err) {
    error.value = customerUtils.formatError(err)
    console.error('Failed to load customers:', err)
  } finally {
    loading.value = false
  }
}

const loadContracts = async () => {
  try {
    const response = await api.get('/contracts')
    contracts.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load contracts:', err)
    contracts.value = []
  }
}

const getCustomerContracts = (customerId) => {
  return contracts.value.filter(contract => {
    if (contract.customers && Array.isArray(contract.customers)) {
      return contract.customers.some(customer => customer.customer_id === customerId)
    }
    return contract.customer_id === customerId
  })
}

const getContractStatus = (startDate, endDate) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) {
    return { status: 'upcoming', label: 'Upcoming' }
  } else if (now > end) {
    return { status: 'expired', label: 'Expired' }
  } else {
    return { status: 'active', label: 'Active' }
  }
}

const getContractStatusClass = (startDate, endDate) => {
  const status = getContractStatus(startDate, endDate).status
  const baseClass = 'inline-block px-2 py-1 rounded text-xs font-medium'
  
  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    upcoming: 'bg-yellow-100 text-yellow-800'
  }
  
  return `${baseClass} ${statusClasses[status]}`
}

// Modal handlers
const closeCreateModal = () => {
  showCreateModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedCustomer.value = null
}

const handleCreateCustomer = async (formData) => {
  const response = await customerService.customers.create(formData)
  return response
}

const handleUpdateCustomer = async (formData) => {
  const response = await customerService.customers.update(selectedCustomer.value.customer_id, formData)
  return response
}

const handleCustomerSaved = () => {
  loadCustomers()
  loadContracts()
  closeCreateModal()
  closeEditModal()
}

const viewCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  showViewModal.value = true
}

const editCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  showEditModal.value = true
}

const deleteCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    await customerService.customers.delete(selectedCustomer.value.customer_id)
    await loadCustomers()
    await loadContracts()
    showDeleteModal.value = false
    selectedCustomer.value = null
  } catch (err) {
    alert('Failed to delete customer: ' + customerUtils.formatError(err))
  } finally {
    deleteLoading.value = false
  }
}

onMounted(async () => {
  await Promise.allSettled([
    loadCustomers(),
    loadContracts()
  ])

  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    const customer = customers.value.find(c => c.customer_id === parseInt(viewId))
    if (customer) {
      viewCustomer(customer)
    }
  }
})
</script>
