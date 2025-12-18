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
          type="button"
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
      <div v-if="stats.total > 0" class="results result">
        <div class="result-header">
          <div class="result-title-group">
            <span class="success-text">✅ 测速完成</span>
          </div>
          <span class="result-summary text-white/90">{{ stats.reachable }}/{{ stats.total }} 可达 ({{ (((stats.reachable || 0) / (stats.total || 1)) * 100).toFixed(1) }}%)</span>
        </div>
        
        <div v-if="results.length > 0" class="result-list">
          <div v-for="(result, index) in results" :key="index" class="check-result-item">
            <div class="node-info">
              <div class="node-name" :title="result.name">{{ result.name }}</div>
              <div class="node-address">{{ result.server }}</div>
            </div>
            <div class="node-latency" :class="{
              'fast': result.latency < 200,
              'medium': result.latency >= 200 && result.latency < 500,
              'slow': result.latency >= 500,
              'timeout': !result.reachable
            }">
              {{ result.reachable ? result.latency + 'ms' : '超时' }}
            </div>
          </div>
        </div>

        <div v-else class="empty-result">
          <span class="empty-icon">😢</span>
          <p class="empty-text">所有节点均不可达</p>
          <p class="empty-hint">请检查节点配置或网络连接</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

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
    
    console.log('Speed test response:', data)
    
    if (data.success) {
      results.value = data.results || []
      stats.value = data.stats || { total: 0, reachable: 0 }
      console.log('Results:', results.value)
      console.log('Stats:', stats.value)
    } else {
      console.error('Speed test failed:', data.error || data.message)
      alert(`测速失败：${data.error || data.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('Speed test error:', error)
    alert('测速失败，请检查订阅链接')
  } finally {
    testing.value = false
  }
}

// 强制修复样式
const forceFixInputColor = () => {
  nextTick(() => {
    // 修复结果卡片背景
    const resultCards = document.querySelectorAll('.result')
    resultCards.forEach((card: any) => {
      card.style.setProperty('background', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 'important')
    })
    
    // 修复文字颜色
    const whiteTextElements = document.querySelectorAll('.success-text, .result-header')
    whiteTextElements.forEach((el: any) => {
      el.style.setProperty('color', '#ffffff', 'important')
    })
  })
}

watch(results, () => {
  if (results.value.length > 0) {
    forceFixInputColor()
  }
}, { deep: true })

</script>

<style scoped>
.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  min-width: 0;
  overflow: hidden;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  min-width: 0;
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
  flex-shrink: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.form-group {
  margin-bottom: 0;
  min-width: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 结果样式 */
.result {
  margin-top: 24px;
  padding: 24px;
  background: var(--primary-gradient);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: white;
  flex-shrink: 0;
}

.success-text {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-summary {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 600;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px; /* 增加高度 */
  overflow-y: auto;
  padding-right: 8px;
}

/* 美化滚动条 */
.result-list::-webkit-scrollbar {
  width: 6px;
}

.result-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.result-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.check-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  margin-right: 12px;
  min-width: 0;
  flex: 1;
}

.node-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .check-result-item {
    padding: 10px 12px;
  }
  
  .node-name {
    white-space: normal;
    word-break: break-all;
  }
}

.node-address {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.node-latency {
  font-family: monospace;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.node-latency.fast { color: #10b981; }
.node-latency.medium { color: #f59e0b; }
.node-latency.slow { color: #ef4444; }
.node-latency.timeout { color: #9ca3af; }

.empty-result {
  text-align: center;
  padding: 24px 12px;
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  word-break: break-all;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  word-break: break-all;
}
</style>
