<template>
  <div class="data-table-container">
    <!-- Search and Filters -->
    <div v-if="searchable || showFilters" class="data-table-controls">
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <!-- Search -->
        <div v-if="searchable" class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="localSearch"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              v-if="localSearch"
              @click="localSearch = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter Controls -->
        <div v-if="showFilters" class="flex gap-2">
          <slot name="filters" :filters="localFilters" :updateFilter="updateFilter" />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            v-if="showRefresh"
            @click="$emit('refresh')"
            :disabled="loading"
            class="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Table Header -->
      <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <slot name="header">
          <h2 class="text-lg font-medium text-gray-900">{{ title }}</h2>
        </slot>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">{{ loadingText }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center text-red-600">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg font-medium">{{ error }}</p>
        <button 
          v-if="showRefresh"
          @click="$emit('refresh')" 
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Try Again
        </button>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="table">
          <!-- Table Header -->
          <thead class="table-header">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                @click="column.sortable ? handleSort(column.key) : null"
                :class="[
                  'table-header-cell',
                  { 'cursor-pointer hover:bg-gray-100': column.sortable },
                  column.headerClass || ''
                ]"
              >
                <div class="flex items-center">
                  {{ column.label }}
                  <div v-if="column.sortable" class="ml-2 flex flex-col">
                    <svg 
                      :class="[
                        'w-3 h-3 transition-colors',
                        sortColumn === column.key && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                      ]" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg 
                      :class="[
                        'w-3 h-3 transition-colors -mt-1',
                        sortColumn === column.key && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                      ]" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="table-body">
            <tr
              v-for="(item, index) in paginatedItems"
              :key="getRowKey(item, index)"
              :class="[
                'table-row',
                { 'bg-blue-50': selectedItems.includes(getRowKey(item, index)) }
              ]"
              @click="handleRowClick(item, index)"
            >
              <slot 
                name="row" 
                :item="item" 
                :index="index"
                :columns="columns"
              >
                <!-- Default row rendering -->
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="['table-cell', column.cellClass || '']"
                >
                  <slot 
                    :name="`cell-${column.key}`" 
                    :item="item" 
                    :value="getNestedValue(item, column.key)"
                    :column="column"
                  >
                    {{ formatCellValue(item, column) }}
                  </slot>
                </td>
              </slot>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredItems.length === 0" class="p-8 text-center text-gray-500">
          <slot name="empty">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 7h.01M7 3h5v4H7V3z" />
            </svg>
            <p class="text-lg font-medium">{{ emptyStateTitle }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ emptyStateMessage }}</p>
          </slot>
        </div>
      </div>

      <!-- Pagination -->
      <div 
        v-if="paginated && filteredItems.length > pageSize" 
        class="px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="flex items-center justify-between">
          <!-- Page Info -->
          <div class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ Math.min(startIndex + pageSize, filteredItems.length) }} 
            of {{ filteredItems.length }} results
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 text-sm border rounded-md',
                  page === currentPage 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <!-- Page Size Selector -->
          <div v-if="showPageSize" class="flex items-center space-x-2">
            <label class="text-sm text-gray-700">Per page:</label>
            <select
              v-model="pageSize"
              class="text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // Data
  items: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  
  // Table configuration
  title: {
    type: String,
    default: ''
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
  
  // Search and filtering
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  searchColumns: {
    type: Array,
    default: () => []
  },
  showFilters: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  
  // Pagination
  paginated: {
    type: Boolean,
    default: false
  },
  initialPageSize: {
    type: Number,
    default: 10
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  showPageSize: {
    type: Boolean,
    default: true
  },
  
  // Sorting
  sortable: {
    type: Boolean,
    default: true
  },
  initialSort: {
    type: Object,
    default: () => ({ column: '', direction: 'asc' })
  },
  
  // Row selection
  selectable: {
    type: Boolean,
    default: false
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  
  // Misc
  rowKey: {
    type: String,
    default: 'id'
  },
  clickableRows: {
    type: Boolean,
    default: false
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  emptyStateTitle: {
    type: String,
    default: 'No data found'
  },
  emptyStateMessage: {
    type: String,
    default: 'Try adjusting your search or filters'
  }
})

const emit = defineEmits(['refresh', 'row-click', 'selection-change', 'sort-change', 'filter-change'])

// Local reactive state
const localSearch = ref('')
const localFilters = ref({ ...props.filters })
const sortColumn = ref(props.initialSort.column)
const sortDirection = ref(props.initialSort.direction)
const currentPage = ref(1)
const pageSize = ref(props.initialPageSize)
const selectedItems = ref([])

// Computed properties
const searchableColumns = computed(() => {
  return props.searchColumns.length > 0 
    ? props.searchColumns 
    : props.columns.filter(col => col.searchable !== false).map(col => col.key)
})

const filteredItems = computed(() => {
  let filtered = [...props.items]

  // Apply search
  if (localSearch.value && props.searchable) {
    const searchTerm = localSearch.value.toLowerCase()
    filtered = filtered.filter(item => {
      return searchableColumns.value.some(column => {
        const value = getNestedValue(item, column)
        return value && value.toString().toLowerCase().includes(searchTerm)
      })
    })
  }

  // Apply filters
  Object.keys(localFilters.value).forEach(key => {
    const filterValue = localFilters.value[key]
    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
      filtered = filtered.filter(item => {
        const itemValue = getNestedValue(item, key)
        return itemValue === filterValue
      })
    }
  })

  // Apply sorting
  if (sortColumn.value && props.sortable) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn.value)
      const bValue = getNestedValue(b, sortColumn.value)
      
      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1
      
      return sortDirection.value === 'desc' ? -comparison : comparison
    })
  }

  return filtered
})

