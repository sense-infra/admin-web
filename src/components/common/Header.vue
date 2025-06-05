<template>
  <header class="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0">
    <div class="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center">
        <button
          @click="$emit('toggle-sidebar')"
          type="button"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="ml-4 lg:ml-0">
          <h1 class="text-xl font-semibold text-gray-900">
            {{ pageTitle }}
          </h1>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button
          type="button"
          class="p-2 rounded-full text-gray-400 hover:text-gray-500"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5V9.5a3.5 3.5 0 10-7 0V12l-5 5h5a3 3 0 006 0z" />
          </svg>
        </button>
        <!-- User menu -->
        <div class="relative" ref="userMenuRef">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center p-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div class="py-1">
              <div class="px-4 py-2 text-sm text-gray-700 border-b">
                <div class="font-medium">{{ user?.username }}</div>
                <div class="text-xs text-gray-500">{{ user?.role?.name }}</div>
              </div>
              
              <!-- Change Password Option -->
              <button
                @click="openChangePasswordModal"
                class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 0 21 9z" />
                </svg>
                Change Password
              </button>
              
              <!-- Sign Out -->
              <button
                @click="logout"
                class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <ChangePasswordModal
      v-if="showChangePasswordModal"
      @close="closeChangePasswordModal"
      @updated="handlePasswordUpdated"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ChangePasswordModal from '@/components/admin/users/ChangePasswordModal.vue'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showChangePasswordModal = ref(false)
const userMenuRef = ref(null)

const user = computed(() => authStore.user)

const pageTitle = computed(() => {
  return route.meta.title || route.name || 'Dashboard'
})

const openChangePasswordModal = () => {
  showUserMenu.value = false
  showChangePasswordModal.value = true
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
}

const handlePasswordUpdated = () => {
  closeChangePasswordModal()
  // Optionally show a success message
}

const logout = async () => {
  showUserMenu.value = false
  await authStore.logout()
  router.push('/login')
}

// Click outside to close menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
