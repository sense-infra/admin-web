<template>
  <FormModal
    :open="showModal"
    entity-name="customer"
    :initial-data="initialData"
    :validation-rules="validationRules"
    :submit-handler="handleSubmit"
    @close="$emit('close')"
    @saved="handleSaved"
  >
    <template #default="{ form, errors, isFormValid, updateField, validateField, clearError }">
      <div class="space-y-4">
        <!-- Customer Name -->
        <FormField
          :model-value="form.name_on_contract"
          @update:model-value="updateField('name_on_contract', $event)"
          type="text"
          label="Customer Name"
          placeholder="Enter full customer name"
          :error="errors.name_on_contract"
          required
        />

        <!-- Unique ID -->
        <FormField
          :model-value="form.unique_id"
          @update:model-value="updateField('unique_id', $event)"
          type="text"
          label="Unique ID"
          placeholder="Enter unique identifier"
          :error="errors.unique_id"
          required
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <FormField
            :model-value="form.email"
            @update:model-value="updateField('email', $event)"
            type="email"
            label="Email"
            placeholder="Enter email address"
            :error="errors.email"
          />

          <!-- Phone Number -->
          <FormField
            :model-value="form.phone_number"
            @update:model-value="updateField('phone_number', $event)"
            type="tel"
            label="Phone Number"
            placeholder="Enter phone number"
            :error="errors.phone_number"
          />
        </div>

        <!-- Address -->
        <FormField
          :model-value="form.address"
          @update:model-value="updateField('address', $event)"
          type="textarea"
          label="Address"
          placeholder="Enter full address"
          :rows="3"
          :error="errors.address"
          required
        />

      </div>
    </template>
  </FormModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import FormModal from '@/components/ui/FormModal.vue'
import FormField from '@/components/forms/FormField.vue'
import { customerService } from '@/services/customers'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  },
  allCustomers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const initialData = computed(() => {
  if (props.customer) {
    return {
      name_on_contract: props.customer.name_on_contract || '',
      unique_id: props.customer.unique_id || '',
      email: props.customer.email || '',
      phone_number: props.customer.phone_number || '',
      address: props.customer.address || ''
    }
  }
  return {
    name_on_contract: '',
    unique_id: '',
    email: '',
    phone_number: '',
    address: ''
  }
})

const isEditing = computed(() => !!props.customer?.customer_id)

// ✅ STRICT VALIDATION RULES that work with FormModal
const validationRules = computed(() => ({
  name_on_contract: {
    required: true,
    minLength: 2,
    maxLength: 255,
    validator: (value, form) => {
      console.log('Validating name_on_contract:', value, 'length:', (value || '').length)
      
      if (!value || value.toString().trim().length === 0) {
        return 'Customer name is required'
      }
      
      if (value.toString().trim().length < 2) {
        return 'Customer name must be at least 2 characters long'
      }
      
      if (value.toString().trim().length > 255) {
        return 'Customer name must be less than 255 characters'
      }
      
      return true
    }
  },
  unique_id: {
    required: true,
    minLength: 1,
    maxLength: 255,
    validator: (value, form) => {
      console.log('Validating unique_id:', value)
      
      if (!value || value.toString().trim().length === 0) {
        return 'Unique ID is required'
      }
      
      if (value.toString().trim().length > 255) {
        return 'Unique ID must be less than 255 characters'
      }

      // Check uniqueness (skip for editing same customer)
      const existingCustomer = props.allCustomers.find(c =>
        c.unique_id === value.toString().trim() &&
        (!props.customer || c.customer_id !== props.customer.customer_id)
      )

      if (existingCustomer) {
        return 'This unique ID is already in use'
      }

      return true
    }
  },
  email: {
    required: false,
    validator: (value, form) => {
      if (!value || value.toString().trim() === '') {
        return true // Email is optional
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.toString().trim())) {
        return 'Please enter a valid email address'
      }
      
      if (value.toString().trim().length > 255) {
        return 'Email must be less than 255 characters'
      }
      
      return true
    }
  },
  phone_number: {
    required: false,
    validator: (value, form) => {
      if (!value || value.toString().trim() === '') {
        return true // Phone is optional
      }
      
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
      if (!phoneRegex.test(value.toString().trim())) {
        return 'Please enter a valid phone number (at least 10 digits)'
      }
      
      if (value.toString().trim().length > 15) {
        return 'Phone number must be less than 15 characters'
      }
      
      return true
    }
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 1000,
    validator: (value, form) => {
      console.log('Validating address:', value, 'length:', (value || '').length)
      
      if (!value || value.toString().trim().length === 0) {
        return 'Address is required'
      }
      
      if (value.toString().trim().length < 5) {
        return 'Address must be at least 5 characters long'
      }
      
      if (value.toString().trim().length > 1000) {
        return 'Address must be less than 1000 characters'
      }
      
      return true
    }
  }
}))

const handleSubmit = async (formData, isEditingMode) => {
  console.log('CustomerFormModal: handleSubmit called with:', formData, 'isEditing:', isEditingMode)
  
  try {
    if (isEditingMode) {
      console.log('Updating customer:', props.customer.customer_id)
      return await customerService.customers.update(props.customer.customer_id, formData)
    } else {
      console.log('Creating new customer')
      return await customerService.customers.create(formData)
    }
  } catch (error) {
    console.error('Submit error:', error)
    throw error
  }
}

const handleSaved = (result) => {
  console.log('Customer saved:', result)
  emit('saved', result)
}
</script>
