<template>
  <div class="qrcode-card card animate-slide-in delay-400">
    <div class="card-header">
      <h3 class="card-title">📱 二维码</h3>
    </div>

    <div class="card-body">
      <div class="form-group">
        <label class="form-label">文本或链接</label>
        <textarea
          v-model="text"
          class="input textarea"
          placeholder="输入要生成二维码的文本或链接"
          rows="6"
        />
      </div>

      <button
        class="btn btn-primary w-full"
        :disabled="!text || loading"
        @click="generateQRCode"
      >
        <span v-if="loading" class="animate-spin">⚙️</span>
        <span v-else>📱</span>
        {{ loading ? '生成中...' : '生成二维码' }}
      </button>

      <!-- 二维码预览 -->
      <div v-if="qrCodeUrl" class="qr-preview">
        <img :src="qrCodeUrl" alt="QR Code" class="qr-image" />
        <button class="btn btn-success w-full" @click="downloadQRCode">
          💾 下载二维码
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const text = ref('')
const qrCodeUrl = ref('')
const loading = ref(false)
const error = ref('')

// 当输入被清空时，自动清除二维码
watch(text, (newValue) => {
  if (!newValue || newValue.trim() === '') {
    qrCodeUrl.value = ''
    error.value = ''
  }
})

async function generateQRCode() {
  loading.value = true
  error.value = ''
  qrCodeUrl.value = ''

  try {
    const response = await fetch('/api/qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.value })
    })

    if (response.ok) {
      const blob = await response.blob()
      qrCodeUrl.value = URL.createObjectURL(blob)
    } else {
      error.value = '生成失败，请重试'
    }
  } catch (err) {
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}

function downloadQRCode() {
  if (!qrCodeUrl.value) return

  const a = document.createElement('a')
  a.href = qrCodeUrl.value
  a.download = 'qrcode.png'
  a.click()
}
</script>

<style scoped>
.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: monospace;
}

.qr-preview {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}

.qr-image {
  width: 200px;
  height: 200px;
  margin: 0 auto var(--spacing-md);
  border-radius: var(--radius-sm);
  background: white;
  padding: var(--spacing-sm);
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
