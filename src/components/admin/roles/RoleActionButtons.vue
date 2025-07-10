<template>
  <div class="flex items-center gap-2">
    <!-- View Button -->
    <button
      @click.stop="$emit('view', role)"
      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
      title="View Role"
    >
      <ActionIcon name="view" size="sm" />
    </button>

    <!-- Edit Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('edit', role)"
      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
      title="Edit Role"
    >
      <ActionIcon name="edit" size="sm" />
    </button>

    <!-- Clone Button -->
    <button
      v-if="canManage"
      @click.stop="$emit('clone', role)"
      class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
      title="Clone Role"
    >
      <ActionIcon name="clone" size="sm" />
    </button>

    <!-- Deactivate/Activate Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('toggle-status', role)"
      :class="role.active
        ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100'
        : 'text-green-600 hover:text-green-900 hover:bg-green-100'"
      class="p-1 rounded"
      :title="role.active ? 'Deactivate Role' : 'Activate Role'"
    >
      <ActionIcon :name="role.active ? 'deactivate' : 'activate'" size="sm" />
    </button>

    <!-- Delete Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('delete', role)"
      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
      title="Delete Role"
    >
      <ActionIcon name="delete" size="sm" />
    </button>

    <!-- System Role Protection Notice -->
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

defineProps({
  role: {
    type: Object,
    required: true
  },
  canManage: {
    type: Boolean,
    default: false
  },
  isProtected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view', 'edit', 'clone', 'toggle-status', 'delete'])
</script>
