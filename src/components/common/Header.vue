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
        <div class="relative">
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
            @click="showUserMenu = false"
          >
            <div class="py-1">
              <div class="px-4 py-2 text-sm text-gray-700 border-b">
                <div class="font-medium">{{ user?.username }}</div>
                <div class="text-xs text-gray-500">{{ user?.role?.name }}</div>
              </div>
              <button
                @click="logout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const user = computed(() => authStore.user)

const pageTitle = computed(() => {
  return route.meta.title || route.name || 'Dashboard'
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
