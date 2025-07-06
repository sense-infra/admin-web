<template>
  <FormModal
    :open="!!user || showModal"
    :entity-name="!!user ? 'User (Edit)' : 'User'"
    :initial-data="initialData"
    :validation-rules="validationRules"
    :submit-handler="handleSubmit"
    :validate-on-change="true"
    size="medium"
    @close="$emit('close')"
    @saved="handleSaved"
  >
    <template #default="{ form, errors, isEditing }">
      <div class="space-y-4">
        <!-- Server Error Display -->
        <div v-if="serverError" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-start">
            <ActionIcon name="warning" size="sm" class="text-red-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-red-800">{{ serverError }}</p>
            </div>
          </div>
        </div>

        <!-- Loading Roles Notice -->
        <div v-if="rolesLoading" class="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-start">
            <ActionIcon name="loading" size="sm" class="text-blue-400 mr-2 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-800">Loading roles...</p>
            </div>
          </div>
        </div>

        <!-- Username -->
        <FormField
          v-model="form.username"
          type="text"
          label="Username"
          placeholder="Enter username"
          :error="errors.username"
          :disabled="isEditing"
          required
        />

        <!-- Email -->
        <FormField
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="user@example.com"
          :error="errors.email"
          required
        />

        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <FormField
            v-model="form.first_name"
            type="text"
            label="First Name"
            placeholder="First name"
            :error="errors.first_name"
          />
          <FormField
            v-model="form.last_name"
            type="text"
            label="Last Name"
            placeholder="Last name"
            :error="errors.last_name"
          />
        </div>

        <!-- Role Selection -->
        <FormField
          v-model="form.role_id"
          type="select"
          label="Role"
          placeholder="Select a role"
          :options="roleOptions"
          option-value="role_id"
          option-label="displayName"
          :error="errors.role_id"
          :disabled="rolesLoading"
          required
        />

        <!-- Password (only for new users) -->
        <div v-if="!isEditing">
          <FormField
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter password (optional)"
            :error="errors.password"
            help="Leave empty to auto-generate a secure password"
          />

          <!-- Password strength indicator -->
          <div v-if="form.password" class="mt-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Password strength:</span>
              <span :class="getStrengthColorClass(form.password)">
                {{ getPasswordStrengthInfo(form.password).label }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                :class="getStrengthColorClass(form.password, true)"
                class="h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(getPasswordStrength(form.password) / 4) * 100}%` }"
              ></div>
            </div>

            <!-- Password Requirements -->
            <div class="mt-2 text-xs space-y-1">
              <div class="text-gray-600 font-medium">Password Requirements:</div>
              <div :class="getRequirementClass(form.password, 8)">
                ✓ At least 8 characters
              </div>
              <div :class="getRequirementClass(form.password, 'lowercase')">
                ✓ At least one lowercase letter
              </div>
              <div :class="getRequirementClass(form.password, 'uppercase')">
                ✓ At least one uppercase letter
              </div>
              <div :class="getRequirementClass(form.password, 'number')">
                ✓ At least one number
              </div>
              <div :class="getRequirementClass(form.password, 'special')">
                ✓ At least one special character
              </div>
            </div>
          </div>
        </div>

        <!-- Active Status -->
        <FormField
          v-model="form.active"
          type="checkbox"
          label="Active user"
          help="Inactive users cannot log in to the system"
        />

        <!-- Generated Password Display -->
        <div v-if="generatedPassword" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <div class="flex items-start">
            <ActionIcon name="success" size="sm" class="text-green-400 mr-2 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-green-800">
                Generated Password: <code class="bg-green-100 px-2 py-1 rounded">{{ generatedPassword }}</code>
              </p>
              <p class="text-xs text-green-600 mt-1">
                Please save this password and provide it to the user.
              </p>
              <div class="flex gap-2 mt-2">
                <button
                  @click="copyToClipboard(generatedPassword)"
                  type="button"
                  class="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Copy Password
                </button>
                <button
                  @click="closeModalAfterCopy"
                  type="button"
                  class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Copy & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </FormModal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import FormModal from '@/components/ui/FormModal.vue'
import FormField from '@/components/forms/FormField.vue'
import ActionIcon from '@/components/icons/ActionIcons.vue'
import api from '@/services/api'
import { userService, userUtils } from '@/services/users'
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthInfo,
  hasSpecialCharacters
} from '@/utils/passwordValidation'
import { validation } from '@/utils/validation'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  showModal: {
    type: Boolean,
    default: false
  },
  allUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const roles = ref([])
