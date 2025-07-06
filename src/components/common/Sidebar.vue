<template>
  <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
    <div class="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
      <div class="flex items-center flex-shrink-0 px-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 class="ml-3 text-xl font-bold text-white">Sense Security</h1>
        </div>
      </div>

      <nav class="mt-8 flex-1 flex flex-col divide-y divide-gray-700 overflow-y-auto" aria-label="Sidebar">
        <div class="px-2 space-y-1">
          <!-- Dashboard -->
          <router-link
            to="/"
            :class="getLinkClass('Dashboard')"
          >
            <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0"></path>
            </svg>
            Dashboard
          </router-link>

          <!-- Administration Section -->
          <div v-if="canAccessAdmin" class="pt-6">
            <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </h3>
            <div class="mt-2 space-y-1">
              <!-- User Management -->
              <router-link
                v-if="canManageUsers"
                to="/admin/users"
                :class="getLinkClass('UserManagement')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                User Management
              </router-link>

              <!-- Role Management -->
              <router-link
                v-if="canManageRoles"
                to="/admin/roles"
                :class="getLinkClass('AdminRoles')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Role Management
              </router-link>

              <!-- API Key Management -->
              <router-link
                v-if="canManageAPIKeys"
                to="/admin/api-keys"
                :class="getLinkClass('APIKeys')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1021 9z"></path>
                </svg>
                API Keys
              </router-link>

              <!-- Rate Limits -->
              <router-link
                v-if="canManageAPIKeys"
                to="/admin/rate-limits"
                :class="getLinkClass('RateLimits')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Rate Limits
              </router-link>
            </div>
          </div>

          <!-- Business Management Section -->
          <div v-if="canAccessBusiness" class="pt-6">
            <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Management
            </h3>
            <div class="mt-2 space-y-1">
              <!-- Customer Management -->
              <router-link
                v-if="canManageCustomers"
                to="/customers"
                :class="getLinkClass('Customers')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Customers
              </router-link>

              <!-- Contract Management -->
              <router-link
                v-if="canManageContracts"
                to="/contracts"
                :class="getLinkClass('Contracts')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Contracts
              </router-link>

              <!-- Service Tiers -->
              <router-link
                v-if="canManageServiceTiers"
                to="/service-tiers"
                :class="getLinkClass('ServiceTiers')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Service Tiers
              </router-link>
            </div>
          </div>

          <!-- Hardware Management Section -->
          <div v-if="canAccessHardware" class="pt-6">
            <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hardware
            </h3>
            <div class="mt-2 space-y-1">
              <router-link
                to="/hardware/overview"
                :class="getLinkClass('HardwareOverview')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Hardware Overview
              </router-link>
            </div>
          </div>

          <!-- Monitoring Section -->
          <div v-if="canAccessMonitoring" class="pt-6">
            <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Monitoring
            </h3>
            <div class="mt-2 space-y-1">
              <router-link
                to="/monitoring/system"
                :class="getLinkClass('SystemMonitoring')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                System Status
              </router-link>

              <!-- Diagnostics (Admin only) -->
              <router-link
                v-if="isAdmin"
                to="/diagnostics"
                :class="getLinkClass('Diagnostics')"
              >
                <svg class="mr-3 flex-shrink-0 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                </svg>
                Diagnostics
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Permission checks
const isAdmin = computed(() => authStore.user?.role?.name === 'admin')

const canManageUsers = computed(() =>
  authStore.hasPermission('users', 'read') || isAdmin.value
)

const canManageRoles = computed(() =>
  authStore.hasPermission('roles', 'read') || isAdmin.value
)

const canManageAPIKeys = computed(() =>
  authStore.hasPermission('api_keys', 'read') || isAdmin.value
)

const canManageCustomers = computed(() =>
  authStore.hasPermission('customers', 'read') || isAdmin.value
)

const canManageContracts = computed(() =>
  authStore.hasPermission('contracts', 'read') || isAdmin.value
)

const canManageServiceTiers = computed(() =>
  authStore.hasPermission('service_tiers', 'read') || isAdmin.value
)

// Section access checks
const canAccessAdmin = computed(() =>
  canManageUsers.value || canManageRoles.value || canManageAPIKeys.value
)

const canAccessBusiness = computed(() =>
  canManageCustomers.value || canManageContracts.value || canManageServiceTiers.value
)

const canAccessHardware = computed(() =>
  authStore.hasPermission('controllers', 'read') ||
  authStore.hasPermission('cameras', 'read') ||
  isAdmin.value
)

const canAccessMonitoring = computed(() =>
  authStore.hasPermission('events', 'read') ||
  authStore.hasPermission('logs', 'read') ||
  isAdmin.value
)

// Helper function to get link classes
const getLinkClass = (routeName) => {
  const baseClasses = 'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
  const activeClasses = 'bg-gray-900 text-white'
  const inactiveClasses = 'text-gray-300 hover:bg-gray-700 hover:text-white'

  return route.name === routeName
    ? `${baseClasses} ${activeClasses}`
    : `${baseClasses} ${inactiveClasses}`
}
</script>
