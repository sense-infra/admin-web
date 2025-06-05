<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">API Key Management</h1>
        <p class="text-gray-600">Manage API keys for external system access</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Create API Key
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Keys</dt>
              <dd class="text-lg font-medium text-gray-900">{{ apiKeyStats.total }}</dd>
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
              <dt class="text-sm font-medium text-gray-500 truncate">Active Keys</dt>
              <dd class="text-lg font-medium text-gray-900">{{ apiKeyStats.active }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
              <dd class="text-lg font-medium text-gray-900">{{ apiKeyStats.expiring }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Requests (30d)</dt>
              <dd class="text-lg font-medium text-gray-900">{{ apiKeyStats.totalRequests }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- API Keys Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">API Keys</h2>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading API keys...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600">
        <p>{{ error }}</p>
        <button @click="loadAPIKeys" class="mt-2 text-blue-600 hover:text-blue-800">
          Try Again
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prefix
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate Limit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Used
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="apiKey in apiKeys" :key="apiKey.api_key_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ apiKey.key_name }}</div>
                  <div class="text-sm text-gray-500">{{ apiKey.description }}</div>
                  <div class="text-xs text-gray-400">by {{ apiKey.creator?.username || 'Unknown' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ apiKey.key_prefix }}...</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(apiKey)">
                  {{ getAPIKeyStatus(apiKey) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ formatNumber(apiKey.usage_count || 0) }} requests</div>
                <div class="text-xs text-gray-400">Total usage</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatNumber(apiKey.rate_limit_per_hour || 0) }}/hour
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(apiKey.last_used) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(apiKey.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewUsage(apiKey)"
                    class="text-green-600 hover:text-green-900"
                    title="View Usage"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </button>
                  <button
                    @click="editAPIKey(apiKey)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Edit API Key"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="toggleAPIKeyStatus(apiKey)"
                    :class="apiKey.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    :title="apiKey.active ? 'Deactivate API Key' : 'Activate API Key'"
                  >
                    <svg v-if="apiKey.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <button
                    @click="deleteAPIKey(apiKey)"
                    class="text-red-600 hover:text-red-900"
                    title="Delete API Key"
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

        <div v-if="apiKeys.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          <p class="mt-2">No API keys found</p>
          <p class="text-sm text-gray-400">Click "Create API Key" to create your first API key</p>
        </div>
      </div>
    </div>

    <!-- Simple Create API Key Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form @submit.prevent="handleCreateAPIKey">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Create API Key</h3>
            <button
              type="button"
              @click="showCreateModal = false"
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
              <label for="keyName" class="block text-sm font-medium text-gray-700 mb-1">
                API Key Name *
              </label>
              <input
                id="keyName"
                v-model="createForm.key_name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Production API Key"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                v-model="createForm.description"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description..."
              ></textarea>
            </div>

            <div>
              <label for="rateLimit" class="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit (requests per hour)
              </label>
              <input
                id="rateLimit"
                v-model.number="createForm.rate_limit_per_hour"
                type="number"
                min="1"
                max="10000"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="createLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {{ createLoading ? 'Creating...' : 'Create API Key' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit API Key Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form @submit.prevent="handleUpdateAPIKey">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit API Key</h3>
            <button
              type="button"
              @click="showEditModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label for="editKeyName" class="block text-sm font-medium text-gray-700 mb-1">
                API Key Name *
              </label>
              <input
                id="editKeyName"
                v-model="editForm.key_name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="editDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="editDescription"
                v-model="editForm.description"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <label for="editRateLimit" class="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit (requests per hour)
              </label>
              <input
                id="editRateLimit"
                v-model.number="editForm.rate_limit_per_hour"
                type="number"
                min="1"
                max="10000"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="editForm.active"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="editLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {{ editLoading ? 'Updating...' : 'Update API Key' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Usage Modal -->
    <div v-if="showUsageModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">API Key Usage</h3>
          <button
            type="button"
            @click="showUsageModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="usageData">
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900">{{ selectedAPIKey?.key_name }}</h4>
              <p class="text-sm text-gray-500">{{ selectedAPIKey?.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ formatNumber(usageData.total_usage || 0) }}</div>
                <div class="text-sm text-gray-500">Total Requests</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-900">{{ formatDate(usageData.last_used) }}</div>
                <div class="text-sm text-gray-500">Last Used</div>
              </div>
            </div>

            <div v-if="usageData.daily_usage && usageData.daily_usage.length > 0">
              <h5 class="font-medium text-gray-900 mb-2">Recent Usage (Last 30 Days)</h5>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div 
                  v-for="day in usageData.daily_usage" 
                  :key="day.date"
                  class="flex justify-between text-sm"
                >
                  <span>{{ formatDate(day.date) }}</span>
                  <span class="font-medium">{{ day.request_count }} requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-4 text-center text-gray-500">
          Loading usage data...
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="showUsageModal = false"
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
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2">Delete API Key</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete the API key <strong>{{ selectedAPIKey?.key_name }}</strong>? 
              This action cannot be undone and will immediately invalidate the key.
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

    <!-- New API Key Display Modal -->
    <div v-if="newAPIKeyData" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-2 text-center">API Key Created</h3>
          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-4">
              Your API key has been created successfully. <strong>Please copy and save this key now</strong> - you won't be able to see it again.
            </p>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <div class="flex items-center gap-2">
                <input
                  :value="newAPIKeyData.plain_key"
                  readonly
                  class="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                />
                <button
                  @click="copyAPIKey"
                  class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {{ apiKeyCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>

            <div class="mt-4 text-sm text-gray-600">
              <p><strong>Key Name:</strong> {{ newAPIKeyData.api_key.key_name }}</p>
              <p><strong>Rate Limit:</strong> {{ newAPIKeyData.api_key.rate_limit_per_hour }} requests/hour</p>
              <p v-if="newAPIKeyData.api_key.expires_at">
                <strong>Expires:</strong> {{ formatDate(newAPIKeyData.api_key.expires_at) }}
              </p>
            </div>
          </div>
          
          <div class="flex justify-center mt-6">
            <button
              @click="closeNewAPIKeyModal"
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { adminService } from '@/services/admin'

// Reactive data
const loading = ref(false)
const error = ref('')
const apiKeys = ref([])

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showUsageModal = ref(false)
const showDeleteModal = ref(false)
const selectedAPIKey = ref(null)
const deleteLoading = ref(false)
const newAPIKeyData = ref(null)
const apiKeyCopied = ref(false)
const usageData = ref(null)

// Form states
const createLoading = ref(false)
const createError = ref('')
const editLoading = ref(false)

const createForm = ref({
  key_name: '',
  description: '',
  rate_limit_per_hour: 1000
})

const editForm = ref({
  key_name: '',
  description: '',
  rate_limit_per_hour: 1000,
  active: true
})

// Computed properties
const apiKeyStats = computed(() => {
  const total = apiKeys.value.length
  const active = apiKeys.value.filter(key => key.active && !isExpired(key)).length
  const expiring = apiKeys.value.filter(key => isExpiringSoon(key)).length
  const totalRequests = apiKeys.value.reduce((sum, key) => sum + (key.usage_count || 0), 0)
  
  return { total, active, expiring, totalRequests }
})

// Methods
const loadAPIKeys = async () => {
  loading.value = true
  error.value = ''
  
  try {
    apiKeys.value = await adminService.apiKeys.getAll()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleCreateAPIKey = async () => {
  createLoading.value = true
  createError.value = ''
  
  try {
    const response = await adminService.apiKeys.create(createForm.value)
    newAPIKeyData.value = response
    await loadAPIKeys()
    showCreateModal.value = false
    createForm.value = {
      key_name: '',
      description: '',
      rate_limit_per_hour: 1000
    }
  } catch (err) {
    createError.value = err.message
  } finally {
    createLoading.value = false
  }
}

const editAPIKey = (apiKey) => {
  selectedAPIKey.value = { ...apiKey }
  editForm.value = {
    key_name: apiKey.key_name,
    description: apiKey.description || '',
    rate_limit_per_hour: apiKey.rate_limit_per_hour,
    active: apiKey.active
  }
  showEditModal.value = true
}

const handleUpdateAPIKey = async () => {
  editLoading.value = true
  
  try {
    await adminService.apiKeys.update(selectedAPIKey.value.api_key_id, editForm.value)
    await loadAPIKeys()
    showEditModal.value = false
    selectedAPIKey.value = null
  } catch (err) {
    alert('Failed to update API key: ' + err.message)
  } finally {
    editLoading.value = false
  }
}

const viewUsage = async (apiKey) => {
  selectedAPIKey.value = apiKey
  showUsageModal.value = true
  usageData.value = null
  
  try {
    usageData.value = await adminService.apiKeys.getUsage(apiKey.api_key_id)
  } catch (err) {
    console.error('Failed to load usage data:', err)
  }
}

const toggleAPIKeyStatus = async (apiKey) => {
  try {
    await adminService.apiKeys.update(apiKey.api_key_id, { active: !apiKey.active })
    await loadAPIKeys()
  } catch (err) {
    alert('Failed to update API key status: ' + err.message)
  }
}

const deleteAPIKey = (apiKey) => {
  selectedAPIKey.value = apiKey
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true
  
  try {
    await adminService.apiKeys.delete(selectedAPIKey.value.api_key_id)
    await loadAPIKeys()
    showDeleteModal.value = false
    selectedAPIKey.value = null
  } catch (err) {
    alert('Failed to delete API key: ' + err.message)
  } finally {
    deleteLoading.value = false
  }
}

const copyAPIKey = async () => {
  try {
    await navigator.clipboard.writeText(newAPIKeyData.value.plain_key)
    apiKeyCopied.value = true
    setTimeout(() => {
      apiKeyCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy API key:', err)
  }
}

const closeNewAPIKeyModal = () => {
  newAPIKeyData.value = null
  apiKeyCopied.value = false
}

// Helper functions
const getAPIKeyStatus = (apiKey) => {
  if (isExpired(apiKey)) return 'Expired'
  if (!apiKey.active) return 'Inactive'
  if (isExpiringSoon(apiKey)) return 'Expiring Soon'
  return 'Active'
}

const isExpired = (apiKey) => {
  return apiKey.expires_at && new Date(apiKey.expires_at) < new Date()
}

const isExpiringSoon = (apiKey) => {
  if (!apiKey.expires_at) return false
  const expiryDate = new Date(apiKey.expires_at)
  const now = new Date()
  const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30
}

const getStatusColor = (apiKey) => {
  const status = getAPIKeyStatus(apiKey)
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-gray-100 text-gray-800'
    case 'Expired':
      return 'bg-red-100 text-red-800'
    case 'Expiring Soon':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num?.toString() || '0'
}

// Lifecycle
onMounted(() => {
  loadAPIKeys()
})
</script>