const totalPages = computed(() => {
  return props.paginated ? Math.ceil(filteredItems.value.length / pageSize.value) : 1
})

const startIndex = computed(() => {
  return props.paginated ? (currentPage.value - 1) * pageSize.value : 0
})

const paginatedItems = computed(() => {
  if (!props.paginated) return filteredItems.value
  
  const start = startIndex.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Always show first page
  if (total > 0) pages.push(1)
  
  // Show pages around current page
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) pages.push(i)
  }
  
  // Always show last page
  if (total > 1 && !pages.includes(total)) pages.push(total)
  
  return pages.sort((a, b) => a - b)
})

// Methods
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const getRowKey = (item, index) => {
  return getNestedValue(item, props.rowKey) || index
}

const formatCellValue = (item, column) => {
  const value = getNestedValue(item, column.key)
  
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value, item)
  }
  
  return value ?? ''
}

const handleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  
  emit('sort-change', { column: sortColumn.value, direction: sortDirection.value })
}

const handleRowClick = (item, index) => {
  if (props.clickableRows) {
    emit('row-click', item, index)
  }
  
  if (props.selectable) {
    const key = getRowKey(item, index)
    if (props.multiSelect) {
      const selectedIndex = selectedItems.value.indexOf(key)
      if (selectedIndex > -1) {
        selectedItems.value.splice(selectedIndex, 1)
      } else {
        selectedItems.value.push(key)
      }
    } else {
      selectedItems.value = selectedItems.value.includes(key) ? [] : [key]
    }
    
    emit('selection-change', selectedItems.value)
  }
}

const updateFilter = (key, value) => {
  localFilters.value[key] = value
  currentPage.value = 1 // Reset to first page when filtering
  emit('filter-change', { ...localFilters.value })
}

// Watchers
watch(localSearch, () => {
  currentPage.value = 1 // Reset to first page when searching
})

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Reset page when items change
watch(() => props.items, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

// Expose methods for parent components
defineExpose({
  refresh: () => emit('refresh'),
  clearSelection: () => {
    selectedItems.value = []
    emit('selection-change', [])
  },
  selectAll: () => {
    selectedItems.value = filteredItems.value.map((item, index) => getRowKey(item, index))
    emit('selection-change', selectedItems.value)
  }
})
</script>
