<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close')"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? 'Edit Contract' : 'Create Contract' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="service_address" class="form-label">Service Address *</label>
              <textarea
                id="service_address"
                v-model="form.service_address"
                required
                rows="3"
                class="form-input"
                placeholder="Enter the service address..."
              ></textarea>
            </div>

            <div>
              <label for="notification_email" class="form-label">Notification Email</label>
              <input
                id="notification_email"
                v-model="form.notification_email"
                type="email"
                class="form-input"
                placeholder="notifications@example.com"
              />
            </div>

            <div>
              <label for="notification_phone" class="form-label">Notification Phone</label>
              <input
                id="notification_phone"
                v-model="form.notification_phone"
                type="tel"
                class="form-input"
                placeholder="+1-555-123-4567"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="start_date" class="form-label">Start Date *</label>
                <input
                  id="start_date"
                  v-model="form.start_date"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
              <div>
                <label for="end_date" class="form-label">End Date *</label>
                <input
                  id="end_date"
                  v-model="form.end_date"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="$emit('close')" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  contract: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref(null)

const form = ref({
  service_address: '',
  notification_email: '',
  notification_phone: '',
  start_date: '',
  end_date: ''
})

const isEditing = computed(() => !!props.contract)

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    if (isEditing.value) {
      await api.put(`/contracts/${props.contract.contract_id}`, form.value)
    } else {
      await api.post('/contracts', form.value)
    }
    emit('saved')
  } catch (err) {
    console.error('Failed to save contract:', err)
    error.value = err.response?.data?.message || 'Failed to save contract'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.contract) {
    form.value = {
      service_address: props.contract.service_address || '',
      notification_email: props.contract.notification_email || '',
      notification_phone: props.contract.notification_phone || '',
      start_date: props.contract.start_date ? props.contract.start_date.split('T')[0] : '',
      end_date: props.contract.end_date ? props.contract.end_date.split('T')[0] : ''
    }
  }
})
</script>
