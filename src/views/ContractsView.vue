<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Contract Management</h1>
      <p class="text-gray-600">Create and manage customer contracts with service assignments</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Contracts</dt>
              <dd class="text-lg font-medium text-gray-900">{{ contracts.length }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Active Contracts</dt>
              <dd class="text-lg font-medium text-gray-900">{{ activeContracts }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
              <dd class="text-lg font-medium text-gray-900">{{ expiringSoonContracts }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Expired</dt>
              <dd class="text-lg font-medium text-gray-900">{{ expiredContracts }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search contracts by address, customer, or service tier..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
            <button @click="clearFilters" class="btn btn-outline">Clear</button>
            <button @click="loadContracts" class="btn btn-outline">Refresh</button>
            <button
              v-if="canCreateContracts"
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              Add Contract
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contracts Table -->
    <div class="card">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Contracts</h2>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {{ error }}
        </div>

        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Contract</th>
                <th class="table-header-cell">Customer(s)</th>
                <th class="table-header-cell">Service Tier</th>
                <th class="table-header-cell">Contract Period</th>
                <th class="table-header-cell">Status</th>
                <th class="table-header-cell">Created</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="loading" class="table-row">
                <td colspan="7" class="table-cell text-center">Loading contracts...</td>
              </tr>
              <tr v-else-if="filteredContracts.length === 0" class="table-row">
                <td colspan="7" class="table-cell text-center">
                  {{ searchQuery || statusFilter ? 'No contracts match your search' : 'No contracts found' }}
                </td>
              </tr>
              <tr v-else v-for="contract in filteredContracts" :key="contract.contract_id" class="table-row">
                <td class="table-cell">
                  <div>
                    <div class="text-sm font-medium text-gray-900 max-w-xs truncate" :title="contract.service_address">
                      {{ contract.service_address }}
                    </div>
                    <div class="text-xs text-gray-400">#{{ contract.contract_id }}</div>
                    <div v-if="contract.notification_email" class="text-xs text-gray-500">
                      📧 {{ contract.notification_email }}
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="text-sm text-gray-900">
                    <template v-if="contract.customers && contract.customers.length > 0">
                      <template v-if="contract.customers.length === 1">
                        <router-link 
                          :to="`/customers?view=${contract.customers[0].customer_id}`"
                          class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          :title="`View ${contract.customers[0].name_on_contract || contract.customers[0].NameOnContract} details`"
                        >
                          {{ contract.customers[0].name_on_contract || contract.customers[0].NameOnContract }}
                        </router-link>
                      </template>
                      <template v-else>
                        <router-link 
                          :to="`/customers?view=${contract.customers[0].customer_id}`"
                          class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          :title="`View ${contract.customers[0].name_on_contract || contract.customers[0].NameOnContract} details`"
                        >
                          {{ contract.customers[0].name_on_contract || contract.customers[0].NameOnContract }}
                        </router-link>
                        <span class="text-gray-500 ml-1">+{{ contract.customers.length - 1 }} more</span>
                      </template>
                    </template>
                    <span v-else class="text-gray-400 italic">No customer assigned</span>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="text-sm text-gray-900">
                    <template v-if="contract.current_service_tier?.name || contract.CurrentServiceTier?.Name">
                      <router-link 
                        :to="`/service-tiers?view=${contract.current_service_tier?.service_tier_id || contract.CurrentServiceTier?.service_tier_id}`"
                        class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        :title="`View ${contract.current_service_tier?.name || contract.CurrentServiceTier?.Name} details`"
                      >
                        {{ contract.current_service_tier?.name || contract.CurrentServiceTier?.Name }}
                      </router-link>
                    </template>
                    <span v-else class="text-gray-400 italic">No tier assigned</span>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(contract.start_date) }} - {{ formatDate(contract.end_date) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getContractDuration(contract.start_date, contract.end_date) }}
                  </div>
                </td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    getContractStatus(contract.start_date, contract.end_date).status === 'active' ? 'badge-success' :
                    getContractStatus(contract.start_date, contract.end_date).status === 'expired' ? 'badge-danger' : 'badge-warning'
                  ]">
                    {{ getContractStatus(contract.start_date, contract.end_date).label }}
                  </span>
                  <div v-if="getContractStatus(contract.start_date, contract.end_date).status === 'active'" class="text-xs text-gray-500 mt-1">
                    {{ getDaysUntilExpiry(contract.end_date) }} days left
                  </div>
                </td>
                <td class="table-cell">{{ formatDate(contract.created_at) }}</td>
                <td class="table-cell">
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewContract(contract)"
                      class="text-green-600 hover:text-green-900"
                      title="View Contract"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      v-if="canUpdateContracts"
                      @click="editContract(contract)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Edit Contract"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      v-if="canDeleteContracts"
                      @click="deleteContract(contract)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete Contract"
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
        </div>
      </div>
    </div>

    <!-- Create Contract Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeCreateModal"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Contract</h3>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="createError" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ createError }}
          </div>

          <form @submit.prevent="handleCreateContract">
            <div class="space-y-6">
              <!-- Basic Contract Information -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Contract Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label for="serviceAddress" class="form-label">Service Address *</label>
                    <textarea
                      id="serviceAddress"
                      v-model="createForm.service_address"
                      required
                      rows="2"
                      class="form-input"
                      placeholder="Enter the address where service will be provided"
                    ></textarea>
                  </div>

                  <div>
                    <label for="startDate" class="form-label">Start Date *</label>
                    <input
                      id="startDate"
                      v-model="createForm.start_date"
                      type="date"
                      required
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label for="endDate" class="form-label">End Date *</label>
                    <input
                      id="endDate"
                      v-model="createForm.end_date"
                      type="date"
                      required
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label for="notificationEmail" class="form-label">Notification Email</label>
                    <input
                      id="notificationEmail"
                      v-model="createForm.notification_email"
                      type="email"
                      class="form-input"
                      placeholder="Email for contract notifications"
                    />
                  </div>

                  <div>
                    <label for="notificationPhone" class="form-label">Notification Phone</label>
                    <input
                      id="notificationPhone"
                      v-model="createForm.notification_phone"
                      type="tel"
                      class="form-input"
                      placeholder="Phone for contract notifications"
                    />
                  </div>
                </div>
              </div>

              <!-- Customer Assignment -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Customer Assignment</h4>
                <div>
                  <label for="customerId" class="form-label">Assign Customer *</label>
                  <select
                    id="customerId"
                    v-model="createForm.customer_id"
                    required
                    class="form-input"
                  >
                    <option value="">Select a customer</option>
                    <option
                      v-for="customer in availableCustomers"
                      :key="customer.customer_id"
                      :value="customer.customer_id"
                    >
                      {{ customer.name_on_contract }} ({{ customer.unique_id }})
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Select the customer this contract is for
                  </p>
                </div>
              </div>

              <!-- Service Tier Assignment -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Service Tier Assignment</h4>
                <div>
                  <label for="serviceTierId" class="form-label">Assign Service Tier *</label>
                  <select
                    id="serviceTierId"
                    v-model="createForm.service_tier_id"
                    required
                    class="form-input"
                  >
                    <option value="">Select a service tier</option>
                    <option
                      v-for="tier in availableServiceTiers"
                      :key="tier.service_tier_id"
                      :value="tier.service_tier_id"
                    >
                      {{ tier.name }}
                      <span v-if="tier.description">- {{ tier.description }}</span>
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Select the service tier for this contract
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeCreateModal" class="btn btn-outline">Cancel</button>
              <button type="submit" :disabled="createLoading || !isCreateFormValid" class="btn btn-primary">
                {{ createLoading ? 'Creating...' : 'Create Contract' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Contract Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeEditModal"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Contract</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="editError" class="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ editError }}
          </div>

          <form @submit.prevent="handleUpdateContract">
            <div class="space-y-6">
              <!-- Basic Contract Information -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Contract Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label for="editServiceAddress" class="form-label">Service Address *</label>
                    <textarea
                      id="editServiceAddress"
                      v-model="editForm.service_address"
                      required
                      rows="2"
                      class="form-input"
                    ></textarea>
                  </div>

                  <div>
                    <label for="editStartDate" class="form-label">Start Date *</label>
                    <input
                      id="editStartDate"
                      v-model="editForm.start_date"
                      type="date"
                      required
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label for="editEndDate" class="form-label">End Date *</label>
                    <input
                      id="editEndDate"
                      v-model="editForm.end_date"
                      type="date"
                      required
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label for="editNotificationEmail" class="form-label">Notification Email</label>
                    <input
                      id="editNotificationEmail"
                      v-model="editForm.notification_email"
                      type="email"
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label for="editNotificationPhone" class="form-label">Notification Phone</label>
                    <input
                      id="editNotificationPhone"
                      v-model="editForm.notification_phone"
                      type="tel"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Customer Assignment -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Customer Assignment</h4>
                <div>
                  <label for="editCustomerId" class="form-label">Assign Customer *</label>
                  <select
                    id="editCustomerId"
                    v-model="editForm.customer_id"
                    required
                    class="form-input"
                  >
                    <option value="">Select a customer</option>
                    <option
                      v-for="customer in availableCustomers"
                      :key="customer.customer_id"
                      :value="customer.customer_id"
                    >
                      {{ customer.name_on_contract }} ({{ customer.unique_id }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Service Tier Assignment -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Service Tier Assignment</h4>
                <div>
                  <label for="editServiceTierId" class="form-label">Assign Service Tier *</label>
                  <select
                    id="editServiceTierId"
                    v-model="editForm.service_tier_id"
                    required
                    class="form-input"
                  >
                    <option value="">Select a service tier</option>
                    <option
                      v-for="tier in availableServiceTiers"
                      :key="tier.service_tier_id"
                      :value="tier.service_tier_id"
                    >
                      {{ tier.name }}
                      <span v-if="tier.description">- {{ tier.description }}</span>
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeEditModal" class="btn btn-outline">Cancel</button>
              <button type="submit" :disabled="editLoading || !isEditFormValid" class="btn btn-primary">
                {{ editLoading ? 'Updating...' : 'Update Contract' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Contract Modal -->
    <div v-if="showViewModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="showViewModal = false"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Contract Details</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedContract" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Contract Information</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Contract ID:</strong> #{{ selectedContract.contract_id }}</div>
                  <div><strong>Service Address:</strong> {{ selectedContract.service_address }}</div>
                  <div><strong>Contract Period:</strong> {{ formatDate(selectedContract.start_date) }} - {{ formatDate(selectedContract.end_date) }}</div>
                  <div><strong>Duration:</strong> {{ getContractDuration(selectedContract.start_date, selectedContract.end_date) }}</div>
                  <div><strong>Status:</strong>
                    <span :class="[
                      'badge ml-2',
                      getContractStatus(selectedContract.start_date, selectedContract.end_date).status === 'active' ? 'badge-success' :
                      getContractStatus(selectedContract.start_date, selectedContract.end_date).status === 'expired' ? 'badge-danger' : 'badge-warning'
                    ]">
                      {{ getContractStatus(selectedContract.start_date, selectedContract.end_date).label }}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Notification Email:</strong> {{ selectedContract.notification_email || 'Not provided' }}</div>
                  <div><strong>Notification Phone:</strong> {{ selectedContract.notification_phone || 'Not provided' }}</div>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div class="text-sm">
                  <template v-if="selectedContract.customers && selectedContract.customers.length > 0">
                    <div v-for="(customer, index) in selectedContract.customers" :key="customer.customer_id" class="mb-2">
                      <router-link 
                        :to="`/customers?view=${customer.customer_id}`"
                        class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        :title="`View ${customer.name_on_contract || customer.NameOnContract} details`"
                      >
                        {{ customer.name_on_contract || customer.NameOnContract }}
                      </router-link>
                      <div class="text-xs text-gray-500 ml-4" v-if="customer.email">
                        📧 {{ customer.email }}
                      </div>
                      <div class="text-xs text-gray-500 ml-4" v-if="customer.phone_number">
                        📞 {{ customer.phone_number }}
                      </div>
                    </div>
                  </template>
                  <span v-else class="text-gray-400 italic">No customers assigned</span>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Service Tier</h4>
                <div class="text-sm">
                  <template v-if="selectedContract.current_service_tier?.name || selectedContract.CurrentServiceTier?.Name">
                    <router-link 
                      :to="`/service-tiers?view=${selectedContract.current_service_tier?.service_tier_id || selectedContract.CurrentServiceTier?.service_tier_id}`"
                      class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      :title="`View ${selectedContract.current_service_tier?.name || selectedContract.CurrentServiceTier?.Name} details`"
                    >
                      {{ selectedContract.current_service_tier?.name || selectedContract.CurrentServiceTier?.Name }}
                    </router-link>
                    <div class="text-xs text-gray-500 mt-1" v-if="selectedContract.current_service_tier?.description || selectedContract.CurrentServiceTier?.Description">
                      {{ selectedContract.current_service_tier?.description || selectedContract.CurrentServiceTier?.Description }}
                    </div>
                  </template>
                  <span v-else class="text-gray-400 italic">No tier assigned</span>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Record Information</h4>
                <div class="space-y-2 text-sm">
                  <div><strong>Created:</strong> {{ formatDate(selectedContract.created_at) }}</div>
                  <div><strong>Last Updated:</strong> {{ formatDate(selectedContract.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button @click="showViewModal = false" class="btn btn-outline">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Contract</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the contract for <strong>{{ selectedContract?.service_address }}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                @click="confirmDeleteContract"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
// Add this import to the existing script setup section
import { useRoute } from 'vue-router'

// Store
const authStore = useAuthStore()

// Add this after your existing reactive data declarations
const route = useRoute()

// Reactive data
const loading = ref(false)
const error = ref('')
const contracts = ref([])
const availableCustomers = ref([])
const availableServiceTiers = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const selectedContract = ref(null)

// Form states
const createLoading = ref(false)
const createError = ref('')
const editLoading = ref(false)
const editError = ref('')
const deleteLoading = ref(false)

// Form data
const createForm = ref({
  service_address: '',
  start_date: '',
  end_date: '',
  notification_email: '',
  notification_phone: '',
  customer_id: '',
  service_tier_id: ''
})

const editForm = ref({
  service_address: '',
  start_date: '',
  end_date: '',
  notification_email: '',
  notification_phone: '',
  customer_id: '',
  service_tier_id: ''
})

// Permission checks using your existing hasPermission method
const canCreateContracts = computed(() => {
  return authStore.hasPermission('contracts', 'create')
})

const canUpdateContracts = computed(() => {
  return authStore.hasPermission('contracts', 'update')
})

const canDeleteContracts = computed(() => {
  return authStore.hasPermission('contracts', 'delete')
})

// Date formatting helpers - FIX FOR THE MAIN ISSUE
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}

const formatDateForAPI = (dateString) => {
  if (!dateString) return null
  return dateString // HTML date input already gives us YYYY-MM-DD
}

// Computed properties
const filteredContracts = computed(() => {
  let filtered = contracts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(contract =>
      contract.service_address.toLowerCase().includes(query) ||
      contract.notification_email?.toLowerCase().includes(query) ||
      (contract.current_service_tier?.name || contract.CurrentServiceTier?.Name || '').toLowerCase().includes(query) ||
      (contract.customers || []).some(customer =>
        (customer.name_on_contract || customer.NameOnContract || '').toLowerCase().includes(query)
      )
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(contract => {
      const status = getContractStatus(contract.start_date, contract.end_date)
      return status.status === statusFilter.value
    })
  }

  return filtered
})

const activeContracts = computed(() => {
  return contracts.value.filter(contract => {
    const status = getContractStatus(contract.start_date, contract.end_date)
    return status.status === 'active'
  }).length
})

const expiringSoonContracts = computed(() => {
  return contracts.value.filter(contract => {
    const daysLeft = getDaysUntilExpiry(contract.end_date)
    const status = getContractStatus(contract.start_date, contract.end_date)
    return status.status === 'active' && daysLeft <= 30 && daysLeft > 0
  }).length
})

const expiredContracts = computed(() => {
  return contracts.value.filter(contract => {
    const status = getContractStatus(contract.start_date, contract.end_date)
    return status.status === 'expired'
  }).length
})

const isCreateFormValid = computed(() => {
  return createForm.value.service_address.trim() !== '' &&
         createForm.value.start_date !== '' &&
         createForm.value.end_date !== '' &&
         createForm.value.customer_id !== '' &&
         createForm.value.service_tier_id !== ''
})

const isEditFormValid = computed(() => {
  return editForm.value.service_address.trim() !== '' &&
         editForm.value.start_date !== '' &&
         editForm.value.end_date !== '' &&
         editForm.value.customer_id !== '' &&
         editForm.value.service_tier_id !== ''
})

// Methods
const loadContracts = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/contracts')
    contracts.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load contracts'
    console.error('Failed to load contracts:', err)
  } finally {
    loading.value = false
  }
}

const loadCustomers = async () => {
  try {
    const response = await api.get('/customers')
    availableCustomers.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load customers:', err)
    availableCustomers.value = []
  }
}

const loadServiceTiers = async () => {
  try {
    const response = await api.get('/service-tiers')
    availableServiceTiers.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load service tiers:', err)
    availableServiceTiers.value = []
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    service_address: '',
    start_date: '',
    end_date: '',
    notification_email: '',
    notification_phone: '',
    customer_id: '',
    service_tier_id: ''
  }
  createError.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedContract.value = null
  editError.value = ''
}

// FIXED: Create contract with proper date handling
const handleCreateContract = async () => {
  createLoading.value = true
  createError.value = ''

  try {
    // Validate dates on frontend first
    const startDate = new Date(createForm.value.start_date)
    const endDate = new Date(createForm.value.end_date)
    
    if (endDate <= startDate) {
      createError.value = 'End date must be after start date'
      return
    }

    const contractData = {
      service_address: createForm.value.service_address.trim(),
      start_date: formatDateForAPI(createForm.value.start_date),
      end_date: formatDateForAPI(createForm.value.end_date),
      notification_email: createForm.value.notification_email.trim() || null,
      notification_phone: createForm.value.notification_phone.trim() || null,
      customer_id: parseInt(createForm.value.customer_id, 10),
      service_tier_id: parseInt(createForm.value.service_tier_id, 10)
    }

    console.log('📤 Creating contract with data:', contractData)
    const response = await api.post('/contracts', contractData)
    console.log('✅ Contract created successfully:', response.data)
    
    await loadContracts()
    closeCreateModal()
  } catch (err) {
    console.error('❌ Contract creation failed:', err)
    console.error('📋 Error response:', err.response?.data)
    
    // Better error message extraction
    let errorMessage = 'Failed to create contract'
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err.message) {
      errorMessage = err.message
    }
    
    createError.value = errorMessage
  } finally {
    createLoading.value = false
  }
}

const viewContract = (contract) => {
  selectedContract.value = { ...contract }
  showViewModal.value = true
}

// FIXED: Edit contract with proper date formatting
const editContract = (contract) => {
  selectedContract.value = { ...contract }
  editForm.value = {
    service_address: contract.service_address,
    start_date: formatDateForInput(contract.start_date),  // Fix date format
    end_date: formatDateForInput(contract.end_date),      // Fix date format
    notification_email: contract.notification_email || '',
    notification_phone: contract.notification_phone || '',
    customer_id: contract.customers?.[0]?.customer_id || '',
    service_tier_id: contract.current_service_tier?.service_tier_id || 
                    contract.CurrentServiceTier?.service_tier_id || ''
  }
  editError.value = ''
  showEditModal.value = true
}

// FIXED: Update contract with proper date handling
const handleUpdateContract = async () => {
  editLoading.value = true
  editError.value = ''

  try {
    // Validate dates on frontend first
    const startDate = new Date(editForm.value.start_date)
    const endDate = new Date(editForm.value.end_date)
    
    if (endDate <= startDate) {
      editError.value = 'End date must be after start date'
      return
    }

    const updateData = {
      service_address: editForm.value.service_address.trim(),
      start_date: formatDateForAPI(editForm.value.start_date),
      end_date: formatDateForAPI(editForm.value.end_date),
      notification_email: editForm.value.notification_email.trim() || null,
      notification_phone: editForm.value.notification_phone.trim() || null,
      customer_id: parseInt(editForm.value.customer_id, 10),
      service_tier_id: parseInt(editForm.value.service_tier_id, 10)
    }

    console.log('📤 Updating contract with data:', updateData)
    const response = await api.put(`/contracts/${selectedContract.value.contract_id}`, updateData)
    console.log('✅ Contract updated successfully:', response.data)
    
    await loadContracts()
    closeEditModal()
  } catch (err) {
    console.error('❌ Contract update failed:', err)
    console.error('📋 Error response:', err.response?.data)
    
    // Better error message extraction
    let errorMessage = 'Failed to update contract'
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err.message) {
      errorMessage = err.message
    }
    
    editError.value = errorMessage
  } finally {
    editLoading.value = false
  }
}

const deleteContract = (contract) => {
  selectedContract.value = { ...contract }
  showDeleteModal.value = true
}

const confirmDeleteContract = async () => {
  deleteLoading.value = true

  try {
    await api.delete(`/contracts/${selectedContract.value.contract_id}`)
    await loadContracts()
    showDeleteModal.value = false
    selectedContract.value = null
  } catch (err) {
    alert('Failed to delete contract: ' + (err.response?.data?.message || err.message))
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
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

const formatCustomerNames = (customers) => {
  if (!customers || customers.length === 0) {
    return 'No customer assigned'
  }

  if (customers.length === 1) {
    return customers[0].name_on_contract || customers[0].NameOnContract
  }

  return `${customers[0].name_on_contract || customers[0].NameOnContract} +${customers.length - 1} more`
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

const getContractDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.round(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''}`
  }
}

const getDaysUntilExpiry = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Update your onMounted function to include the view parameter check
onMounted(async () => {
  console.log('ContractsView mounted')

  // Debug logging
  console.log('📝 Raw user object:', JSON.stringify(authStore.user, null, 2))

  // Test each permission individually
  const permissionsToTest = [
    ['customers', 'read'],
    ['contracts', 'read'],
    ['service_tiers', 'read'],
    ['users', 'read'],
    ['api_keys', 'read']
  ]

  console.log('🔍 Individual permission tests:')
  permissionsToTest.forEach(([resource, action]) => {
    const hasPermission = authStore.hasPermission(resource, action)
    console.log(`  ${resource}:${action} = ${hasPermission}`)
  })

  // Load data in parallel but don't fail if one fails
  await Promise.allSettled([
    loadContracts(),
    loadCustomers(),
    loadServiceTiers()
  ])

  // 🆕 ADD THIS: Check if there's a view parameter
  const viewId = route.query.view
  if (viewId) {
    // Find the contract and open the view modal
    const contract = contracts.value.find(c => c.contract_id === parseInt(viewId))
    if (contract) {
      viewContract(contract) // Your existing view function
    }
  }
})
</script>
