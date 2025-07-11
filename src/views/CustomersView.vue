<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Customer Management</h1>
      <p class="text-gray-600">Manage customer records and contracts</p>
    </div>

    <!-- ✅ CONSOLIDATED: Stats Grid using reusable component -->
    <StatsGrid :stats="customerStatsFormatted" />

    <!-- ✅ CONSOLIDATED: Filter Bar (Search handled by DataTable) -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Filter Controls -->
          <div class="flex gap-2">
            <!-- Contract Status Filter -->
            <select
              v-model="contractFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Customers</option>
              <option value="with_contracts">With Contracts</option>
              <option value="without_contracts">Without Contracts</option>
            </select>

            <!-- Email Status Filter -->
            <select
              v-model="emailFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Emails</option>
              <option value="with_email">With Email</option>
              <option value="without_email">Without Email</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 ml-auto">
            <button @click="clearFilters" class="btn btn-outline">
              <ActionIcon name="clear" size="xs" class="mr-1" />
              Clear Filters
            </button>
            <button @click="loadCustomers" class="btn btn-outline">
              <ActionIcon name="refresh" size="xs" class="mr-1" />
              Refresh
            </button>
            <button
              v-if="canManageCustomers"
              @click="openCreateModal"
              class="btn btn-primary"
            >
              <ActionIcon name="add" size="xs" class="mr-1" />
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ CONSOLIDATED: Customers Table using DataTable component -->
    <DataTable
      :items="filteredCustomers"
      :columns="customerColumns"
      :loading="loading"
      :error="error"
      title="Customers"
      :searchable="true"
      search-placeholder="Search customers by name, email, unique ID, or address..."
      :search-columns="['name_on_contract', 'email', 'unique_id', 'address', 'display_name']"
      :paginated="true"
      :initial-page-size="25"
      :sortable="true"
      :initial-sort="{ column: 'created_at', direction: 'desc' }"
      :clickable-rows="true"
      :show-refresh="true"
      empty-state-title="No customers found"
      :empty-state-message="contractFilter || emailFilter ? 'No customers match your filter criteria' : 'Click \'Add Customer\' to create your first customer'"
      @refresh="loadCustomers"
      @row-click="viewCustomer"
    >
      <!-- Custom cell renderers -->
      <template #cell-display_name="{ item }">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <div class="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ customerUtils.getInitials(item) }}
              </span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">
              {{ item.name_on_contract }}
            </div>
            <div class="text-sm text-gray-500">
              ID: {{ item.unique_id }}
            </div>
            <div class="text-xs text-gray-400">
              #{{ item.customer_id }}
            </div>
          </div>
        </div>
      </template>

      <template #cell-contact="{ item }">
        <div>
          <div class="text-sm text-gray-900">{{ item.email || 'No email' }}</div>
          <div class="text-sm text-gray-500">{{ item.phone_number || 'No phone' }}</div>
        </div>
      </template>

      <template #cell-address="{ item }">
        <div class="text-sm text-gray-900 max-w-xs truncate" :title="item.address">
          {{ item.address }}
        </div>
      </template>

      <template #cell-contracts="{ item }">
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
              +{{ getCustomerContracts(item.customer_id).length - 2 }} more
            </div>
          </template>
          <span v-else class="text-gray-400 italic text-xs">No contracts</span>
        </div>
      </template>

      <template #cell-created_at="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.created_at) }}
        </span>
      </template>

      <template #cell-updated_at="{ item }">
        <span class="text-sm text-gray-500">
          {{ formatDate(item.updated_at) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <CustomerActionButtons
          :customer="item"
          :can-manage="canManageCustomers"
          @view="viewCustomer"
          @edit="editCustomer"
          @delete="deleteCustomer"
        />
      </template>
    </DataTable>

    <!-- Create Customer Modal -->
    <CustomerFormModal
      v-if="showCreateModal"
      key="create-customer-modal"
      :show-modal="showCreateModal"
      :all-customers="customers"
      @close="closeCreateModal"
      @saved="handleCustomerSaved"
    />

    <!-- Edit Customer Modal -->
    <CustomerFormModal
      v-if="showEditModal && selectedCustomer"
      :key="`edit-customer-modal-${selectedCustomer.customer_id}`"
      :show-modal="showEditModal"
      :customer="selectedCustomer"
      :all-customers="customers"
      @close="closeEditModal"
      @saved="handleCustomerSaved"
    />

    <!-- View Customer Modal -->
    <BaseModal
      :open="showViewModal"
      title="Customer Details"
      size="large"
      @close="closeViewModal"
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

        <!-- System Notice if customer has many contracts -->
        <div v-if="getCustomerContracts(selectedCustomer.customer_id).length > 5" class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <ActionIcon name="info" size="sm" class="text-blue-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm text-blue-800">
                <strong>Note:</strong> This customer has {{ getCustomerContracts(selectedCustomer.customer_id).length }} contracts. Consider reviewing contract management for this customer.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="closeViewModal" class="btn btn-outline">
            Close
          </button>
          <button
            v-if="canManageCustomers && selectedCustomer"
            @click="editFromView"
            class="btn btn-primary"
          >
            <ActionIcon name="edit" size="xs" class="mr-1" />
            Edit Customer
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :open="showDeleteModal"
      type="danger"
      entity-name="customer"
      :entity-value="selectedCustomer?.name_on_contract"
      :loading="deleteLoading"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    >
      <template #default>
        <!-- Show error message if present -->
        <div v-if="deleteError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-left">
          <div class="flex">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm text-red-800">
                <strong>Error:</strong> {{ deleteError }}
              </p>
            </div>
          </div>
        </div>

        <!-- Default confirmation message -->
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-4">
            Are you sure you want to delete customer "{{ selectedCustomer?.name_on_contract }}"? This action cannot be undone.
          </p>

          <!-- Warning about contracts -->
          <div v-if="selectedCustomer && getCustomerContracts(selectedCustomer.customer_id).length > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-left">
            <div class="flex">
              <ActionIcon name="warning" size="sm" class="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-sm text-yellow-800">
                  <strong>Warning:</strong> This customer has {{ getCustomerContracts(selectedCustomer.customer_id).length }} active contract(s).
                  Deleting the customer may affect these contracts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { customerService, customerUtils } from '@/services/customers'
import { formatDate } from '@/utils/formatters'
import { useErrorHandler } from '@/utils/errorHandling'
import api from '@/services/api'

// ✅ CONSOLIDATED: Import reusable components
import ActionIcon from '@/components/icons/ActionIcons.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import DataTable from '@/components/tables/DataTable.vue'
import CustomerFormModal from '@/components/admin/customers/CustomerFormModal.vue'
import CustomerActionButtons from '@/components/admin/customers/CustomerActionButtons.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const authStore = useAuthStore()
const route = useRoute()

// ✅ CONSOLIDATED: Use centralized error handling
const { handleError } = useErrorHandler('Customer Management')

// Reactive data
const loading = ref(false)
const error = ref('')
const customers = ref([])
const contracts = ref([])
const customerStats = ref({
  total: 0,
  recent: 0,
  withEmail: 0,
  withContracts: 0
})

// ✅ CONSOLIDATED: Filter states (search handled by DataTable)
const contractFilter = ref('')
const emailFilter = ref('')

// Modal states - SIMPLIFIED
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedCustomer = ref(null)
const deleteLoading = ref(false)
const deleteError = ref('') // Add error state for delete modal

// ✅ CONSOLIDATED: Define table columns for DataTable
const customerColumns = [
  {
    key: 'display_name',
    label: 'Customer',
    sortable: true,
    searchable: true
  },
  {
    key: 'contact',
    label: 'Contact Info',
    sortable: false
  },
  {
    key: 'address',
    label: 'Address',
    sortable: true,
    searchable: true
  },
  {
    key: 'contracts',
    label: 'Contracts',
    sortable: false
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'updated_at',
    label: 'Updated',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    cellClass: 'text-right'
  }
]

// ✅ CONSOLIDATED: Permission checks
const canManageCustomers = computed(() => {
  return authStore.hasPermission('customers', 'create') ||
         authStore.hasPermission('customers', 'update') ||
         authStore.user?.role?.name === 'admin'
})

// ✅ CONSOLIDATED: Format stats for StatsGrid component
const customerStatsFormatted = computed(() => [
  {
    title: 'Total Customers',
    value: customerStats.value.total,
    icon: 'users',
    color: 'blue'
  },
  {
    title: 'Recent (30 days)',
    value: customerStats.value.recent,
    icon: 'clock',
    color: 'green'
  },
  {
    title: 'With Email',
    value: customerStats.value.withEmail,
    icon: 'mail',
    color: 'purple'
  },
  {
    title: 'With Contracts',
    value: customerStats.value.withContracts,
    icon: 'document',
    color: 'orange'
  }
])

// ✅ CONSOLIDATED: Filtered customers for DataTable
const filteredCustomers = computed(() => {
  let filtered = customers.value.map(customer => ({
    ...customer,
    display_name: customer.name_on_contract,
    contract_count: getCustomerContracts(customer.customer_id).length
  }))

  // Apply contract filter
  if (contractFilter.value) {
    if (contractFilter.value === 'with_contracts') {
      filtered = filtered.filter(customer => customer.contract_count > 0)
    } else if (contractFilter.value === 'without_contracts') {
      filtered = filtered.filter(customer => customer.contract_count === 0)
    }
  }

  // Apply email filter
  if (emailFilter.value) {
    if (emailFilter.value === 'with_email') {
      filtered = filtered.filter(customer => customer.email)
    } else if (emailFilter.value === 'without_email') {
      filtered = filtered.filter(customer => !customer.email)
    }
  }

  return filtered
})

// ✅ CONSOLIDATED: Clear filters
const clearFilters = () => {
  contractFilter.value = ''
  emailFilter.value = ''
}

// ✅ SAFETY: Enhanced error handling with recovery
const handleCustomerError = (error, context = '') => {
  console.error(`Customer management error ${context}:`, error)

  // Reset modal states on error
  showCreateModal.value = false
  showEditModal.value = false
  showViewModal.value = false
  showDeleteModal.value = false
  selectedCustomer.value = null
  deleteLoading.value = false

  return handleError(error)
}

// API functions
const loadCustomers = async () => {
  loading.value = true
  error.value = ''

  try {
    const customersData = await customerService.customers.getAll()
    customers.value = customersData

    // Generate stats from customer data
    customerStats.value = customerUtils.generateStats(customers.value, contracts.value)

  } catch (err) {
    error.value = handleCustomerError(err, 'loadCustomers')
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

// Helper functions
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

// ✅ FIXED: Modal handlers with proper state management
const openCreateModal = () => {
  console.log('Opening create modal') // Debug log
  
  // Close all other modals first
  showEditModal.value = false
  showViewModal.value = false
  showDeleteModal.value = false
  selectedCustomer.value = null
  
  // Open create modal
  showCreateModal.value = true
}

const closeCreateModal = () => {
  console.log('Closing create modal') // Debug log
  showCreateModal.value = false
}

const closeEditModal = () => {
  console.log('Closing edit modal') // Debug log
  showEditModal.value = false
  selectedCustomer.value = null
}

const closeViewModal = () => {
  console.log('Closing view modal') // Debug log
  showViewModal.value = false
  selectedCustomer.value = null
}

const closeDeleteModal = () => {
  console.log('Closing delete modal') // Debug log
  showDeleteModal.value = false
  deleteError.value = '' // Clear error when closing
  selectedCustomer.value = null
}

const handleCustomerSaved = () => {
  console.log('Customer saved, reloading data') // Debug log
  
  // Reload data
  loadCustomers()
  loadContracts()
  
  // Close modals
  showCreateModal.value = false
  showEditModal.value = false
  selectedCustomer.value = null
}

const viewCustomer = (customer) => {
  console.log('View customer clicked:', customer.customer_id) // Debug log
  
  if (!customer || !customer.customer_id) {
    console.warn('Invalid customer for view:', customer)
    return
  }

  // Close all other modals
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false

  // Set customer and open modal
  selectedCustomer.value = { ...customer }
  
  nextTick(() => {
    showViewModal.value = true
    console.log('View modal should be open now')
  })
}

const editCustomer = (customer) => {
  console.log('Edit customer clicked:', customer.customer_id) // Debug log
  
  if (!customer || !customer.customer_id) {
    console.warn('Invalid customer for edit:', customer)
    return
  }

  // Close all other modals
  showCreateModal.value = false
  showViewModal.value = false
  showDeleteModal.value = false

  // Set customer and open modal
  selectedCustomer.value = { ...customer }
  
  nextTick(() => {
    showEditModal.value = true
    console.log('Edit modal should be open now')
  })
}

const editFromView = () => {
  console.log('Edit from view clicked') // Debug log
  
  if (!selectedCustomer.value) {
    console.warn('No selected customer for edit from view')
    return
  }
  
  showViewModal.value = false
  
  nextTick(() => {
    showEditModal.value = true
    console.log('Edit modal opened from view')
  })
}

const deleteCustomer = (customer) => {
  console.log('Delete customer clicked:', customer.customer_id) // Debug log
  
  if (!customer || !customer.customer_id) {
    console.warn('Invalid customer for delete:', customer)
    return
  }

  // Close all other modals
  showCreateModal.value = false
  showEditModal.value = false
  showViewModal.value = false

  // Clear any previous delete error
  deleteError.value = ''

  // Set customer and open modal
  selectedCustomer.value = { ...customer }
  
  nextTick(() => {
    showDeleteModal.value = true
    console.log('Delete modal should be open now')
  })
}

const confirmDelete = async () => {
  if (!selectedCustomer.value?.customer_id) {
    deleteError.value = 'No customer selected for deletion'
    return
  }

  deleteLoading.value = true
  deleteError.value = '' // Clear any previous errors

  try {
    await customerService.customers.delete(selectedCustomer.value.customer_id)
    await loadCustomers()
    await loadContracts()
    
    showDeleteModal.value = false
    selectedCustomer.value = null
    deleteError.value = '' // Clear error on success
  } catch (err) {
    // Don't close the modal on error, show the error message in the modal
    console.error('Delete error:', err)
    
    // Create a user-friendly error message
    if (err.message && err.message.includes('contracts')) {
      deleteError.value = 'Cannot delete customer: This customer has active contracts. Please remove or reassign the contracts first.'
    } else if (err.response?.data?.message) {
      deleteError.value = err.response.data.message
    } else if (err.message) {
      deleteError.value = err.message
    } else {
      deleteError.value = 'Failed to delete customer. Please try again.'
    }
    
  } finally {
    deleteLoading.value = false
  }
}

onMounted(async () => {
  console.log('CustomersView mounted') // Debug log
  
  // Load data in parallel
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

<style scoped>
/* DataTable handles most styling, minimal custom styles needed */
</style>
