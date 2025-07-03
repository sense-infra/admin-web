<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h1 class="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              <svg class="inline-block w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Role Management
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage system roles, permissions, and user assignments
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              @click="async () => await Promise.all([fetchRoles(), fetchUserStats()])"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <button
              v-if="canCreateRoles"
              @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Role
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-6">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5 mr-2 inline-block" />
            {{ tab.name }}
            <span v-if="tab.count !== undefined" class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="error = ''" class="inline-flex text-red-400 hover:text-red-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- Roles Overview Tab -->
        <div v-if="activeTab === 'overview'">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Roles</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ roles.length }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Active Roles</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ activeRolesCount }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ totalUsersCount }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">System Roles</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ systemRolesCount }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Table -->
          <div class="bg-white shadow-xl rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">System Roles</h2>
              <p class="mt-1 text-sm text-gray-600">{{ roles.length }} total roles</p>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Loading State -->
                  <tr v-if="loading">
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">Loading roles...</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State -->
                  <tr v-else-if="roles.length === 0">
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <p class="mt-2 text-lg font-medium text-gray-900">No roles found</p>
                        <p class="text-sm text-gray-500">Get started by creating your first role.</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Role Rows -->
                  <tr v-else v-for="role in roles" :key="role.role_id" class="hover:bg-gray-50 transition-colors duration-150">
                    <!-- Role Info -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 flex items-center">
                            {{ role.name }}
                            <span v-if="isSystemRole(role)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                              </svg>
                              System
                            </span>
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ role.description || 'No description' }}
                            <span v-if="isSystemRole(role)" class="text-blue-600 font-medium"> • Protected role</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Permissions -->
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(actions, resource) in role.permissions"
                          :key="resource"
                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {{ resource }}:{{ actions.join(',') }}
                        </span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusBadgeClass(role.active)">
                        <svg :class="getStatusIconClass(role.active)" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        {{ role.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>

                    <!-- User Count -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        {{ role.user_count || 0 }} users
                      </div>
                    </td>

                    <!-- Created Date -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(role.created_at) }}
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <!-- View Only Button for System Roles -->
                        <button
                          v-if="isSystemRole(role)"
                          @click="viewRole(role)"
                          class="action-btn action-btn-gray"
                          title="View role (read-only)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </button>

                        <!-- Edit Button for Non-System Roles -->
                        <button
                          v-if="canEditRoles && !isSystemRole(role)"
                          @click="editRole(role)"
                          class="action-btn action-btn-purple"
                          title="Edit role"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>

                        <!-- Clone Button - Allow cloning system roles for customization -->
                        <button
                          v-if="canCreateRoles"
                          @click="cloneRole(role)"
                          class="action-btn action-btn-blue"
                          :title="isSystemRole(role) ? 'Clone system role to create custom version' : 'Clone role'"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                        </button>

                        <!-- Activate/Deactivate Button - Only for non-system roles -->
                        <button
                          v-if="canEditRoles && !isSystemRole(role)"
                          @click="toggleRoleStatus(role)"
                          :class="role.active ? 'action-btn action-btn-yellow' : 'action-btn action-btn-green'"
                          :title="role.active ? 'Deactivate role' : 'Activate role'"
                        >
                          <svg v-if="role.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>

                        <!-- Delete Button - Only for non-system roles -->
                        <button
                          v-if="canDeleteRoles && !isSystemRole(role)"
                          @click="showDeleteConfirmation(role)"
                          class="action-btn action-btn-red"
                          title="Delete role"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>

                        <!-- System Role Protection Notice -->
                        <div v-if="isSystemRole(role)" class="ml-2">
                          <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            Protected
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Permissions Matrix Tab -->
        <div v-if="activeTab === 'permissions'">
          <RolePermissionsMatrix
            :roles="roles"
            @role-updated="handleRoleUpdated"
          />
        </div>

        <!-- Users Management Tab -->
        <div v-if="activeTab === 'users'">
          <RoleUsersList
            :roles="roles"
            @user-updated="handleUserUpdated"
            @role-changed="handleRoleChanged"
            @users-loaded="handleUsersLoaded"
          />
        </div>
      </div>
    </div>

    <!-- Role Form Modal -->
    <RoleFormModal
      v-if="showModal"
      :role="selectedRole"
      :is-clone="isCloning"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Role Delete Confirmation Modal -->
    <RoleDeleteConfirmationModal
      v-if="showDeleteModal"
      :role="roleToDelete"
      :available-roles="availableRolesForReassignment"
      @close="closeDeleteModal"
      @deleted="handleRoleDeleted"
      @reassigned="handleUsersReassigned"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { rolesService } from '@/services/roles'
