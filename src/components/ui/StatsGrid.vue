<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <div
      v-for="stat in stats"
      :key="stat.title"
      class="card p-6"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <ActionIcon :name="stat.icon" size="lg" :class="iconColorClass(stat.color)" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ stat.title }}</dt>
            <dd class="text-lg font-medium text-gray-900">{{ formatValue(stat.value, stat.format) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ActionIcon from '@/components/icons/ActionIcons.vue'

defineProps({
  stats: {
    type: Array,
    required: true,
    validator: (stats) => {
      return stats.every(stat => 
        stat.title && 
        stat.value !== undefined && 
        stat.icon && 
        stat.color
      )
    }
  }
})

const iconColorClass = (color) => {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  }
  return colorMap[color] || 'text-blue-600'
}

const formatValue = (value, format = 'number') => {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    case 'percentage':
      return `${value}%`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}
</script>
