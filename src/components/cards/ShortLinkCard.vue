<template>
  <div class="shortlink-card card animate-slide-in delay-300">
    <div class="card-header">
      <h3 class="card-title">🔗 短链接</h3>
    </div>

    <div class="card-body">
      <div class="form-group">
        <label class="form-label">长链接</label>
        <input
          v-model="longUrl"
          class="input"
          placeholder="https://example.com/very/long/url"
          @keyup.enter="createShortLink"
        />
      </div>

      <button
        class="btn btn-primary w-full"
        :disabled="!longUrl || loading"
        @click="createShortLink"
      >
        <span v-if="loading" class="animate-spin">⚙️</span>
        <span v-else>🔗</span>
        {{ loading ? '生成中...' : '生成短链接' }}
      </button>

      <!-- 短链接结果 -->
      <div v-if="shortUrl" class="result">
        <div class="result-header">
          <span>✅ 生成成功</span>
          <button class="btn-icon" @click="copyShortLink" title="复制">
            📋
          </button>
        </div>
        <div class="result-url">{{ shortUrl }}</div>
        <div class="result-hint">点击复制按钮或直接选择文本复制</div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const longUrl = ref('')
const shortUrl = ref('')
const loading = ref(false)
const error = ref('')

async function createShortLink() {
  loading.value = true
  error.value = ''
  shortUrl.value = ''

  try {
    const response = await fetch('/api/shortlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl.value })
    })

    const data = await response.json()

    if (data.success) {
      shortUrl.value = `${window.location.origin}/s/${data.code}`
    } else {
      error.value = data.error || '生成失败'
    }
  } catch (err) {
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}

function copyShortLink() {
  navigator.clipboard.writeText(shortUrl.value)
  alert('✅ 短链接已复制到剪贴板')
}
</script>

<style scoped>
.result {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--success-gradient);
  border-radius: var(--radius-md);
  color: white;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.btn-icon {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 16px;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

.result-url {
  padding: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
  margin-bottom: var(--spacing-xs);
  cursor: text;
  user-select: all;
}

.result-hint {
  font-size: 12px;
  opacity: 0.8;
}

.error {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--secondary-gradient);
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
}
</style>
