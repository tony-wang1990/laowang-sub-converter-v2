<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="qr-modal-overlay" @click="handleClose">
        <div class="qr-modal-content" @click.stop>
          <div class="qr-modal-header">
            <h3>{{ title || '扫描二维码' }}</h3>
            <button class="close-btn" @click="handleClose">✕</button>
          </div>

          <div class="qr-modal-body">
            <div v-if="loading" class="qr-loading">
              <div class="spinner"></div>
              <p>生成中...</p>
            </div>

            <div v-else-if="error" class="qr-error">
              <span class="error-icon">⚠️</span>
              <p>{{ error }}</p>
              <button class="btn btn-secondary" @click="retry">重试</button>
            </div>

            <div v-else class="qr-image-container">
              <img :src="qrImageSrc" alt="QR Code" class="qr-image" />
              <p class="qr-url">{{ truncateUrl(url) }}</p>
            </div>
          </div>

          <div class="qr-modal-footer">
            <button class="btn btn-primary" @click="downloadQRCode" :disabled="loading || !!error">
              💾 下载二维码
            </button>
            <button class="btn btn-secondary" @click="handleClose">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  url: string
  title?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  url: '',
  title: '',
  size: 300
})

const emit = defineEmits<{
  close: []
}>()

const qrImageSrc = ref('')
const loading = ref(false)
const error = ref('')

// Watch for visibility and URL changes
watch([() => props.visible, () => props.url], async ([newVisible, newUrl]) => {
  if (newVisible && newUrl) {
    await generateQRCode()
  }
}, { immediate: true })

const generateQRCode = async () => {
  if (!props.url) return

  loading.value = true
  error.value = ''
  qrImageSrc.value = ''

  try {
    const response = await fetch(
      `/api/qrcode?text=${encodeURIComponent(props.url)}&size=${props.size}`
    )

    if (!response.ok) {
      throw new Error('生成二维码失败')
    }

    const data = await response.json()
    qrImageSrc.value = data.dataUrl
  } catch (err: any) {
    console.error('QR Code generation error:', err)
    error.value = err.message || '生成二维码失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  generateQRCode()
}

const handleClose = () => {
  emit('close')
}

const downloadQRCode = () => {
  if (!qrImageSrc.value) return

  const link = document.createElement('a')
  link.href = qrImageSrc.value
  link.download = `qrcode-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const truncateUrl = (url: string, maxLength = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.qr-modal-content {
  background: var(--glass-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease;
}

.qr-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.qr-modal-header h3 {
  font-size: var(--font-size-lg);
  color: var(--color-accent-cyan);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.qr-modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 300px;
  justify-content: center;
}

.qr-loading,
.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 212, 255, 0.2);
  border-top-color: var(--color-accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-error {
  color: var(--color-accent-pink);
}

.error-icon {
  font-size: 3rem;
}

.qr-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-image {
  width: 300px;
  height: 300px;
  background: white;
  padding: 1rem;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.qr-url {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
  word-break: break-all;
  max-width: 100%;
}

.qr-modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  justify-content: center;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .qr-modal-content,
.modal-leave-active .qr-modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .qr-modal-content,
.modal-leave-to .qr-modal-content {
  transform: scale(0.9) translateY(-20px);
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .qr-modal-content {
    max-width: 95%;
  }

  .qr-image {
    width: 250px;
    height: 250px;
  }

  .qr-modal-footer {
    flex-direction: column;
  }

  .qr-modal-footer .btn {
    width: 100%;
  }
}
</style>
