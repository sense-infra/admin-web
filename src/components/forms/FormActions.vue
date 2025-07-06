<template>
  <div :class="containerClass">
    <!-- Cancel Button -->
    <button
      v-if="showCancel"
      type="button"
      @click="$emit('cancel')"
      :disabled="disabled || loading"
      class="btn btn-outline"
    >
      {{ cancelText }}
    </button>

    <!-- Reset Button -->
    <button
      v-if="showReset"
      type="button"
      @click="$emit('reset')"
      :disabled="disabled || loading"
      class="btn btn-secondary"
    >
      {{ resetText }}
    </button>

    <!-- Additional Actions Slot -->
    <slot name="additional-actions" />

    <!-- Submit Button -->
    <button
      v-if="showSubmit"
      :type="submitType"
      @click="handleSubmit"
      :disabled="disabled || loading || submitDisabled"
      :class="submitButtonClass"
    >
      <svg 
        v-if="loading" 
        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ loading ? loadingText : submitText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Button visibility
  showCancel: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: false
  },
  showSubmit: {
    type: Boolean,
    default: true
  },
  
  // Button text
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  resetText: {
    type: String,
    default: 'Reset'
  },
  submitText: {
    type: String,
    default: 'Save'
  },
  loadingText: {
    type: String,
    default: 'Saving...'
  },
  
  // Submit button configuration
  submitType: {
    type: String,
    default: 'submit',
    validator: (value) => ['submit', 'button'].includes(value)
  },
  submitVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
  },
  submitDisabled: {
    type: Boolean,
    default: false
  },
  
  // States
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Layout
  alignment: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'center', 'right', 'between', 'around'].includes(value)
  },
  vertical: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'reset', 'submit'])

const containerClass = computed(() => {
  const classes = ['flex gap-3']
  
  // Direction
  if (props.vertical) {
    classes.push('flex-col')
  } else {
    classes.push('flex-row')
  }
  
  // Alignment
  const alignmentMap = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }
  classes.push(alignmentMap[props.alignment])
  
  // Full width buttons
  if (props.fullWidth) {
    classes.push('[&>button]:flex-1')
  }
  
  return classes.join(' ')
})

const submitButtonClass = computed(() => {
  const variantMap = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    success: 'btn btn-success',
    warning: 'btn btn-warning',
    danger: 'btn btn-danger'
  }
  return variantMap[props.submitVariant]
})

const handleSubmit = (event) => {
  if (props.submitType === 'button') {
    event.preventDefault()
  }
  emit('submit', event)
}
</script>
