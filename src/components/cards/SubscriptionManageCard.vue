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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 90%;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}
</style>
