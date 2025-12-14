<template>
  <div class="result-panel" v-if="result">
    <div class="result-header">
      <h3>{{ $t('converter.title') }}</h3>
      <div class="result-actions">
        <button class="btn btn-secondary" @click="copyLink">
          <span v-if="!copied">📋 {{ $t('converter.copy') }}</span>
          <span v-else>✅ {{ $t('converter.copied') }}</span>
        </button>
        <button class="btn btn-secondary" @click="downloadConfig">
          💾 {{ $t('converter.download') }}
        </button>
        <button class="btn btn-ghost" @click="showQR = !showQR">
          📱 {{ $t('converter.qrcode') }}
        </button>
      </div>
    </div>

    <div class="result-url">
      <input 
        type="text" 
        class="form-input" 
        :value="result" 
        readonly 
        ref="urlInput"
      />
    </div>

    <transition name="fade">
      <div v-if="showQR" class="qr-container">
        <canvas ref="qrCanvas"></canvas>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  result?: string
}>(), {
  result: ''
})

const copied = ref(false)
const showQR = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.result)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // 降级方案
    urlInput.value?.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const downloadConfig = () => {
  const blob = new Blob([props.result], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'config.yaml'
  a.click()
  URL.revokeObjectURL(url)
}

// 使用 qrcode 库生成二维码
watch(() => props.result, (val) => {
  if (showQR.value && qrCanvas.value && val) {
    generateQR(val)
  }
})

watch(showQR, (val) => {
  if (val && props.result) {
    setTimeout(() => generateQR(props.result), 100)
  }
})

const generateQR = async (text: string) => {
  if (!qrCanvas.value) return
  
  try {
    await QRCode.toCanvas(qrCanvas.value, text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('QR Code generation failed:', err)
  }
}
</script>

<style scoped>
.result-panel {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: fadeIn 0.3s ease;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.result-header h3 {
  font-size: var(--font-size-lg);
  color: var(--color-accent-cyan);
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-url {
  margin-bottom: var(--spacing-md);
}

.result-url .form-input {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.qr-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