import api from '@/services/api'
import RoleFormModal from '@/components/admin/roles/RoleFormModal.vue'
import RoleDeleteConfirmationModal from '@/components/admin/roles/RoleDeleteConfirmationModal.vue'
import RolePermissionsMatrix from '@/components/admin/roles/RolePermissionsMatrix.vue'
import RoleUsersList from '@/components/admin/roles/RoleUsersList.vue'

const authStore = useAuthStore()
const roles = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const roleToDelete = ref(null)
const isCloning = ref(false)
const activeTab = ref('overview')

// User stats from child component
const allUsersStats = ref({
  total: 0,
  active: 0,
  inactive: 0
})

// Tab configuration
const tabs = computed(() => [
  {
    id: 'overview',
    name: 'Overview',
    icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
    ]),
    count: roles.value.length
  },
  {
    id: 'permissions',
    name: 'Permissions',
    icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ])
  },
  {
    id: 'users',
    name: 'User Management',
    icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ]),
    count: allUsersStats.value.total
  }
])

// Permission checks
const canCreateRoles = computed(() => {
  return authStore.hasPermission('roles', 'create') || authStore.user?.role?.name === 'admin'
})

const canEditRoles = computed(() => {
  return authStore.hasPermission('roles', 'update') || authStore.user?.role?.name === 'admin'
})

const canDeleteRoles = computed(() => {
  return authStore.hasPermission('roles', 'delete') || authStore.user?.role?.name === 'admin'
})

// Statistics
const activeRolesCount = computed(() => {
  return roles.value.filter(role => role.active).length
})

const systemRolesCount = computed(() => {
  return roles.value.filter(role => isSystemRole(role)).length
})

const totalUsersCount = computed(() => {
  return allUsersStats.value.total
})

// Available roles for reassignment (excluding the role being deleted)
const availableRolesForReassignment = computed(() => {
  if (!roleToDelete.value) return roles.value
  return roles.value.filter(role =>
    role.role_id !== roleToDelete.value.role_id &&
    role.active
  )
})

// Helper functions
const isSystemRole = (role) => {
  return ['admin', 'viewer'].includes(role.name)
}

const getStatusBadgeClass = (isActive) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  return isActive
    ? `${baseClasses} bg-green-100 text-green-800`
    : `${baseClasses} bg-gray-100 text-gray-800`
}

const getStatusIconClass = (isActive) => {
  return isActive ? 'w-3 h-3 mr-1 text-green-400' : 'w-3 h-3 mr-1 text-gray-400'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// API functions
const fetchRoles = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('🔍 Fetching roles...')
    const rolesData = await rolesService.getAll()
    
    // Fetch user counts for each role
    console.log('🔍 Fetching user counts for roles...')
    const rolesWithCounts = await Promise.all(
      rolesData.map(async (role) => {
        try {
          const usageResponse = await api.get(`/auth/roles/${role.role_id}/usage`)
          const userCount = usageResponse.data?.total_user_count || 0
          console.log(`📊 Role ${role.name} has ${userCount} users`)
          return {
            ...role,
            user_count: userCount
          }
        } catch (err) {
          console.warn(`⚠️ Failed to get user count for role ${role.name}:`, err)
          return {
            ...role,
            user_count: 0
          }
        }
      })
    )
    
    roles.value = rolesWithCounts
    console.log('✅ Roles fetched successfully with user counts:', roles.value.length)
  } catch (err) {
    console.error('❌ Failed to fetch roles:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to fetch roles'
  } finally {
    loading.value = false
  }
}

