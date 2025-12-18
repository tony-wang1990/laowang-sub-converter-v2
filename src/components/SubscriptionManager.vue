<template>
  <div class="subscription-manager p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner mb-6 transition-colors duration-300">
    <!-- Header with Filter and Add Button -->
    <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center">
          <span class="mr-2">📚</span> {{ $t('subs.title') }}
        </h3>
        
        <!-- Group Filter -->
        <select 
          v-model="selectedGroup"
          class="text-sm px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">{{ $t('subs.allGroups') }}</option>
          <option v-for="group in groups" :key="group" :value="group">
            {{ group }}
          </option>
        </select>
      </div>

      <button 
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200 flex items-center"
      >
        <span class="text-lg mr-1">+</span> {{ $t('subs.add') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSubscriptions.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
      <p>{{ selectedGroup ? $t('subs.emptyGroup') : $t('subs.empty') }}</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div 
        v-for="sub in filteredSubscriptions" 
        :key="sub.id"
        class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
      >
        <div class="flex-1 overflow-hidden mr-4 min-w-0">
          <div class="flex items-center gap-2">
            <div class="font-medium text-gray-800 dark:text-gray-200 truncate">{{ sub.name }}</div>
            <span 
              v-if="sub.group_name && sub.group_name !== 'default'" 
              class="text-xs px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: getGroupColor(sub.group_name), color: 'white' }"
            >
              {{ sub.group_name }}
            </span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 break-all mt-1">{{ sub.url }}</div>
          <!-- Tags -->
          <div v-if="sub.tags" class="flex flex-wrap gap-1 mt-1">
            <span 
              v-for="tag in parseTags(sub.tags)" 
              :key="tag"
              class="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
        <div class="flex space-x-2 shrink-0">
          <button 
            @click="$emit('select', sub.url)"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-600"
            :title="$t('subs.use')"
          >
            {{ $t('subs.use') }}
          </button>
          <button 
            @click="editSub(sub)"
            class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-gray-600"
            :title="$t('subs.edit')"
          >
            ✏️
          </button>
          <button 
            @click="deleteSub(sub.id)"
            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-gray-600"
            :title="$t('subs.delete')"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        <h4 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
          {{ showEditModal ? $t('subs.editTitle') : $t('subs.addTitle') }}
        </h4>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('subs.nameLabel') }} *
            </label>
            <input 
              v-model="formData.name" 
              type="text" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              :placeholder="$t('subs.namePlaceholder')"
            >
          </div>
          
          <!-- URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('subs.urlLabel') }} *
            </label>
            <input 
              v-model="formData.url" 
              type="text" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              :placeholder="$t('subs.urlPlaceholder')"
            >
          </div>

          <!-- Group -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('subs.groupLabel') }}
            </label>
            <input 
              v-model="formData.group_name" 
              type="text" 
              list="groups-list"
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              :placeholder="$t('subs.groupPlaceholder')"
            >
            <datalist id="groups-list">
              <option v-for="group in groups" :key="group" :value="group" />
            </datalist>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('subs.tagsLabel') }}
            </label>
            <input 
              v-model="formData.tags" 
              type="text" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              :placeholder="$t('subs.tagsPlaceholder')"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('subs.tagsHint') }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('subs.descLabel') }}
            </label>
            <textarea 
              v-model="formData.description" 
              rows="2"
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              :placeholder="$t('subs.descPlaceholder')"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="closeModal"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="showEditModal ? updateSub() : addSub()"
            :disabled="!formData.name || !formData.url"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'select', url: string): void
}>()

interface Subscription {
  id: number
  name: string
  url: string
  group_name?: string
  tags?: string
  description?: string
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

const subscriptions = ref<Subscription[]>([])
const groups = ref<string[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedGroup = ref('')
const formData = ref<Partial<Subscription>>({
  name: '',
  url: '',
  group_name: 'default',
  tags: '',
  description: ''
})
const editingId = ref<number | null>(null)

// Computed
const filteredSubscriptions = computed(() => {
  if (!selectedGroup.value) return subscriptions.value
  return subscriptions.value.filter(sub => sub.group_name === selectedGroup.value)
})

// Functions
const fetchSubs = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/subscriptions')
    const data: ApiResponse<Subscription[]> = await res.json()
    if (data.success) {
      subscriptions.value = data.data
    }
  } catch (e) {
    console.error('Failed to fetch subs', e)
  } finally {
    loading.value = false
  }
}

const fetchGroups = async () => {
  try {
    const res = await fetch('/api/subscriptions/groups')
    const data: ApiResponse<string[]> = await res.json()
    if (data.success) {
      groups.value = data.data
    }
  } catch (e) {
    console.error('Failed to fetch groups', e)
  }
}

const addSub = async () => {
  if (!formData.value.name || !formData.value.url) return

  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    const data: ApiResponse<Subscription> = await res.json()
    if (data.success) {
      subscriptions.value.unshift(data.data)
      closeModal()
      fetchGroups() // Refresh groups
    }
  } catch (e) {
    console.error('Failed to add sub', e)
    alert('Failed to add subscription')
  }
}

const editSub = (sub: Subscription) => {
  formData.value = { ...sub }
  editingId.value = sub.id
  showEditModal.value = true
}

const updateSub = async () => {
  if (!formData.value.name || !formData.value.url || !editingId.value) return

  try {
    const res = await fetch(`/api/subscriptions/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    const data: ApiResponse<Subscription> = await res.json()
    if (data.success) {
      const index = subscriptions.value.findIndex(s => s.id === editingId.value)
      if (index !== -1) {
        subscriptions.value[index] = data.data
      }
      closeModal()
      fetchGroups() // Refresh groups
    }
  } catch (e) {
    console.error('Failed to update sub', e)
    alert('Failed to update subscription')
  }
}

const deleteSub = async (id: number) => {
  if (!confirm('Are you sure?')) return

  try {
    const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    const data: ApiResponse<null> = await res.json()
    if (data.success) {
      subscriptions.value = subscriptions.value.filter(s => s.id !== id)
      fetchGroups() // Refresh groups
    }
  } catch (e) {
    console.error('Failed to delete sub', e)
    alert('Failed to delete subscription')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    name: '',
    url: '',
    group_name: 'default',
    tags: '',
    description: ''
  }
  editingId.value = null
}

const parseTags = (tags: string): string[] => {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(t => t)
}

const getGroupColor = (group: string): string => {
  // Simple hash function for consistent colors
  let hash = 0
  for (let i = 0; i < group.length; i++) {
    hash = group.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]
  return colors[Math.abs(hash) % colors.length]
}

onMounted(() => {
  fetchSubs()
  fetchGroups()
})
</script>

<style scoped>
/* Ensure long URLs wrap correctly */
.break-all {
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

/* Fix flex child overflow */
.min-w-0 {
  min-width: 0;
}
</style>
