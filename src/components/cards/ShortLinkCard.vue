<template>
  <div class="shortlink-card card animate-slide-in delay-300">
    <div class="card-header">
      <h3 class="card-title">🔗 短链接</h3>
    </div>

    <div class="card-body">
      <div class="form-group">
        <label class="form-label">长链接</label>
        <textarea
          v-model="longUrl"
          class="input textarea"
          placeholder="https://example.com/very/long/url"
          rows="6"
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
          <span class="success-text">✅ 生成成功</span>
          <button class="btn-copy" @click="copyShortLink" title="复制短链接">
            复制
          </button>
        </div>
        <input 
          type="text" 
          :value="shortUrl" 
          readonly 
          class="result-input"
          style="color: #1a202c !important; font-weight: 600 !important; background: rgba(255, 255, 255, 0.95) !important;"
          @click="selectAll"
        />
        <div class="result-hint">点击输入框全选复制</div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const longUrl = ref('')
const shortUrl = ref('')
const loading = ref(false)
const error = ref('')

// 强制修复输入框文字颜色
const forceFixInputColor = () => {
  nextTick(() => {
    // 修复结果卡片背景
    const resultCards = document.querySelectorAll('.result')
    resultCards.forEach((card: any) => {
      card.style.setProperty('background', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 'important')
    })
    
    // 修复输入框黑色文字
    const inputs = document.querySelectorAll('.result-input')
    inputs.forEach((input: any) => {
      input.style.setProperty('color', '#000000', 'important')
      input.style.setProperty('-webkit-text-fill-color', '#000000', 'important')
      input.style.setProperty('opacity', '1', 'important')
      input.style.setProperty('background', 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%)', 'important')
    })
    
    // 修复白色文字元素（在渐变背景上）
    const whiteTextElements = document.querySelectorAll('.success-text, .result-hint')
    whiteTextElements.forEach((el: any) => {
      el.style.setProperty('color', '#ffffff', 'important')
      el.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important')
      el.style.setProperty('opacity', '1', 'important')
    })
    
    // 修复复制按钮颜色
    const copyButtons = document.querySelectorAll('.btn-copy')
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

// 当输入被清空时，自动清除结果
watch(longUrl, (newValue) => {
  if (!newValue || newValue.trim() === '') {
    shortUrl.value = ''
    error.value = ''
  }
})

// 当shortUrl变化时，强制修复颜色
watch(shortUrl, () => {
  forceFixInputColor()
})

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

function selectAll(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}

function copyShortLink() {
  navigator.clipboard.writeText(shortUrl.value)
  // 静默复制，不显示弹窗
}
</script>

<style scoped>
.large-input {
  padding: 20px 18px !important;
  min-height: 60px;
}

.result {
  margin-top: 24px;
  padding: 24px;
  background: var(--primary-gradient);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.15);
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

.btn-copy {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #4338ca;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-copy::before {
  content: '📋';
}

.btn-copy:hover {
  background: #ffffff;
  border-color: #ffffff;
  color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.btn-copy:active {
  transform: translateY(0);
}

.result-input {
  width: 100%;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%) !important;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  font-family: 'Consolas', 'Monaco', 'SF Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: #1a202c !important;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.result-input::selection {
  background: #667eea;
  color: #ffffff;
}

.result-input:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%) !important;
}

.result-input:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25), 0 6px 20px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%) !important;
}

.result-hint {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  font-weight: 500;
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
