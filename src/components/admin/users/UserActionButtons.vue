<template>
  <div class="flex items-center gap-2">
    <!-- View Button -->
    <button
      @click.stop="$emit('view', user)"
      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
      title="View User"
    >
      <ActionIcon name="view" size="sm" />
    </button>

    <!-- Edit Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('edit', user)"
      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
      title="Edit User"
    >
      <ActionIcon name="edit" size="sm" />
    </button>

    <!-- Password Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('password', user)"
      class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
      title="Change Password"
    >
      <ActionIcon name="key" size="sm" />
    </button>

    <!-- Deactivate/Activate Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('toggle', user)"
      :class="user.active
        ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100'
        : 'text-green-600 hover:text-green-900 hover:bg-green-100'"
      class="p-1 rounded"
      :title="user.active ? 'Deactivate User' : 'Activate User'"
    >
      <ActionIcon :name="user.active ? 'deactivate' : 'activate'" size="sm" />
    </button>

    <!-- Delete Button -->
    <button
      v-if="canManage && !isProtected"
      @click.stop="$emit('delete', user)"
      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
      title="Delete User"
    >
      <ActionIcon name="delete" size="sm" />
    </button>

    <!-- System User Protection Notice -->
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
  user: {
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

defineEmits(['view', 'edit', 'password', 'toggle', 'delete'])
</script>
