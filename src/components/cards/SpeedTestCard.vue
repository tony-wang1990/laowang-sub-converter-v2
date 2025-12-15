<template>
  <div class="speed-test-card card animate-slide-in delay-200">
    <div class="card-content">
      <div class="card-top">
        <h3 class="card-title">⚡ 节点测速</h3>
        <span v-if="testing" class="badge">测试中...</span>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label class="form-label">选择订阅</label>
          <select v-model="selectedSub" class="input">
            <option value="">请选择订阅</option>
            <option v-for="sub in subscriptions" :key="sub.id" :value="sub.url">
              {{ sub.name }}
            </option>
          </select>
        </div>

        <button
          class="btn btn-accent w-full"
          :disabled="!selectedSub || testing"
          @click="startSpeedTest"
        >
          <span v-if="testing" class="animate-spin">⚙️</span>
          <span v-else>⚡</span>
          {{ testing ? '测速中...' : '开始测速' }}
        </button>
      </div>

      <!-- 测速结果 -->
      <div v-if="results.length > 0" class="results">
        <div class="result-header">
          <span>✅ 测速完成</span>
          <span class="stats-text">
            {{ stats.reachable }}/{{ stats.total }} 可达
          </span>
        </div>
        
        <div class="result-list">
          <div v-for="(result, index) in results.slice(0, 5)" :key="index" class="result-item">
            <div class="result-info">
              <span class="result-name">{{ result.name }}</span>
              <span class="result-server">{{ result.server }}:{{ result.port }}</span>
            </div>
            <span :class="['result-latency', result.reachable ? 'ok' : 'fail']">
              {{ result.reachable ? `${result.latency}ms` : '不可达' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const subscriptions = ref<any[]>([])
const selectedSub = ref('')
const testing = ref(false)
const results = ref<any[]>([])
const stats = ref({ total: 0, reachable: 0 })

onMounted(async () => {
  try {
    const response = await fetch('/api/subscriptions')
    const data = await response.json()
    subscriptions.value = data.data || []
  } catch (error) {
    console.error('Failed to load subscriptions:', error)
  }
})

async function startSpeedTest() {
  testing.value = true
  results.value = []
  
  try {
    const response = await fetch(`/api/speedtest?url=${encodeURIComponent(selectedSub.value)}`)
    const data = await response.json()
    
    if (data.success) {
      results.value = data.results || []
      stats.value = data.stats || { total: 0, reachable: 0 }
    }
  } catch (error) {
    console.error('Speed test failed:', error)
    alert('测速失败，请检查订阅链接')
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.card-top .card-title {
  margin: 0;
  font-size: 18px;
}

.badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border-radius: 20px;
  font-size: 12px;
  color: white;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.results {
  margin-top: 20px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.stats-text {
  color: var(--text-muted);
  font-size: 14px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-name {
  font-weight: 600;
  font-size: 14px;
}

.result-server {
  font-size: 12px;
  color: var(--text-muted);
}

.result-latency {
  font-weight: 700;
  font-size: 14px;
}

.result-latency.ok {
  color: #4facfe;
}

.result-latency.fail {
  color: #f5576c;
}
</style>