const fetchUserStats = async () => {
  try {
    console.log('📊 Fetching user statistics...')
    const response = await api.get('/auth/users')
    const users = response.data || []
    
    const total = users.length
    const active = users.filter(user => user.active).length
    const inactive = total - active
    
    allUsersStats.value = {
      total,
      active,
      inactive
    }
    
    console.log('📊 User stats fetched:', allUsersStats.value)
  } catch (err) {
    console.error('❌ Failed to fetch user statistics:', err)
    // Don't show error to user for stats, just log it
  }
}

const openCreateModal = () => {
  selectedRole.value = null
  isCloning.value = false
  showModal.value = true
}

const editRole = (role) => {
  selectedRole.value = role
  isCloning.value = false
  showModal.value = true
}

const viewRole = (role) => {
  // For system roles, open in read-only mode
  selectedRole.value = { ...role, readonly: true }
  isCloning.value = false
  showModal.value = true
}

const cloneRole = (role) => {
  selectedRole.value = { ...role, name: `${role.name} Copy`, role_id: null }
  isCloning.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRole.value = null
  isCloning.value = false
}

const handleSaved = async () => {
  closeModal()
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
}

const showDeleteConfirmation = (role) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  roleToDelete.value = null
}

const handleRoleDeleted = async () => {
  console.log('🗑️ Role deleted successfully')
  closeDeleteModal()
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
  error.value = null
}

const handleUsersReassigned = async () => {
  console.log('👥 Users reassigned successfully')
  // Role usage info will be refreshed automatically in the modal
  // We might want to refresh the roles list to update user counts
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
}

const toggleRoleStatus = async (role) => {
  const action = role.active ? 'deactivate' : 'activate'

  if (!confirm(`Are you sure you want to ${action} role "${role.name}"?`)) return

  try {
    await rolesService.update(role.role_id, { active: !role.active })
    await Promise.all([
      fetchRoles(),
      fetchUserStats()
    ])
    error.value = null
  } catch (err) {
    console.error(`Failed to ${action} role:`, err)
    error.value = err.response?.data?.message || `Failed to ${action} role`
  }
}

// Event handlers from child components
const handleRoleUpdated = async () => {
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
}

const handleUserUpdated = async (user) => {
  // Refresh roles to update user counts
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
}

const handleRoleChanged = async (data) => {
  console.log('📊 Role changed event received:', data)
  
  // If we received updated roles with user counts, update them
  if (data.updatedRoles) {
    console.log('📊 Updating roles with new user counts')
    roles.value = data.updatedRoles
    // Still fetch fresh user stats
    await fetchUserStats()
  } else {
    // Fallback: refresh both roles and user stats
    await Promise.all([
      fetchRoles(),
      fetchUserStats()
    ])
  }
}

const handleUsersLoaded = (usersData) => {
  console.log('📊 Users data received from child:', usersData)
  
  // Update user statistics
  allUsersStats.value = {
    total: usersData.total || 0,
    active: usersData.active || 0,
    inactive: usersData.inactive || 0
  }
  
  console.log('📊 Updated user stats:', allUsersStats.value)
}

onMounted(async () => {
  // Fetch roles and user statistics in parallel
  await Promise.all([
    fetchRoles(),
    fetchUserStats()
  ])
})
</script>

<style scoped>
.action-btn {
  @apply inline-flex items-center p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150;
}

.action-btn-purple {
  @apply text-purple-600 hover:bg-purple-50 focus:ring-purple-500;
}

.action-btn-blue {
  @apply text-blue-600 hover:bg-blue-50 focus:ring-blue-500;
}

.action-btn-green {
  @apply text-green-600 hover:bg-green-50 focus:ring-green-500;
}

.action-btn-yellow {
  @apply text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500;
}

.action-btn-red {
  @apply text-red-600 hover:bg-red-50 focus:ring-red-500;
}

.action-btn-gray {
  @apply text-gray-600 hover:bg-gray-50 focus:ring-gray-500;
}
</style>
