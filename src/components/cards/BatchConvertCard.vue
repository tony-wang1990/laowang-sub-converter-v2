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
          <span class="success-text">✅ 批量转换完成</span>
          <span class="result-count">{{ results.length }} 个链接</span>
        </div>
        <div class="result-list">
          <div v-for="(result, index) in results" :key="index" class="result-item">
            <input
              type="text"
              :value="result"
              readonly
              class="result-url"
              style="color: #1a202c !important; font-weight: 600 !important; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%) !important;"
              @click="selectText"
            />
            <button class="btn-copy-small" @click="copyUrl(result)" :title="`复制链接 ${index + 1}`">
              复制{{ index + 1 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const urls = ref('')
const target = ref('clash')
const converting = ref(false)
const results = ref<string[]>([])
const progress = ref(0)

// 强制修复输入框文字颜色
const forceFixInputColor = () => {
  nextTick(() => {
    // 修复结果卡片背景
    const resultCards = document.querySelectorAll('.results')
    resultCards.forEach((card: any) => {
      card.style.setProperty('background', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 'important')
    })
    
    // 修复输入框黑色文字
    const inputs = document.querySelectorAll('.result-url')
    inputs.forEach((input: any) => {
      input.style.setProperty('color', '#000000', 'important')
      input.style.setProperty('-webkit-text-fill-color', '#000000', 'important')
      input.style.setProperty('opacity', '1', 'important')
      input.style.setProperty('background', 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%)', 'important')
    })
    
    // 修复白色文字元素（在渐变背景上）
    const whiteTextElements = document.querySelectorAll('.success-text, .result-count')
    whiteTextElements.forEach((el: any) => {
      el.style.setProperty('color', '#ffffff', 'important')
      el.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important')
      el.style.setProperty('opacity', '1', 'important')
    })
    
    // 修复复制按钮颜色
    const copyButtons = document.querySelectorAll('.btn-copy-small')
    copyButtons.forEach((btn: any) => {
      btn.style.setProperty('color', '#4338ca', 'important')
      btn.style.setProperty('-webkit-text-fill-color', '#4338ca', 'important')
      btn.style.setProperty('background', 'rgba(255, 255, 255, 0.95)', 'important')
    })
  })
}

onMounted(() => {
  forceFixInputColor()
})

// 当results变化时，强制修复颜色
watch(results, () => {
  forceFixInputColor()
}, { deep: true })

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

      progress.value++
    } catch (error) {
      console.error('Batch convert error:', error)
    }
  }

  converting.value = false
}

function selectText(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  // 静默复制，不显示弹窗
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
  margin-top: 24px;
  padding: 24px;
  background: var(--primary-gradient);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.15);
  max-height: none;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.success-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-count {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 20px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
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

.result-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.result-item {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  min-height: 50px;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(4px);
}

.result-url {
  flex: 1;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%) !important;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', 'SF Mono', monospace;
  color: #1a202c !important;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  font-weight: 600;
  word-break: break-all;
  line-height: 1.4;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.result-url::selection {
  background: #667eea;
  color: #ffffff;
}

.result-url:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%) !important;
}

.result-url:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%) !important;
}

.btn-copy-small {
  flex-shrink: 0;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.95);
  color: #4338ca;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  align-self: center;
  white-space: nowrap;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy-small:hover {
  background: #ffffff;
  border-color: #ffffff;
  color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.btn-copy-small:active {
  transform: translateY(0);
}
</style>
```
