<template>
  <div class="flex items-center gap-2">
    <!-- View Button -->
    <button
      @click.stop="handleView"
      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
      title="View API Key Details"
    >
      <ActionIcon name="view" size="sm" />
    </button>

    <!-- Usage Button -->
    <button
      @click.stop="handleUsage"
      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
      title="View Usage Statistics"
    >
      <ActionIcon name="chart-bar" size="sm" />
    </button>

    <!-- Edit Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="handleEdit"
      class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
      title="Edit API Key"
    >
      <ActionIcon name="edit" size="sm" />
    </button>

    <!-- Deactivate/Activate Button - MATCHING USER PATTERN EXACTLY -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="handleToggle"
      :class="apiKey.active
        ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100'
        : 'text-green-600 hover:text-green-900 hover:bg-green-100'"
      class="p-1 rounded"
      :title="apiKey.active ? 'Deactivate API Key' : 'Activate API Key'"
    >
      <ActionIcon :name="apiKey.active ? 'deactivate' : 'activate'" size="sm" />
    </button>

    <!-- Delete Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="handleDelete"
      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
      title="Delete API Key"
    >
      <ActionIcon name="delete" size="sm" />
    </button>

    <!-- System Key Protection Notice - MATCHING USER PATTERN -->
    <div v-if="isProtected" class="ml-2">
      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <ActionIcon name="lock" size="xs" class="mr-1" />
        Protected
      </span>
    </div>
  </div>
</template>

<script setup>
import ActionIcon from '@/components/icons/ActionIcons.vue'
import { computed } from 'vue'

const props = defineProps({
  apiKey: {
    type: Object,
    required: true
  },
  canManage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'usage', 'edit', 'toggle', 'delete'])

// Check if this is a system/protected API key - MATCHING USER PATTERN
const isProtected = computed(() => {
  return props.apiKey.key_name?.toLowerCase().includes('system') ||
         props.apiKey.is_system ||
         props.apiKey.api_key_id === 1 // Example: protect the first API key
})

const handleView = () => {
  console.log('APIKeyActionButtons: View clicked for API key:', props.apiKey.api_key_id)
  emit('view', props.apiKey)
}

const handleUsage = () => {
  console.log('APIKeyActionButtons: Usage clicked for API key:', props.apiKey.api_key_id)
  emit('usage', props.apiKey)
}

const handleEdit = () => {
  console.log('APIKeyActionButtons: Edit clicked for API key:', props.apiKey.api_key_id)
  emit('edit', props.apiKey)
}

const handleToggle = () => {
  console.log('APIKeyActionButtons: Toggle clicked for API key:', props.apiKey.api_key_id)
  emit('toggle', props.apiKey)
}

const handleDelete = () => {
  console.log('APIKeyActionButtons: Delete clicked for API key:', props.apiKey.api_key_id)
  emit('delete', props.apiKey)
}
</script>
