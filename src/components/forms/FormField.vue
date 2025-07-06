<template>
  <div class="form-group">
    <!-- Label -->
    <label
      v-if="label"
      :for="fieldId"
      class="form-label"
      :class="{ 'text-red-700': hasError }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Field -->
    <div class="relative">
      <!-- Text Input -->
      <input
        v-if="type === 'text' || type === 'email' || type === 'tel' || type === 'password' || type === 'url'"
        :id="fieldId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClass"
        :autocomplete="autocomplete"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="fieldId"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :class="inputClass"
      ></textarea>

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        :id="fieldId"
        :value="modelValue"
        @change="handleInput"
        @blur="handleBlur"
        :disabled="disabled"
        :class="inputClass"
      >
        <option value="" v-if="placeholder">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <!-- Checkbox - CONSOLIDATED: Proper boolean handling -->
      <label
        v-else-if="type === 'checkbox'"
        class="flex items-center cursor-pointer"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      >
        <input
          :id="fieldId"
          type="checkbox"
          :checked="Boolean(modelValue)"
          @change="handleInput"
          :disabled="disabled"
          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <span class="ml-2 text-sm text-gray-700">{{ label }}</span>
      </label>

      <!-- Radio Group -->
      <div v-else-if="type === 'radio'" class="space-y-2">
        <label
          v-for="option in options"
          :key="getOptionValue(option)"
          class="flex items-center cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        >
          <input
            :name="fieldId"
            type="radio"
            :value="getOptionValue(option)"
            :checked="modelValue === getOptionValue(option)"
            @change="handleInput"
            :disabled="disabled"
            class="text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ getOptionLabel(option) }}</span>
        </label>
      </div>

      <!-- Number Input -->
      <input
        v-else-if="type === 'number'"
        :id="fieldId"
        type="number"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClass"
      />

      <!-- Date Input -->
      <input
        v-else-if="type === 'date' || type === 'datetime-local'"
        :id="fieldId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :class="inputClass"
      />

      <!-- File Input -->
      <input
        v-else-if="type === 'file'"
        :id="fieldId"
        type="file"
        @change="handleFileInput"
        :disabled="disabled"
        :accept="accept"
        :multiple="multiple"
        :class="inputClass"
      />

      <!-- Icon (if provided) -->
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-gray-400" />
      </div>

      <!-- Clear button for text inputs -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        @click="clearField"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Help Text -->
    <p v-if="help && !hasError" class="mt-1 text-sm text-gray-500">
      {{ help }}
    </p>

    <!-- Error Message -->
    <p v-if="hasError" class="form-error text-sm text-red-600 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array, File],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'email', 'tel', 'password', 'url', 'textarea', 'select',
      'checkbox', 'radio', 'number', 'date', 'datetime-local', 'file'
    ].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  help: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object],
    default: null
  },
  // Select/Radio options
  options: {
    type: Array,
    default: () => []
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  // Textarea specific
  rows: {
    type: Number,
    default: 3
  },
  // Number input specific
  min: {
    type: Number,
    default: null
  },
  max: {
    type: Number,
    default: null
  },
  step: {
    type: Number,
    default: null
  },
  // File input specific
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  // HTML attributes
  autocomplete: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change'])

const fieldId = ref(`field-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

const inputClass = computed(() => {
  const baseClass = 'form-input'
  const errorClass = hasError.value ? 'form-input-error border-red-300 focus:border-red-300 focus:ring-red-200' : ''
  const iconClass = props.icon ? 'pl-10' : ''
  const clearableClass = props.clearable && props.modelValue ? 'pr-10' : ''

  return [baseClass, errorClass, iconClass, clearableClass].filter(Boolean).join(' ')
})

const handleInput = (event) => {
  let value = event.target.value

  // Handle different input types
  if (props.type === 'checkbox') {
    value = event.target.checked
  } else if (props.type === 'number') {
    value = event.target.value === '' ? null : Number(event.target.value)
  } else if (props.type === 'radio') {
    value = event.target.value
  }

  emit('update:modelValue', value)
  emit('change', value)
}

const handleFileInput = (event) => {
  const files = event.target.files
  const value = props.multiple ? Array.from(files) : files[0]
  emit('update:modelValue', value)
  emit('change', value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const clearField = () => {
  emit('update:modelValue', '')
  emit('change', '')
}

const getOptionValue = (option) => {
  return typeof option === 'object' ? option[props.optionValue] : option
}

const getOptionLabel = (option) => {
  return typeof option === 'object' ? option[props.optionLabel] : option
}
</script>

<style scoped>
.form-group {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}

.form-input-error {
  @apply border-red-300 focus:border-red-300 focus:ring-red-200;
}

.form-error {
  @apply text-sm text-red-600 mt-1;
}
</style>
