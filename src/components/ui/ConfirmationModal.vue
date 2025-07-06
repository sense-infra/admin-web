<template>
  <BaseModal
    :open="open"
    :title="title"
    size="small"
    :loading="loading"
    :closable="!loading"
    @close="$emit('close')"
  >
    <div class="text-center">
      <!-- Icon -->
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" :class="iconBgClass">
        <!-- Danger/Warning Icon -->
        <svg v-if="type === 'danger' || type === 'warning'" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        
        <!-- Info Icon -->
        <svg v-else-if="type === 'info'" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <!-- Success Icon -->
        <svg v-else-if="type === 'success'" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
        {{ title || defaultTitle }}
      </h3>

      <!-- Message -->
      <div class="mt-2">
        <p class="text-sm text-gray-500">
          <slot>
            {{ message || defaultMessage }}
          </slot>
        </p>
      </div>

      <!-- Additional Details -->
      <div v-if="details" class="mt-3 p-3 bg-gray-50 rounded-md">
        <p class="text-xs text-gray-600">{{ details }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-outline"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :class="confirmButtonClass"
          :disabled="loading"
        >
          {{ loading ? loadingText : computedConfirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Processing...'
  },
  entityName: {
    type: String,
    default: 'item'
  },
  entityValue: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'confirm'])

const defaultTitle = computed(() => {
  const typeMap = {
    danger: `Delete ${props.entityName}`,
    warning: `Warning`,
    info: `Confirm Action`,
    success: `Confirm`
  }
  return typeMap[props.type]
})

const defaultMessage = computed(() => {
  const typeMap = {
    danger: `Are you sure you want to delete ${props.entityValue ? `"${props.entityValue}"` : `this ${props.entityName}`}? This action cannot be undone.`,
    warning: `Please confirm this action.`,
    info: `Are you sure you want to proceed?`,
    success: `Are you sure you want to continue?`
  }
  return typeMap[props.type]
})

const confirmButtonClass = computed(() => {
  const typeMap = {
    danger: 'btn btn-danger',
    warning: 'btn btn-warning',
    info: 'btn btn-primary',
    success: 'btn btn-success'
  }
  return typeMap[props.type]
})

const iconBgClass = computed(() => {
  const typeMap = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
    success: 'bg-green-100'
  }
  return typeMap[props.type]
})

const iconClass = computed(() => {
  const typeMap = {
    danger: 'h-6 w-6 text-red-600',
    warning: 'h-6 w-6 text-yellow-600',
    info: 'h-6 w-6 text-blue-600',
    success: 'h-6 w-6 text-green-600'
  }
  return typeMap[props.type]
})

// Default confirm text based on type
const computedConfirmText = computed(() => {
  if (props.confirmText) return props.confirmText
  
  const typeMap = {
    danger: 'Delete',
    warning: 'Proceed',
    info: 'Confirm',
    success: 'Continue'
  }
  return typeMap[props.type]
})
</script>
