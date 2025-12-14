<template>
  <transition name="toast">
    <div v-if="visible" :class="['toast', type]">
      <span class="toast-icon">{{ icon }}</span>
      <div class="toast-message">
        <div class="toast-title" v-if="title">{{ title }}</div>
        <div class="toast-description">{{ message }}</div>
      </div>
      <button class="toast-close" @click="close">✕</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}>(), {
  type: 'info',
  title: '',
  duration: 3000
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(false)

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const icon = computed(() => {
  return icons[props.type] || icons.info
})

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
}

onMounted(() => {
  show()
})
</script>

<style scoped>
.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.toast-description {
  font-size: 0.9em;
  opacity: 0.9;
}

.toast-close {
  background: transparent;
  border: none;
  padding: 0.25em 0.5em;
  cursor: pointer;
  opacity: 0.6;
  font-size: 1.2em;
  transition: opacity var(--transition-fast);
}

.toast-close:hover {
  opacity: 1;
  transform: none;
  box-shadow: none;
  border-color: transparent;
}

.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
