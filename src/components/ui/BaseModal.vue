<template>
  <teleport to="body">
    <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container">
        <div :class="modalSizeClass" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <div class="flex-1">
              <slot name="header">
                <h3 class="modal-title">{{ title }}</h3>
              </slot>
            </div>
            <button
              v-if="closable"
              @click="$emit('close')"
              class="modal-close-button"
              :disabled="loading"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Loading State -->
            <div v-if="loading" class="modal-loading">
              <div class="loading-spinner"></div>
              <p class="mt-2 text-sm text-gray-600">{{ loadingText }}</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="modal-error">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-red-700">{{ error }}</span>
              </div>
            </div>
            
            <!-- Content -->
            <div v-else>
              <slot />
            </div>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer || showDefaultActions" class="modal-footer">
            <slot name="footer">
              <div v-if="showDefaultActions" class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="btn btn-outline"
                  :disabled="loading"
                >
                  {{ cancelText }}
                </button>
                <button
                  v-if="confirmText"
                  type="button"
                  @click="$emit('confirm')"
                  :class="confirmButtonClass"
                  :disabled="loading || confirmDisabled"
                >
                  {{ loading ? loadingText : confirmText }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'extra-large'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  error: {
    type: String,
    default: ''
  },
  showDefaultActions: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmText: {
    type: String,
    default: ''
  },
  confirmType: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger', 'success', 'warning'].includes(value)
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const modalSizeClass = computed(() => {
  const sizeClasses = {
    'small': 'modal-content max-w-md',
    'medium': 'modal-content max-w-lg',
    'large': 'modal-content max-w-2xl',
    'extra-large': 'modal-content max-w-4xl'
  }
  return sizeClasses[props.size]
})

const confirmButtonClass = computed(() => {
  const typeClasses = {
    'primary': 'btn btn-primary',
    'danger': 'btn btn-danger',
    'success': 'btn btn-success',
    'warning': 'btn btn-warning'
  }
  return typeClasses[props.confirmType]
})

const handleOverlayClick = () => {
  if (props.closeOnOverlay && props.closable && !props.loading) {
    emit('close')
  }
}

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.open && props.closable && !props.loading) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  // Prevent body scroll when modal is open
  if (props.open) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

// Watch for open changes to handle body scroll
import { watch } from 'vue'
watch(() => props.open, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300;
}

.modal-container {
  @apply fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl w-full mx-auto transform transition-all duration-300;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-close-button {
  @apply text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.modal-body {
  @apply px-6 py-4 max-h-96 overflow-y-auto;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg;
}

.modal-loading {
  @apply text-center py-8;
}

.modal-error {
  @apply bg-red-50 border border-red-200 rounded-md p-4 mb-4;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
