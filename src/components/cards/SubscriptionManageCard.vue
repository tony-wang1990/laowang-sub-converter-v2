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
        <div v-for="sub in subscriptions" :key="sub.id" class="sub-item">
          <div class="sub-info">
            <div class="sub-name">{{ sub.name }}</div>
            <div class="sub-url">{{ sub.url }}</div>
          </div>
          <div class="sub-actions">
            <button class="btn-icon" @click="editSub(sub)" title="编辑">
              ✏️
            </button>
            <button class="btn-icon" @click="deleteSub(sub.id)" title="删除">
              🗑️
            </button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const subscriptions = ref<any[]>([])
const loading = ref(false)
const showAdd = ref(false)
const editingId = ref<number | null>(null)
const formData = ref({ name: '', url: '' })

onMounted(() => loadSubscriptions())

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

async function deleteSub(id: number) {
  if (!confirm('确定删除此订阅？')) return
  
  try {
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    loadSubscriptions()
  } catch (error) {
    alert('删除失败')
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
  min-height: 280px;
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
  gap: 12px;
  width: 100%;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.sub-item:hover {
  background: var(--bg-card);
}

.sub-info {
  flex: 1;
  overflow: hidden;
}

.sub-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.sub-url {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
