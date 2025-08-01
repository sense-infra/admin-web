import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('@/components/common/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      // User Management Routes
      {
        path: '/admin',
        name: 'Admin',
        redirect: '/admin/users',
        meta: { title: 'Administration' }
      },
      {
        path: '/admin/users',
        name: 'Users',
        component: () => import('@/views/UsersView.vue'), // Updated from AdminUsersView
        meta: { title: 'User Management' }
      },
      {
        path: '/admin/roles',
        name: 'Roles',
        component: () => import('@/views/RolesView.vue'),
        meta: { title: 'Role Management' }
      },
      {
        path: '/admin/api-keys',
        name: 'APIKeys',
        component: () => import('@/views/APIKeysView.vue'),
        meta: { title: 'API Key Management' }
      },
      {
        path: '/admin/rate-limits',
        name: 'RateLimits',
        component: () => import('@/views/RateLimitsView.vue'),
        meta: { title: 'Rate Limit Management' }
      },
      // Customer Management Routes
      {
        path: '/customers',
        name: 'Customers',
        component: () => import('@/views/CustomersView.vue'),
        meta: { title: 'Customer Management' }
      },
      // Contract Management Routes
      {
        path: '/contracts',
        name: 'Contracts',
        component: () => import('@/views/ContractsView.vue'),
        meta: { title: 'Contract Management' }
      },
      // Service Tier Management Routes
      {
        path: '/service-tiers',
        name: 'ServiceTiers',
        component: () => import('@/views/ServiceTiersView.vue'),
        meta: { title: 'Service Tier Management' }
      },
      // Hardware Management Routes
      {
        path: '/hardware',
        name: 'Hardware',
        redirect: '/hardware/overview',
        meta: { title: 'Hardware Management' }
      },
      {
        path: '/hardware/overview',
        name: 'HardwareOverview',
        component: () => import('@/views/HardwareOverviewView.vue'),
        meta: { title: 'Hardware Overview' }
      },
      // Monitoring Routes
      {
        path: '/monitoring',
        name: 'Monitoring',
        redirect: '/monitoring/system',
        meta: { title: 'System Monitoring' }
      },
      {
        path: '/monitoring/system',
        name: 'SystemMonitoring',
        component: () => import('@/views/SystemMonitoringView.vue'),
        meta: { title: 'System Status' }
      },
      // Diagnostics Route
      {
        path: '/diagnostics',
        name: 'Diagnostics',
        component: () => import('@/views/DiagnosticsView.vue'),
        meta: { title: 'System Diagnostics' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
