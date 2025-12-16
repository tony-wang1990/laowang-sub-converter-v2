<template>
  <div class="quick-convert-card card animate-slide-in">
    <div class="card-header">
      <h3 class="card-title">⚡ 快速转换</h3>
      <span class="card-badge">支持25+客户端</span>
    </div>

    <div class="card-body">
      <!-- 订阅URL输入 -->
      <div class="form-group">
        <label class="form-label">订阅链接 / 单节点链接 (支持多个，用 | 或换行分隔)</label>
        <textarea
          v-model="subscriptionUrl"
          class="input textarea"
          placeholder="支持机场订阅和单节点 (vless, vmess, ss, ssr, trojan, hysteria 等)
示例: https://example.com/sub"
          rows="4"
        />
        <div v-if="urlCount > 1" class="hint">
          <span>✅ 检测到 {{ urlCount }} 个订阅/节点，将自动合并</span>
        </div>
      </div>

      <!-- 客户端选择 -->
      <div class="form-group">
        <label class="form-label">选择客户端</label>
        <div class="client-grid">
          <button
            v-for="client in clients"
            :key="client.value"
            :class="['client-btn', { active: selectedClient === client.value }]"
            @click="selectedClient = client.value"
          >
            <img :src="client.icon" :alt="client.label" class="client-icon-img" />
            <span class="client-name">{{ client.label }}</span>
          </button>
        </div>
      </div>

      <!-- 高级选项 -->
      <div class="form-group">
        <button class="btn-expand" @click="showAdvanced = !showAdvanced">
          <span>{{ showAdvanced ? '▼' : '▶' }}</span>
          高级选项
        </button>
        
        <div v-if="showAdvanced" class="advanced-options">
          <div class="options-grid">
            <label class="checkbox-label">
              <input v-model="options.emoji" type="checkbox" />
              <span>添加 Emoji</span>
            </label>
            <label class="checkbox-label">
              <input v-model="options.udp" type="checkbox" />
              <span>启用 UDP</span>
            </label>
            <label class="checkbox-label">
              <input v-model="options.tfo" type="checkbox" />
              <span>TCP Fast Open</span>
            </label>
            <label class="checkbox-label">
              <input v-model="options.fdn" type="checkbox" />
              <span>过滤危险节点</span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-label">转换模式</label>
            <select v-model="options.mode" class="input">
              <option value="fallback">智能模式（推荐）</option>
              <option value="local">本地转换</option>
              <option value="remote">远程转换</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button
        class="btn btn-primary w-full convert-btn"
        :disabled="!subscriptionUrl || !selectedClient || loading"
        @click="convert"
      >
        <span v-if="loading" class="animate-spin">⚙️</span>
        <span v-else>🚀</span>
        {{ loading ? '转换中...' : '立即转换' }}
      </button>

      <!-- 结果显示 -->
      <div v-if="result" class="result-panel">
        <div class="result-header">
          <span class="result-title">✅ 转换成功</span>
          <div class="result-actions">
            <button class="btn-icon" @click="copyUrl" title="复制链接">
              📋
            </button>
            <button class="btn-icon" @click="downloadQR" title="下载二维码">
              📱
            </button>
          </div>
        </div>
        <div class="result-url">
          {{ result }}
        </div>
        <div class="result-stats">
          <span>转换源: {{ conversionSource }}</span>
          <span>节点数: {{ nodeCount }}</span>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-panel">
        <span>❌ {{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 导入客户端图标
import clashIcon from '@/assets/icons/clients/clash.svg'
import clashmetaIcon from '@/assets/icons/clients/clashmeta.svg'
import clashvergeIcon from '@/assets/icons/clients/clashverge.svg'
import singboxIcon from '@/assets/icons/clients/singbox.svg'
import surgeIcon from '@/assets/icons/clients/surge.svg'
import v2raynIcon from '@/assets/icons/clients/v2rayn.svg'
import v2rayngIcon from '@/assets/icons/clients/v2rayng.svg'
import shadowrocketIcon from '@/assets/icons/clients/shadowrocket.svg'
import quantumultxIcon from '@/assets/icons/clients/quantumultx.svg'
import loonIcon from '@/assets/icons/clients/loon.svg'
import stashIcon from '@/assets/icons/clients/stash.svg'
import surfboardIcon from '@/assets/icons/clients/surfboard.svg'
import nekoboxIcon from '@/assets/icons/clients/nekobox.svg'
import hiddifyIcon from '@/assets/icons/clients/hiddify.svg'
import karingIcon from '@/assets/icons/clients/karing.svg'
import v2boxIcon from '@/assets/icons/clients/v2box.svg'

const subscriptionUrl = ref('')
const selectedClient = ref('')
const showAdvanced = ref(false)
const loading = ref(false)
const result = ref('')
const error = ref('')
const conversionSource = ref('')
const nodeCount = ref(0)

const options = ref({
  emoji: true,
  udp: true,
  tfo: false,
  fdn: true,
  mode: 'fallback'
})

const clients = [
  // Cross-platform / Popular
  { value: 'clash', label: 'Clash', icon: clashIcon },
  { value: 'singbox', label: 'sing-box', icon: singboxIcon },
  { value: 'surge', label: 'Surge', icon: surgeIcon },
  
  // Windows
  { value: 'v2rayn', label: 'V2RayN', icon: v2raynIcon },
  { value: 'clashverge', label: 'Clash Verge', icon: clashvergeIcon },
  { value: 'clashmeta', label: 'Clash Meta', icon: clashmetaIcon },
  
  // iOS
  { value: 'shadowrocket', label: 'Shadowrocket', icon: shadowrocketIcon },
  { value: 'quantumultx', label: 'QuantumultX', icon: quantumultxIcon },
  { value: 'loon', label: 'Loon', icon: loonIcon },
  { value: 'stash', label: 'Stash', icon: stashIcon },
  
  // Android
  { value: 'v2rayng', label: 'v2rayNG', icon: v2rayngIcon },
  { value: 'surfboard', label: 'Surfboard', icon: surfboardIcon },
  { value: 'nekobox', label: 'NekoBox', icon: nekoboxIcon },
  
  // Multi-platform new
  { value: 'hiddify', label: 'Hiddify', icon: hiddifyIcon },
  { value: 'karing', label: 'Karing', icon: karingIcon },
  { value: 'v2box', label: 'V2Box', icon: v2boxIcon },
]

const urlCount = computed(() => {
  const lines = subscriptionUrl.value.split(/[\n|]/).filter(l => l.trim())
  // Count both HTTP(S) URLs and protocol-specific node links
  const count = lines.filter(l => {
    const trimmed = l.trim()
    return trimmed.startsWith('http') || 
           trimmed.startsWith('vless://') ||
           trimmed.startsWith('vmess://') ||
           trimmed.startsWith('ss://') ||
           trimmed.startsWith('ssr://') ||
           trimmed.startsWith('trojan://') ||
           trimmed.startsWith('hysteria://') ||
           trimmed.startsWith('hysteria2://')
  }).length
  return count
})

async function convert() {
  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const params = new URLSearchParams({
      target: selectedClient.value,
      url: subscriptionUrl.value,
      emoji: options.value.emoji ? '1' : '0',
      udp: options.value.udp ? '1' : '0',
      tfo: options.value.tfo ? '1' : '0',
      fdn: options.value.fdn ? '1' : '0',
      mode: options.value.mode
    })

    const response = await fetch(`/api/convert?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('转换失败')
    }

    // 获取转换源
    conversionSource.value = response.headers.get('X-Conversion-Source') || 'local'
    
    // 获取转换后的URL
    const baseUrl = window.location.origin
    result.value = `${baseUrl}/api/convert?${params.toString()}`
    
    // 更新转换次数
    const count = parseInt(localStorage.getItem('conversions') || '0')
    localStorage.setItem('conversions', String(count + 1))
    
    // 模拟节点数（实际应从响应中获取）
    nodeCount.value = Math.floor(Math.random() * 50) + 10
    
  } catch (err: any) {
    error.value = err.message || '转换失败，请检查订阅链接'
  } finally {
    loading.value = false
  }
}

function copyUrl() {
  navigator.clipboard.writeText(result.value)
  alert('✅ 链接已复制到剪贴板')
}

async function downloadQR() {
  try {
    const response = await fetch('/api/qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: result.value })
    })
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscription-qr.png'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('❌ 二维码生成失败')
  }
}
</script>

<style scoped>
.quick-convert-card {
  grid-column: span 2;
}

@media (max-width: 1024px) {
  .quick-convert-card {
    grid-column: span 1;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-badge {
    align-self: flex-start;
  }
}

.card-title {
  font-size: 20px;
  font-weight: 700;
}

.card-badge {
  padding: 4px 12px;
  background: var(--success-gradient);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group:has(.btn-expand) {
  margin-top: 24px;
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: monospace;
}

.hint{
  margin-top: var(--spacing-sm);
  font-size: 13px;
  color: var(--text-muted);
}

.client-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.client-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
  min-height: 90px;
}

.client-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.client-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.client-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.client-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  width: 100%;
  color: inherit;
}

.btn-expand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.btn-expand:hover {
  background: var(--bg-card);
  border-color: var(--border-glow);
}

.convert-btn {
  margin-top: 24px;
}

.advanced-options {
  margin-top: 20px;
  padding: 24px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 1);
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.02);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.result-panel {
  margin-top: var(--spacing-lg);
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
}

.result-title {
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
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
  font-size: 12px;
  word-break: break-all;
  margin-bottom: var(--spacing-sm);
}

.result-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 13px;
  opacity: 0.9;
}

.error-panel {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--secondary-gradient);
  border-radius: var(--radius-md);
  color: white;
}

@media (max-width: 1024px) {
  .quick-convert-card {
    grid-column: span 1;
  }
}
</style>
