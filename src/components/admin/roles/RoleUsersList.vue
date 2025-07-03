<template>
  <div class="bg-white border border-gray-200 rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Role User Management</h3>
          <p class="mt-1 text-sm text-gray-600">
            View and manage users assigned to different roles
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <select
            v-model="selectedRole"
            @change="loadRoleUsers"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All roles</option>
            <option v-for="role in rolesWithCurrentCounts" :key="role.role_id" :value="role.role_id">
              {{ role.name }} ({{ role.user_count || 0 }} users)
            </option>
          </select>
          <button
            @click="refreshData"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2">Loading users...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="font-medium text-red-800">Error loading users</p>
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- User Statistics -->
      <div v-else-if="!selectedRole" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-600">Total Users</p>
              <p class="text-2xl font-bold text-blue-900">{{ userStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-green-600">Active Users</p>
              <p class="text-2xl font-bold text-green-900">{{ userStats.active }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-600">Inactive Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.inactive }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-purple-600">Recent Logins</p>
              <p class="text-2xl font-bold text-purple-900">{{ recentLoginCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-specific Statistics -->
      <div v-else-if="selectedRole && roleStats" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-600">Total Users</p>
              <p class="text-2xl font-bold text-blue-900">{{ roleStats.total_user_count || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-green-600">Active Users</p>
              <p class="text-2xl font-bold text-green-900">{{ roleStats.active_user_count || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-600">Inactive Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ roleStats.inactive_user_count || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-purple-600">Recent Logins</p>
              <p class="text-2xl font-bold text-purple-900">{{ recentLoginCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedUsers.length > 0" class="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm font-medium text-blue-900">
              {{ selectedUsers.length }} user(s) selected
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <select
              v-model="bulkActionRole"
              :disabled="!canEditUsers"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select new role</option>
              <option v-for="role in availableRoles" :key="role.role_id" :value="role.role_id">
                {{ role.name }}
              </option>
            </select>
            <button
              @click="performBulkRoleChange"
              :disabled="!bulkActionRole || bulkActionLoading || !canEditUsers"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ bulkActionLoading ? 'Updating...' : 'Change Role' }}
            </button>
            <button
              @click="clearSelection"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="users.length > 0" class="overflow-hidden border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allUsersSelected"
                  @change="toggleAllUsers"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in paginatedUsers"
              :key="user.user_id"
              :class="[
                user.active ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75',
                selectedUsers.includes(user.user_id) ? 'bg-blue-50' : ''
              ]"
              class="transition-colors duration-150"
            >
              <!-- Checkbox -->
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="selectedUsers.includes(user.user_id)"
                  @change="toggleUserSelection(user.user_id)"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </td>

              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                      <span class="text-white font-medium text-sm">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                    <div v-if="user.first_name || user.last_name" class="text-xs text-gray-400">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span :class="getRoleBadgeClass(user.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ user.role?.name || 'No Role' }}
                  </span>
                  <!-- Show "Inactive Role" badge if role exists and is explicitly false -->
                  <span v-if="user.role && user.role.active === false" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Inactive Role
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <svg :class="user.active ? 'text-green-400' : 'text-gray-400'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  {{ user.active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ formatDate(user.last_login) }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <!-- Edit Button - only if user has edit permissions and it's not the current user -->
                  <button
                    v-if="canEditUsers && !isCurrentUser(user)"
                    @click="editUser(user)"
                    class="text-purple-600 hover:text-purple-900 p-1 rounded"
                    title="Edit user"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>

                  <!-- Change Role Button - only if user has edit permissions and it's not the current user -->
                  <button
                    v-if="canEditUsers && !isCurrentUser(user)"
                    @click="changeUserRole(user)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="Change role"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </button>

                  <!-- Activate/Deactivate Button - only if user has edit permissions and it's not the current user -->
                  <button
                    v-if="canEditUsers && !isCurrentUser(user)"
                    @click="toggleUserStatus(user)"
                    :class="user.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                    class="p-1 rounded"
                    :title="user.active ? 'Deactivate user' : 'Activate user'"
                  >
                    <svg v-if="user.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>

                  <!-- Current User Indicator - show when viewing self -->
                  <div v-if="isCurrentUser(user)" class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      You
                    </span>
                  </div>

                  <!-- No Permissions Indicator - show when user doesn't have edit permissions -->
                  <div v-if="!canEditUsers" class="flex items-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Only
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <p class="text-sm text-gray-700">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, users.length) }} of {{ users.length }} users
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span class="px-3 py-1 text-sm font-medium text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-2 text-lg font-medium text-gray-900">No Users Found</p>
        <p class="text-sm text-gray-500">
          {{ selectedRole ? 'No users are assigned to this role.' : 'No users found in the system.' }}
        </p>
      </div>
    </div>

    <!-- User Edit Modal -->
    <UserFormModal
      v-if="showUserEditModal"
      :user="userToEdit"
      @close="closeUserEditModal"
      @saved="handleUserSaved"
    />

    <!-- Role Change Modal -->
    <div v-if="showRoleChangeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Change User Role</h3>
          <button @click="closeRoleChangeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="userToChangeRole" class="space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm font-medium text-gray-900">User: {{ userToChangeRole.username }}</p>
            <p class="text-sm text-gray-500">Current Role: {{ userToChangeRole.role?.name || 'No Role' }}</p>
            <p class="text-xs text-gray-400">User ID: {{ userToChangeRole.user_id }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Role</label>
            <select
              v-model="newRoleId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a role</option>
              <option v-for="role in availableRoles" :key="role.role_id" :value="role.role_id.toString()">
                {{ role.name }} - {{ role.description }}
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeRoleChangeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              @click="confirmRoleChange"
              :disabled="!newRoleId || roleChangeLoading || !userToChangeRole?.user_id"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
            >
              {{ roleChangeLoading ? 'Changing...' : 'Change Role' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md"
    >
      <div class="flex items-start">
        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="ml-2 text-red-700 hover:text-red-900 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { rolesService } from '@/services/roles'
import api from '@/services/api'
import UserFormModal from '@/components/admin/users/UserFormModal.vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['user-updated', 'role-changed', 'users-loaded'])

// Auth store for permissions and current user
const authStore = useAuthStore()

// Data
const users = ref([])
const selectedRole = ref('')
const loading = ref(false)
const error = ref('')
const roleStats = ref(null)

// Selection and bulk actions
const selectedUsers = ref([])
const bulkActionRole = ref('')
const bulkActionLoading = ref(false)

// Role change modal
const showRoleChangeModal = ref(false)
const userToChangeRole = ref(null)
const newRoleId = ref('')
const roleChangeLoading = ref(false)

// User edit modal
const showUserEditModal = ref(false)
const userToEdit = ref(null)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Permission checks based on current user's role
const canEditUsers = computed(() => {
  const userPermissions = authStore.user?.role?.permissions?.users || []
  return userPermissions.includes('update')
})

const canDeleteUsers = computed(() => {
  const userPermissions = authStore.user?.role?.permissions?.users || []
  return userPermissions.includes('delete')
})

// Helper functions
const isCurrentUser = (user) => {
  return user.user_id === authStore.user?.user_id
}

// Computed properties
const availableRoles = computed(() => props.roles.filter(role => role.active !== false))

// Calculate current user counts for roles based on loaded users
const rolesWithCurrentCounts = computed(() => {
  if (!users.value.length) return props.roles

  // Count users per role from current users data
  const roleCounts = {}
  users.value.forEach(user => {
    if (user.role && user.role.role_id) {
      const roleId = user.role.role_id
      roleCounts[roleId] = (roleCounts[roleId] || 0) + 1
    }
  })

  // Return roles with updated counts
  return props.roles.map(role => ({
    ...role,
    user_count: roleCounts[role.role_id] || 0
  }))
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(users.value.length / pageSize.value))

const allUsersSelected = computed(() => {
  return paginatedUsers.value.length > 0 &&
         paginatedUsers.value.every(user => selectedUsers.value.includes(user.user_id))
})

const recentLoginCount = computed(() => {
  if (!users.value.length) return 0
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return users.value.filter(user =>
    user.last_login && new Date(user.last_login) > sevenDaysAgo
  ).length
})

// Calculate user statistics from the current users data
const userStats = computed(() => {
  const total = users.value.length
  const active = users.value.filter(user => user.active).length
  const inactive = total - active

  return {
    total,
    active,
    inactive
  }
})

// Watch for user stats changes and emit to parent
watch(userStats, (newStats) => {
  console.log('📊 User stats changed, emitting to parent:', newStats)
  emit('users-loaded', newStats)
}, { immediate: true, deep: true })

// Methods
const fetchRoles = async () => {
  try {
    const roles = await rolesService.getAll()
    console.log('📋 Roles fetched for user list:', roles)
  } catch (err) {
    error.value = 'Failed to load roles'
    console.error('Failed to load roles:', err)
  }
}

const loadRoleUsers = async () => {
  try {
    loading.value = true
    error.value = ''

    if (selectedRole.value) {
      // Load specific role users and stats
      const [usersResponse, statsResponse] = await Promise.all([
        api.get(`/auth/roles/${selectedRole.value}/users`),
        api.get(`/auth/roles/${selectedRole.value}/usage`)
      ])

      console.log('👥 Role users response:', usersResponse.data)
      console.log('📊 Role stats response:', statsResponse.data)

      // For specific role selection, users should all have the same role
      // Find the role data from props.roles (which has correct active status)
      const selectedRoleData = props.roles.find(r => r.role_id == selectedRole.value)
      console.log('🔍 Selected role data from props:', selectedRoleData)

      // Ensure users have proper role data structure
      users.value = (usersResponse.data || []).map(user => {
        console.log('🔍 Processing user for specific role:', user)
        return {
          ...user,
          // Use the selected role data since all users in this query have the same role
          role: selectedRoleData ? {
            role_id: selectedRoleData.role_id,
            name: selectedRoleData.name,
            description: selectedRoleData.description,
            active: selectedRoleData.active !== false // Use props role active status
          } : (user.role ? {
            role_id: user.role.role_id,
            name: user.role.name,
            description: user.role.description,
            active: user.role.active !== false
          } : null)
        }
      })

      roleStats.value = statsResponse.data || null
    } else {
      // Load all users
      const response = await api.get('/auth/users')

      console.log('👥 All users response:', response.data)
      console.log('🔍 Available roles from props:', props.roles)

      // Create a map of roles for quick lookup
      const rolesMap = new Map(props.roles.map(role => [role.role_id, role]))
      console.log('🗺️ Roles map:', rolesMap)

      // Ensure users have proper role data structure
      users.value = (response.data || []).map(user => {
        console.log('🔍 Processing user role data for all users:', user.username, user.role)

        // Handle cases where role might be missing or malformed
        if (!user.role) {
          return { ...user, role: null }
        }

        // Get the correct role data from props (which has correct active status)
        const correctRoleData = rolesMap.get(user.role.role_id)
        console.log('✅ Correct role data from props for', user.role.name, ':', correctRoleData)

        // Use the correct role data from props, fallback to user role data
        return {
          ...user,
          role: correctRoleData ? {
            role_id: correctRoleData.role_id,
            name: correctRoleData.name,
            description: correctRoleData.description || '',
            active: correctRoleData.active !== false // Use the correct active status from props
          } : {
            role_id: user.role.role_id,
            name: user.role.name,
            description: user.role.description || '',
            active: user.role.active !== false
          }
        }
      })

      roleStats.value = null
    }

    console.log('✅ Users loaded with corrected role structure:', users.value.map(u => ({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      active: u.active,
      role_name: u.role?.name,
      role_active: u.role?.active,
      complete_user: u
    })))

    // Update roles with user counts - this is important!
    await updateRoleUserCounts()

    currentPage.value = 1
    selectedUsers.value = []
  } catch (err) {
    error.value = 'Failed to load users'
    console.error('❌ Failed to load users:', err)
  } finally {
    loading.value = false
  }
}

const updateRoleUserCounts = async () => {
  try {
    console.log('🔄 Updating role user counts...')
    
    // Count users per role from the current users data
    const roleCounts = {}
    users.value.forEach(user => {
      if (user.role && user.role.role_id) {
        const roleId = user.role.role_id
        if (!roleCounts[roleId]) {
          roleCounts[roleId] = 0
        }
        roleCounts[roleId]++
      }
    })

    console.log('📊 Role user counts calculated:', roleCounts)

    // Update the roles with new user counts
    const updatedRoles = props.roles.map(role => ({
      ...role,
      user_count: roleCounts[role.role_id] || 0
    }))

    console.log('📊 Updated roles with counts:', updatedRoles.map(r => ({ name: r.name, count: r.user_count })))

    // Emit the updated roles and user counts to parent
    emit('role-changed', { 
      userCounts: roleCounts,
      updatedRoles: updatedRoles
    })
    
  } catch (err) {
    console.error('❌ Failed to update role user counts:', err)
  }
}

const refreshData = async () => {
  await Promise.all([fetchRoles(), loadRoleUsers()])
}

const getUserInitials = (user) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  return user.username.slice(0, 2).toUpperCase()
}

const getRoleBadgeClass = (role) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  if (!role || !role.name) {
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  switch (role.name.toLowerCase()) {
    case 'admin':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'manager':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'operator':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'viewer':
      return `${baseClasses} bg-green-100 text-green-800`
    default:
      return `${baseClasses} bg-purple-100 text-purple-800`
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Never'

    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return date.toLocaleDateString()
  } catch (e) {
    return 'Never'
  }
}

// Selection methods
const toggleUserSelection = (userId) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const toggleAllUsers = () => {
  if (allUsersSelected.value) {
    // Remove all visible users from selection
    paginatedUsers.value.forEach(user => {
      const index = selectedUsers.value.indexOf(user.user_id)
      if (index > -1) {
        selectedUsers.value.splice(index, 1)
      }
    })
  } else {
    // Add all visible users to selection
    paginatedUsers.value.forEach(user => {
      if (!selectedUsers.value.includes(user.user_id)) {
        selectedUsers.value.push(user.user_id)
      }
    })
  }
}

const clearSelection = () => {
  selectedUsers.value = []
  bulkActionRole.value = ''
}

// Bulk actions
const performBulkRoleChange = async () => {
  if (!canEditUsers.value) {
    console.warn('❌ Bulk role change not allowed - insufficient permissions')
    return
  }
  
  if (!bulkActionRole.value || selectedUsers.value.length === 0) return

  // Filter out current user from selection to prevent self-modification
  const usersToUpdate = selectedUsers.value.filter(userId => {
    const user = users.value.find(u => u.user_id === userId)
    return user && !isCurrentUser(user)
  })

  if (usersToUpdate.length === 0) {
    error.value = 'Cannot modify your own role or no valid users selected'
    return
  }

  if (usersToUpdate.length < selectedUsers.value.length) {
    const skippedCount = selectedUsers.value.length - usersToUpdate.length
    if (!confirm(`${skippedCount} user(s) will be skipped (including yourself). Continue with ${usersToUpdate.length} user(s)?`)) {
      return
    }
  }

  try {
    bulkActionLoading.value = true

    const promises = usersToUpdate.map(userId =>
      api.put(`/auth/users/${userId}`, { role_id: parseInt(bulkActionRole.value) })
    )

    await Promise.all(promises)

    console.log('✅ Bulk role change completed')

    // Refresh data
    await loadRoleUsers()
    clearSelection()

    emit('role-changed', { userIds: usersToUpdate, newRoleId: bulkActionRole.value })
  } catch (err) {
    error.value = 'Failed to update user roles'
    console.error('❌ Failed to update user roles:', err)
  } finally {
    bulkActionLoading.value = false
  }
}

// Individual user actions
const editUser = (user) => {
  // Check permissions and prevent self-editing
  if (!canEditUsers.value || isCurrentUser(user)) {
    console.warn('❌ Edit user not allowed - insufficient permissions or trying to edit self')
    return
  }
  
  console.log('✏️ Edit user clicked:', user)
  userToEdit.value = user
  showUserEditModal.value = true
}

const closeUserEditModal = () => {
  showUserEditModal.value = false
  userToEdit.value = null
}

const handleUserSaved = async () => {
  closeUserEditModal()
  await loadRoleUsers()
  emit('user-updated', userToEdit.value)
}

const changeUserRole = (user) => {
  // Check permissions and prevent self-role change
  if (!canEditUsers.value || isCurrentUser(user)) {
    console.warn('❌ Change role not allowed - insufficient permissions or trying to change own role')
    return
  }
  
  console.log('🔄 Change user role clicked for:', user)
  
  // Ensure we have a complete user object
  if (!user || !user.user_id) {
    console.error('❌ Invalid user object:', user)
    error.value = 'Invalid user data'
    return
  }
  
  userToChangeRole.value = { ...user } // Create a copy to avoid mutations
  newRoleId.value = user.role?.role_id?.toString() || ''
  showRoleChangeModal.value = true
}

const closeRoleChangeModal = () => {
  showRoleChangeModal.value = false
  userToChangeRole.value = null
  newRoleId.value = ''
  roleChangeLoading.value = false
}

const confirmRoleChange = async () => {
  if (!newRoleId.value || !userToChangeRole.value || !userToChangeRole.value.user_id) {
    error.value = 'Invalid user or role selection'
    return
  }

  try {
    roleChangeLoading.value = true

    // Store user data before it gets cleared
    const userId = userToChangeRole.value.user_id
    const newRole = newRoleId.value

    console.log('🔄 Changing role for user:', userId, 'to role:', newRole)

    await api.put(`/auth/users/${userId}`, {
      role_id: parseInt(newRole)
    })

    console.log('✅ User role changed successfully')

    // Close modal first
    closeRoleChangeModal()

    // Then refresh data and emit events
    await loadRoleUsers()

    emit('role-changed', {
      userIds: [userId],
      newRoleId: newRole
    })

  } catch (err) {
    error.value = 'Failed to change user role'
    console.error('❌ Failed to change user role:', err)
  } finally {
    roleChangeLoading.value = false
  }
}

const toggleUserStatus = async (user) => {
  // Check permissions and prevent self-deactivation
  if (!canEditUsers.value || isCurrentUser(user)) {
    console.warn('❌ Toggle user status not allowed - insufficient permissions or trying to modify self')
    return
  }
  
  const action = user.active ? 'deactivate' : 'activate'

  if (!confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
    return
  }

  try {
    console.log('🔄 Toggling user status:', user.user_id, action)

    await api.put(`/auth/users/${user.user_id}`, {
      active: !user.active
    })

    console.log('✅ User status toggled successfully')

    // Refresh data
    await loadRoleUsers()

    emit('user-updated', user)
  } catch (err) {
    error.value = `Failed to ${action} user`
    console.error('❌ Failed to toggle user status:', err)
  }
}

// Watch for role selection changes
watch(selectedRole, () => {
  loadRoleUsers()
})

// Initialize
onMounted(() => {
  refreshData()
})
</script>
