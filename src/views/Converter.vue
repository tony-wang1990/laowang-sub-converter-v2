<template>
  <div class="converter-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="text-gradient">{{ $t('converter.title') }}</span>
        </h1>
        <p class="page-subtitle">{{ $t('converter.subtitle') }}</p>
      </div>

      <div class="converter-form glass-card">
        <!-- 订阅管理 -->
        <SubscriptionManager @select="(url) => subscriptionUrl = url" />

        <!-- 订阅链接输入 -->
        <div class="form-group">
          <label class="form-label">{{ $t('converter.inputLabel') }}</label>
          <textarea 
            class="form-textarea"
            v-model="subscriptionUrl"
            :placeholder="$t('converter.inputPlaceholder')"
            rows="4"
          ></textarea>
        </div>

        <!-- 客户端选择 -->
        <ClientSelector v-model="selectedClient" />

        <!-- 高级选项 -->
        <AdvancedOptions v-model="advancedOptions" />

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            @click="convertSubscription"
            :disabled="!subscriptionUrl || !selectedClient || loading"
          >
            <span v-if="loading">⏳ {{ $t('common.loading') }}</span>
            <span v-else>🔄 {{ $t('converter.convert') }}</span>
          </button>
          <button class="btn btn-secondary" @click="resetForm">
            🔄 {{ $t('converter.reset') }}
          </button>
        </div>

        <!-- 结果显示 -->
        <ResultPanel v-if="convertedUrl" :result="convertedUrl" />

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ClientSelector from '../components/ClientSelector.vue'
import AdvancedOptions from '../components/AdvancedOptions.vue'
import ResultPanel from '../components/ResultPanel.vue'
import SubscriptionManager from '../components/SubscriptionManager.vue'

const subscriptionUrl = ref('')
const selectedClient = ref('')
const advancedOptions = ref({
  emoji: true,
  udp: true,
  skipCert: false,
  sort: false,
  filter: '',
  rename: ''
})

const loading = ref(false)
const convertedUrl = ref('')
const error = ref('')

const convertSubscription = async () => {
  if (!subscriptionUrl.value || !selectedClient.value) return

  loading.value = true
  error.value = ''
  convertedUrl.value = ''

  try {
    // 构建转换 URL
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      target: selectedClient.value,
      url: subscriptionUrl.value,
      emoji: advancedOptions.value.emoji ? '1' : '0',
      udp: advancedOptions.value.udp ? '1' : '0',
      scert: advancedOptions.value.skipCert ? '1' : '0',
      sort: advancedOptions.value.sort ? '1' : '0'
    })

    if (advancedOptions.value.filter) {
      params.append('include', advancedOptions.value.filter)
    }

    if (advancedOptions.value.rename) {
      params.append('rename', advancedOptions.value.rename)
    }

    // 生成转换后的链接
    convertedUrl.value = `${baseUrl}/api/convert?${params.toString()}`

    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    error.value = message || '转换失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  subscriptionUrl.value = ''
  selectedClient.value = ''
  convertedUrl.value = ''
  error.value = ''
  advancedOptions.value = {
    emoji: true,
    udp: true,
    skipCert: false,
    sort: false,
    filter: '',
    rename: ''
  }
}
</script>

<style scoped>
.converter-page {
  padding-top: 100px;
  padding-bottom: 4rem;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: var(--font-size-3xl);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--color-text-secondary);
}

.converter-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.error-message {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 0, 110, 0.1);
  border: 1px solid rgba(255, 0, 110, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-accent-pink);
  text-align: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
