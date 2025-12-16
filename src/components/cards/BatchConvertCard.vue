<template>
  <div class="batch-convert-card card animate-slide-in delay-500">
    <div class="card-header">
      <h3 class="card-title">📦 批量转换</h3>
    </div>

    <div class="card-body">
      <div class="form-group">
        <label class="form-label">订阅列表 (每行一个)</label>
        <textarea
          v-model="urls"
          class="input textarea"
          placeholder="支持订阅URL和节点链接，每行一个:
https://example.com/sub1
vmess://eyJ2IjoiMiIs...
vless://uuid@server:443"
          rows="6"
        />
      </div>

      <div class="form-group">
        <label class="form-label">目标客户端</label>
        <select v-model="target" class="input">
          <optgroup label="全平台">
            <option value="clash">Clash</option>
            <option value="clashmeta">Clash Meta</option>
            <option value="singbox">sing-box</option>
          </optgroup>
          <optgroup label="iOS">
            <option value="shadowrocket">Shadowrocket</option>
            <option value="quantumultx">Quantumult X</option>
            <option value="loon">Loon</option>
            <option value="surge">Surge</option>
            <option value="stash">Stash</option>
          </optgroup>
          <optgroup label="Android">
            <option value="v2rayng">v2rayNG</option>
            <option value="surfboard">Surfboard</option>
            <option value="nekobox">NekoBox</option>
          </optgroup>
          <optgroup label="Windows">
            <option value="v2rayn">V2RayN</option>
            <option value="clashverge">Clash Verge</option>
          </optgroup>
          <optgroup label="其他">
            <option value="hiddify">Hiddify</option>
            <option value="karing">Karing</option>
          </optgroup>
        </select>
      </div>

      <button
        class="btn btn-primary w-full"
        :disabled="!urls || converting"
        @click="batchConvert"
      >
        <span v-if="converting" class="animate-spin">⚙️</span>
        <span v-else>📦</span>
        {{ converting ? `转换中 ${progress}/${total}` : '批量转换' }}
      </button>

      <!-- 转换结果 -->
      <div v-if="results.length > 0" class="results">
        <div class="result-header">
          <span>✅ 批量转换完成</span>
          <span>{{ results.length }} 个链接</span>
        </div>
        <div class="result-list">
          <div v-for="(result, index) in results" :key="index" class="result-item">
            <span class="result-index">{{ index + 1 }}</span>
            <div class="result-url">{{ result }}</div>
            <button class="btn-icon" @click="copyUrl(result)" title="复制">
              📋
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const urls = ref('')
const target = ref('clash')
const converting = ref(false)
const results = ref<string[]>([])
const progress = ref(0)

// 支持的协议列表
const supportedProtocols = ['http', 'vmess://', 'vless://', 'ss://', 'ssr://', 'trojan://', 'hysteria://', 'hysteria2://', 'tuic://']

// 检查是否为有效的订阅或节点链接
const isValidLink = (line: string): boolean => {
  const trimmed = line.trim()
  return supportedProtocols.some(protocol => trimmed.startsWith(protocol))
}

const total = computed(() => {
  return urls.value.split('\n').filter(u => isValidLink(u)).length
})

async function batchConvert() {
  converting.value = true
  results.value = []
  progress.value = 0

  const urlList = urls.value.split('\n').filter(u => isValidLink(u))

  for (const url of urlList) {
    try {
      const params = new URLSearchParams({
        target: target.value,
        url: url.trim()
      })

      const baseUrl = window.location.origin
      const convertedUrl = `${baseUrl}/api/convert?${params.toString()}`
      results.value.push(convertedUrl)
    } catch (error) {
      console.error('Conversion failed for:', url, error)
    }
    progress.value++
  }

  converting.value = false
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  alert('✅ 链接已复制')
}
</script>

<style scoped>
.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: monospace;
  font-size: 13px;
}

.results {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  max-height: 300px;
  overflow-y: auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.result-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.result-url {
  flex: 1;
  font-size: 12px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
}

.btn-icon {
  flex-shrink: 0;
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.2);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(102, 126, 234, 0.3);
}
</style>
