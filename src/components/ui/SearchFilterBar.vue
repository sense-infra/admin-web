<template>
  <div class="card mb-6">
    <div class="p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <ActionIcon 
              name="search" 
              size="sm" 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <!-- Custom Filter Slots -->
          <slot name="filters" :filters="filters" />

          <!-- Standard Action Buttons -->
          <button @click="$emit('clear')" class="btn btn-outline">
            <ActionIcon name="clear" size="xs" class="mr-1" />
            Clear
          </button>
          <button @click="$emit('refresh')" class="btn btn-outline">
            <ActionIcon name="refresh" size="xs" class="mr-1" />
            Refresh
          </button>
          <button
            v-if="showAddButton && canAdd"
            @click="$emit('add')"
            class="btn btn-primary"
          >
            <ActionIcon name="add" size="xs" class="mr-1" />
            {{ addButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ActionIcon from '@/components/icons/ActionIcons.vue'

defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  showAddButton: {
    type: Boolean,
    default: true
  },
  canAdd: {
    type: Boolean,
    default: true
  },
  addButtonText: {
    type: String,
    default: 'Add Item'
  }
})

defineEmits(['update:searchQuery', 'clear', 'refresh', 'add'])
</script>
