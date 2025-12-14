
<template>
  <div class="subscription-manager p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner mb-6 transition-colors duration-300">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center">
        <span class="mr-2">📚</span> {{ $t('subs.title') }}
      </h3>
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
    <div v-else-if="subscriptions.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
      <p>{{ $t('subs.empty') }}</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div 
        v-for="sub in subscriptions" 
        :key="sub.id"
        class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
      >
        <div class="flex-1 overflow-hidden mr-4">
          <div class="font-medium text-gray-800 dark:text-gray-200 truncate">{{ sub.name }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ sub.url }}</div>
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
            @click="deleteSub(sub.id)"
            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-gray-600"
            :title="$t('subs.delete')"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl transform transition-all">
        <h4 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">{{ $t('subs.addTitle') }}</h4>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('subs.nameLabel') }}</label>
          <input 
            v-model="newSub.name" 
            type="text" 
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            :placeholder="$t('subs.namePlaceholder')"
          >
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('subs.urlLabel') }}</label>
          <input 
            v-model="newSub.url" 
            type="text" 
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            :placeholder="$t('subs.urlPlaceholder')"
          >
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showAddModal = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="addSub"
            :disabled="!newSub.name || !newSub.url"
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
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'select', url: string): void
}>()

interface Subscription {
  id: number;
  name: string;
  url: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const subscriptions = ref<Subscription[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const newSub = ref<{ name: string; url: string }>({ name: '', url: '' })

// Fetch subscriptions
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

// Add subscription
const addSub = async () => {
  if (!newSub.value.name || !newSub.value.url) return

  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub.value)
    })
    const data: ApiResponse<Subscription> = await res.json()
    if (data.success) {
      subscriptions.value.unshift(data.data) // Add to top
      showAddModal.value = false
      newSub.value = { name: '', url: '' }
    }
  } catch (e) {
    console.error('Failed to add sub', e)
    alert('Failed to add subscription')
  }
}

// Delete subscription
const deleteSub = async (id: number) => {
  if (!confirm('Are you sure?')) return

  try {
    const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    const data: ApiResponse<null> = await res.json()
    if (data.success) {
      subscriptions.value = subscriptions.value.filter(s => s.id !== id)
    }
  } catch (e) {
    console.error('Failed to delete sub', e)
    alert('Failed to delete subscription')
  }
}

onMounted(() => {
  fetchSubs()
})
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
