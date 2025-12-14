<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-content">
      <div class="loading-spinner-large"></div>
      <div class="loading-text">{{ message }}</div>
      <div class="progress-bar" v-if="showProgress">
        <div 
          class="progress-bar-fill" 
          :style="{ width: progress + '%' }"
          v-if="progress >= 0"
        ></div>
        <div class="progress-bar-indeterminate" v-else></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  show?: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}>(), {
  show: false,
  message: '正在处理...',
  progress: -1,
  showProgress: true
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  background-color: var(--background-secondary);
  padding: 2em;
  border-radius: 12px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.loading-spinner-large {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1em;
}

.loading-text {
  font-size: 1.1em;
  color: var(--text-primary);
  margin-bottom: 1em;
}

.progress-bar {
  margin-top: 1em;
}
</style>
