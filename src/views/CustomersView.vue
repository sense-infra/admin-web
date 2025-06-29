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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search customers by name, email, or unique ID..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="clearFilters"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            Clear
          </button>
          <button
            @click="loadCustomers"
            class="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Customers</h2>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading customers...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600">
        <p>{{ error }}</p>
        <button @click="loadCustomers" class="mt-2 text-blue-600 hover:text-blue-800">
          Try Again
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in filteredCustomers" :key="customer.customer_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ customer.name_on_contract }}</div>
                  <div class="text-sm text-gray-500">ID: {{ customer.unique_id }}</div>
                  <div class="text-xs text-gray-400">#{{ customer.customer_id }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-gray-900">{{ customer.email || 'No email' }}</div>
                  <div class="text-sm text-gray-500">{{ customer.phone_number || 'No phone' }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" :title="customer.address">
                  {{ customer.address }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewCustomer(customer)"
                    class="text-green-600 hover:text-green-900"
                    title="View Customer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button
                    v-if="canManageCustomers"
                    @click="editCustomer(customer)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Edit Customer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    v-if="canManageCustomers"
                    @click="deleteCustomer(customer)"
                    class="text-red-600 hover:text-red-900"
                    title="Delete Customer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredCustomers.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          <p class="mt-2">No customers found</p>
          <p class="text-sm text-gray-400">
            {{ searchQuery ? 'Try adjusting your search' : 'Click "Add Customer" to create your first customer' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Create Customer Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form @submit.prevent="handleCreateCustomer">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Customer</h3>
            <button
              type="button"
              @click="closeCreateModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div v-if="createError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ createError }}
          </div>

          <div class="space-y-4">
            <div>
              <label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                id="customerName"
                v-model="createForm.name_on_contract"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label for="uniqueId" class="block text-sm font-medium text-gray-700 mb-1">
                Unique ID *
              </label>
              <input
                id="uniqueId"
                v-model="createForm.unique_id"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter unique identifier"
              />
            </div>

            <div>
              <label for="customerEmail" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="customerEmail"
                v-model="createForm.email"
                type="email"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="customerPhone"
                v-model="createForm.phone_number"
                type="tel"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label for="customerAddress" class="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                id="customerAddress"
                v-model="createForm.address"
                required
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full address"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="createLoading || !isCreateFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {{ createLoading ? 'Creating...' : 'Create Customer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Customer Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form @submit.prevent="handleUpdateCustomer">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Customer</h3>
            <button
              type="button"
              @click="closeEditModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div v-if="editError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ editError }}
          </div>

          <div class="space-y-4">
            <div>
              <label for="editCustomerName" class="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                id="editCustomerName"
                v-model="editForm.name_on_contract"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="editUniqueId" class="block text-sm font-medium text-gray-700 mb-1">
                Unique ID *
              </label>
              <input
                id="editUniqueId"
                v-model="editForm.unique_id"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="editCustomerEmail" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="editCustomerEmail"
                v-model="editForm.email"
                type="email"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="editCustomerPhone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="editCustomerPhone"
                v-model="editForm.phone_number"
                type="tel"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="editCustomerAddress" class="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                id="editCustomerAddress"
                v-model="editForm.address"
                required
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeEditModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="editLoading || !isEditFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {{ editLoading ? 'Updating...' : 'Update Customer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Customer Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Customer Details</h3>
          <button
            type="button"
            @click="showViewModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="selectedCustomer" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div class="space-y-2 text-sm">
                <div><strong>Name:</strong> {{ selectedCustomer.name_on_contract }}</div>
                <div><strong>Unique ID:</strong> {{ selectedCustomer.unique_id }}</div>
                <div><strong>Email:</strong> {{ selectedCustomer.email || 'Not provided' }}</div>
                <div><strong>Phone:</strong> {{ selectedCustomer.phone_number || 'Not provided' }}</div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Address</h4>
              <div class="text-sm text-gray-600">
                {{ selectedCustomer.address }}
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-2">Record Information</h4>
              <div class="space-y-2 text-sm">
                <div><strong>Customer ID:</strong> #{{ selectedCustomer.customer_id }}</div>
                <div><strong>Created:</strong> {{ formatDate(selectedCustomer.created_at) }}</div>
                <div><strong>Last Updated:</strong> {{ formatDate(selectedCustomer.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="showViewModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Customer</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete <strong>{{ selectedCustomer?.name_on_contract }}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="confirmDelete"
              :disabled="deleteLoading"
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
            >
              {{ deleteLoading ? 'Deleting...' : 'Delete' }}
            </button>
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { customerService, customerUtils } from '@/services/customers'
import { useRoute } from 'vue-router'

// Store
const authStore = useAuthStore()

// Routes
const route = useRoute()

// Reactive data
const loading = ref(false)
const error = ref('')
const customers = ref([])
const searchQuery = ref('')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedCustomer = ref(null)

// Form states
const createLoading = ref(false)
const createError = ref('')
const editLoading = ref(false)
const editError = ref('')
const deleteLoading = ref(false)

// Form data
const createForm = ref({
  name_on_contract: '',
  unique_id: '',
  email: '',
  phone_number: '',
  address: ''
})

const editForm = ref({
  name_on_contract: '',
  unique_id: '',
  email: '',
  phone_number: '',
  address: ''
})

// Computed properties
const canManageCustomers = computed(() => {
  return authStore.hasPermission('customers', 'create') ||
         authStore.hasPermission('customers', 'update') ||
         authStore.user?.role?.name === 'admin'
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customers.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(customer =>
    customer.name_on_contract.toLowerCase().includes(query) ||
    customer.email?.toLowerCase().includes(query) ||
    customer.unique_id?.toLowerCase().includes(query) ||
    customer.address.toLowerCase().includes(query)
  )
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

const isCreateFormValid = computed(() => {
  return createForm.value.name_on_contract.trim() !== '' &&
         createForm.value.unique_id.trim() !== '' &&
         createForm.value.address.trim() !== ''
})

const isEditFormValid = computed(() => {
  return editForm.value.name_on_contract.trim() !== '' &&
         editForm.value.unique_id.trim() !== '' &&
         editForm.value.address.trim() !== ''
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

const clearFilters = () => {
  searchQuery.value = ''
}

// Modal management
const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    name_on_contract: '',
    unique_id: '',
    email: '',
    phone_number: '',
    address: ''
  }
  createError.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedCustomer.value = null
  editError.value = ''
}

// Customer operations
const handleCreateCustomer = async () => {
  createLoading.value = true
  createError.value = ''

  try {
    console.log('Creating customer with form data:', createForm.value)

    // Validate form data
    const validation = customerUtils.validateCustomerData(createForm.value)
    if (!validation.isValid) {
      createError.value = validation.errors.join(', ')
      return
    }

    const response = await customerService.customers.create(createForm.value)
    console.log('Customer creation response:', response)

    await loadCustomers()
    closeCreateModal()
  } catch (err) {
    console.error('Customer creation failed:', err)
    createError.value = customerUtils.formatError(err)
  } finally {
    createLoading.value = false
  }
}

const viewCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  showViewModal.value = true
}

const editCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  editForm.value = {
    name_on_contract: customer.name_on_contract,
    unique_id: customer.unique_id,
    email: customer.email || '',
    phone_number: customer.phone_number || '',
    address: customer.address
  }
  editError.value = ''
  showEditModal.value = true
}

const handleUpdateCustomer = async () => {
  editLoading.value = true
  editError.value = ''

  try {
    console.log('Updating customer with form data:', editForm.value)

    // Validate form data
    const validation = customerUtils.validateCustomerData(editForm.value)
    if (!validation.isValid) {
      editError.value = validation.errors.join(', ')
      return
    }

    await customerService.customers.update(selectedCustomer.value.customer_id, editForm.value)
    await loadCustomers()
    closeEditModal()
  } catch (err) {
    console.error('Customer update failed:', err)
    editError.value = customerUtils.formatError(err)
  } finally {
    editLoading.value = false
  }
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
    showDeleteModal.value = false
    selectedCustomer.value = null
  } catch (err) {
    alert('Failed to delete customer: ' + customerUtils.formatError(err))
  } finally {
    deleteLoading.value = false
  }
}

// Helper functions
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

onMounted(async () => {
  await loadCustomers() // Your existing load function
  
  // Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    // Find the customer and open the view modal
    const customer = customers.value.find(c => c.customer_id === parseInt(viewId))
    if (customer) {
      viewCustomer(customer) // Your existing view function
    }
  }
})
</script>