const rolesLoading = ref(false)
const generatedPassword = ref('')
const serverError = ref('')

const isEditing = computed(() => {
  return !!(props.user && props.user.user_id)
})

const initialData = computed(() => {
  if (isEditing.value && props.user) {
    return {
      user_id: props.user.user_id,
      username: props.user.username || '',
      email: props.user.email || '',
      first_name: props.user.first_name || '',
      last_name: props.user.last_name || '',
      role_id: props.user.role_id || props.user.role?.role_id || '',
      active: (() => {
        const value = props.user.active
        if (value === true || value === 1 || value === '1' || value === 'true') return true
        if (value === false || value === 0 || value === '0' || value === 'false') return false
        return Boolean(value)
      })()
    }
  } else {
    return {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role_id: '',
      active: true
    }
  }
})

const roleOptions = computed(() => {
  return roles.value.map(role => ({
    ...role,
    displayName: `${role.name} - ${role.description || 'No description'}`
  }))
})

const validationRules = computed(() => {
  return {
    username: validation()
      .required('Username')
      .minLength(3)
      .maxLength(50)
      .alphanumericUnderscore()
      .unique({
        items: props.allUsers,
        field: 'username',
        idField: 'user_id',
        currentItem: isEditing.value ? props.user : null,
        caseSensitive: false,
        errorMessage: 'This username is already taken'
      })
      .build(),

    email: validation()
      .required('Email')
      .maxLength(255)
      .email()
      .unique({
        items: props.allUsers,
        field: 'email', 
        idField: 'user_id',
        currentItem: isEditing.value ? props.user : null,
        caseSensitive: false,
        errorMessage: 'This email address is already in use'
      })
      .build(),

    first_name: validation()
      .maxLength(100)
      .build(),

    last_name: validation()
      .maxLength(100)
      .build(),

    role_id: {
      required: true,
      validator: (value) => {
        if (!value) return 'Please select a role'

        if (rolesLoading.value || roles.value.length === 0) {
          return true
        }

        const roleExists = roles.value.some(role => role.role_id === parseInt(value))
        return roleExists || 'Selected role does not exist'
      }
    },

    password: {
      required: false,
      validator: (value) => {
        if (isEditing.value) return true
        if (!value || value.trim() === '') return true
        return validatePassword(value)
      }
    },

    active: {}
  }
})

const getStrengthColorClass = (password, isBar = false) => {
  const strength = getPasswordStrength(password)
  const prefix = isBar ? 'bg-' : 'text-'

  const colorMap = {
    0: `${prefix}red-500`,
    1: `${prefix}red-500`,
    2: `${prefix}yellow-500`,
    3: `${prefix}blue-500`,
    4: `${prefix}green-500`
  }

  return colorMap[strength] || `${prefix}gray-400`
}

const getRequirementClass = (password, requirement) => {
  if (!password) return 'text-gray-400'

  let isMet = false

  switch (requirement) {
    case 8:
      isMet = password.length >= 8
      break
    case 'lowercase':
      isMet = /[a-z]/.test(password)
      break
    case 'uppercase':
      isMet = /[A-Z]/.test(password)
      break
    case 'number':
      isMet = /\d/.test(password)
      break
    case 'special':
      isMet = hasSpecialCharacters(password)
      break
  }

  return isMet ? 'text-green-600' : 'text-red-500'
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

const closeModalAfterCopy = async () => {
  await copyToClipboard(generatedPassword.value)
  generatedPassword.value = ''
  serverError.value = ''
  emit('close')
}

const fetchRoles = async () => {
  rolesLoading.value = true
  try {
    const response = await api.get('/auth/roles')
    roles.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch roles:', err)
    roles.value = []
    serverError.value = 'Failed to load roles. Please refresh and try again.'
  } finally {
    rolesLoading.value = false
  }
}

const handleSubmit = async (formData, isEditingMode) => {
  serverError.value = ''

  try {
    let response

    if (isEditingMode) {
      response = await userService.update(props.user.user_id, formData)
    } else {
      response = await userService.create(formData)
    }

    if (response?.password) {
      generatedPassword.value = response.password
      return response
    }

    return response
  } catch (error) {
    console.error('Failed to save user:', error)
    serverError.value = userUtils.formatError(error)
    await nextTick()
    throw error
  }
}

const handleSaved = (result) => {
  if (result?.password) {
    generatedPassword.value = result.password
    emit('saved', result)
  } else {
    emit('saved', result)
  }
}

onMounted(async () => {
  await fetchRoles()
})
</script>
