<template>
  <div class="flex items-center gap-2">
    <!-- View Button -->
    <button
      @click.stop="handleView"
      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
      title="View Customer"
    >
      <ActionIcon name="view" size="sm" />
    </button>

    <!-- Edit Button -->
    <button
      v-if="canManage"
      @click.stop="handleEdit"
      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
      title="Edit Customer"
    >
      <ActionIcon name="edit" size="sm" />
    </button>

    <!-- Delete Button -->
    <button
      v-if="canManage"
      @click.stop="handleDelete"
      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
      title="Delete Customer"
    >
      <ActionIcon name="delete" size="sm" />
    </button>
  </div>
</template>

<script setup>
import ActionIcon from '@/components/icons/ActionIcons.vue'

const props = defineProps({
  customer: {
    type: Object,
    required: true
  },
  canManage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'edit', 'delete'])

const handleView = () => {
  console.log('CustomerActionButtons: View clicked for customer:', props.customer.customer_id)
  emit('view', props.customer)
}

const handleEdit = () => {
  console.log('CustomerActionButtons: Edit clicked for customer:', props.customer.customer_id)
  emit('edit', props.customer)
}

const handleDelete = () => {
  console.log('CustomerActionButtons: Delete clicked for customer:', props.customer.customer_id)
  emit('delete', props.customer)
}
</script>
