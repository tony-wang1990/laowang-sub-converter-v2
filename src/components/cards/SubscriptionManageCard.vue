<template>
  <div class="subscription-manage-card card animate-slide-in delay-100">
    <div class="card-content">
      <h3 class="card-title">📋 订阅管理</h3>
      
      <div class="action-row">
        <button class="btn btn-primary btn-sm" @click="showAdd = true">
          + 添加订阅
        </button>
      </div>



      <div v-if="loading" class="loading">
        <span class="animate-spin">⚙️</span>
        <span>加载中...</span>
      </div>

      <div v-else-if="subscriptions.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="empty-text">还没有订阅</p>
        <p class="empty-hint">点击上方按钮添加</p>
      </div>

      <div v-else class="subscription-list">
        <div class="list-header">
           <span class="sub-count-text">✅ 已订阅 {{ subscriptions.length }} 个机场</span>
        </div>
        <div class="list-items">
          <div v-for="sub in subscriptions" :key="sub.id" class="sub-item">
            <div class="sub-info">
              <div class="sub-name">{{ sub.name }}</div>
              <div class="sub-url" :title="sub.url">{{ sub.url }}</div>
            </div>
            <div class="sub-actions">
              <button class="btn-icon" @click="copySub(sub)" title="复制链接">
                📋
              </button>
              <button class="btn-icon" @click="editSub(sub)" title="编辑">
                ✏️
              </button>
              <button class="btn-icon delete" @click="deleteSub(sub)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑对话框 -->
      <div v-if="showAdd || editingId" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h4>{{ editingId ? '编辑订阅' : '添加订阅' }}</h4>
          <div class="form-group">
            <label class="form-label">名称</label>
            <input v-model="formData.name" class="input" placeholder="我的订阅" />
          </div>
          <div class="form-group">
            <label class="form-label">URL</label>
            <input v-model="formData.url" class="input" placeholder="https://..." />
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="saveSub">保存</button>
          </div>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-modal">
          <div class="confirm-icon">⚠️</div>
          <h4 class="confirm-title">确认删除</h4>
          <p class="confirm-message">确定要删除订阅「{{ deletingSubName }}」吗？</p>
          <p class="confirm-hint">此操作不可恢复</p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

const subscriptions = ref<any[]>([])
const loading = ref(false)

// 强制修复样式
const forceFixInputColor = () => {
  // 使用多重重试机制确保DOM已渲染
  const applyStyles = () => {
    // 修复订阅列表背景
    const subLists = document.querySelectorAll('.subscription-list')
    subLists.forEach((list: any) => {
      // 这里的important必须通过cssText设置或者setProperty
      list.style.cssText += 'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important; padding: 24px !important; border-radius: 12px !important; margin-top: 16px !important;'
    })
    
    // 修复文字颜色
    const whiteTextElements = document.querySelectorAll('.sub-count-text')
    whiteTextElements.forEach((el: any) => {
      el.style.setProperty('color', '#ffffff', 'important')
    })
  }

  nextTick(() => {
    applyStyles()
    // 额外延时再次应用，防止v-if渲染延迟
    setTimeout(applyStyles, 100)
    setTimeout(applyStyles, 300)
  })
}

watch(subscriptions, () => {
  if (subscriptions.value.length > 0) {
    forceFixInputColor()
  }
}, { deep: true })
const showAdd = ref(false)
const editingId = ref<number | null>(null)
const formData = ref({ name: '', url: '' })

// 删除确认对话框状态
const showDeleteConfirm = ref(false)
const deletingId = ref<number | null>(null)
const deletingSubName = ref('')

onMounted(() => {
  loadSubscriptions()
  forceFixInputColor()
})

async function loadSubscriptions() {
  loading.value = true
  try {
    const response = await fetch('/api/subscriptions')
    const data = await response.json()
    subscriptions.value = data.data || []
  } catch (error) {
    console.error('Failed to load subscriptions:', error)
  } finally {
    loading.value = false
  }
}

function editSub(sub: any) {
  editingId.value = sub.id
  formData.value = { name: sub.name, url: sub.url }
}

async function saveSub() {
  try {
    const method = editingId.value ? 'PUT' : 'POST'
    const url = editingId.value 
      ? `/api/subscriptions/${editingId.value}` 
      : '/api/subscriptions'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    
    closeModal()
    loadSubscriptions()
  } catch (error) {
    alert('保存失败')
  }
}

function deleteSub(sub: any) {
  deletingId.value = sub.id
  deletingSubName.value = sub.name
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deletingId.value) return
  
  try {
    const response = await fetch(`/api/subscriptions/${deletingId.value}`, { method: 'DELETE' })
    
    if (!response.ok) {
      throw new Error('Delete request failed')
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Delete failed')
    }
    
    showDeleteConfirm.value = false
    deletingId.value = null
    deletingSubName.value = ''
    loadSubscriptions()
  } catch (error) {
    console.error('Delete error:', error)
    const err = error as Error
    alert('删除失败：' + err.message)
    showDeleteConfirm.value = false
  }
}

// 复制订阅链接
async function copySub(sub: any) {
  try {
    await navigator.clipboard.writeText(sub.url)
    // 静默复制，不显示弹窗
  } catch (error) {
    console.error('Copy failed:', error)
    // 降级方案：使用传统方法
    const textarea = document.createElement('textarea')
    textarea.value = sub.url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      // 静默复制，不显示弹窗
    } catch (err) {
      console.error('Fallback copy failed:', err)
    }
    document.body.removeChild(textarea)
  }
}

function closeModal() {
  showAdd.value = false
  editingId.value = null
  formData.value = { name: '', url: '' }
}
</script>

<style scoped>
.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  height: 100%;
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  text-align: center;
  width: 100%;
}

.action-row {
  margin-bottom: 16px;
  text-align: center;
}

.btn-sm {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}


.subscription-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  /* 强制使用紫色渐变背景 */
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
  flex-grow: 1; /* 这里让列表填充剩余空间 */
}

.list-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sub-count-text {
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  max-height: 480px; /* 增加高度以显示更多项目（约5个） */
  overflow-y: auto;
  padding-right: 4px;
  flex-grow: 1; /* 让内容区域填充剩余空间 */
}

/* 美化滚动条 */
.list-items::-webkit-scrollbar {
  width: 6px;
}
.list-items::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.list-items::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
  width: 100%;
}

.sub-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(255, 255, 255, 0.8);
}



.sub-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  max-width: 400px !important;
}

.sub-name {
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.sub-url {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  max-width: 300px !important;
  display: block;
}

.sub-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal h4 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  margin-left: 4px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  height: 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: #94a3b8;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 32px;
}

.modal-actions .btn {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-actions .btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.modal-actions .btn-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-actions .btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.modal-actions .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

/* 自定义确认对话框 */
.confirm-modal {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: confirmSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
}

@keyframes confirmSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirm-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.confirm-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.confirm-message {
  font-size: 16px;
  color: #475569;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.confirm-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* 检测结果样式 */
.results-panel {
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
  max-height: 300px;
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
}

.node-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>
