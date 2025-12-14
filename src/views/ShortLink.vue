<template>
  <div class="shortlink-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="text-gradient">{{ $t('shortlink.title') }}</span>
        </h1>
        <p class="page-subtitle">{{ $t('shortlink.subtitle') }}</p>
      </div>

      <div class="shortlink-content">
        <!-- 创建短链接 -->
        <div class="create-form glass-card">
          <h3>{{ $t('shortlink.create') }}</h3>
          <div class="form-row">
            <input 
              type="text" 
              class="form-input"
              v-model="originalUrl"
              :placeholder="$t('converter.inputPlaceholder')"
            />
            <button 
              class="btn btn-primary" 
              @click="createShortLink"
              :disabled="!originalUrl || loading"
            >
              {{ loading ? '...' : '🔗' }}
            </button>
          </div>

          <div v-if="newShortLink" class="new-link-result">
            <span class="label">短链接：</span>
            <input type="text" class="form-input" :value="newShortLink" readonly />
            <button class="btn btn-secondary" @click="copyNewLink" title="复制链接">
              📋
            </button>
            <button class="btn btn-secondary" @click="showQRForNewLink" title="查看二维码">
              📱
            </button>
          </div>
        </div>

        <!-- 短链接列表 -->
        <div class="links-list glass-card">
          <h3>{{ $t('shortlink.yourLinks') }}</h3>
          
          <div v-if="shortLinks.length === 0" class="empty-state">
            <span class="empty-icon">🔗</span>
            <p>{{ $t('shortlink.noLinks') }}</p>
          </div>

          <div v-else class="links-table">
            <div class="table-header">
              <span>{{ $t('shortlink.shortUrl') }}</span>
              <span>{{ $t('shortlink.originalUrl') }}</span>
              <span>{{ $t('shortlink.clicks') }}</span>
              <span>{{ $t('shortlink.created') }}</span>
              <span></span>
            </div>
            
            <div 
              v-for="link in shortLinks" 
              :key="link.id" 
              class="table-row"
            >
              <span class="short-url">{{ link.shortUrl }}</span>
              <span class="original-url" :title="link.originalUrl">
                {{ truncateUrl(link.originalUrl) }}
              </span>
              <span class="clicks">{{ link.clicks }}</span>
              <span class="created">{{ formatDate(link.createdAt) }}</span>
              <span class="actions">
                <button class="btn-icon" @click="copyLink(link.shortUrl)" title="复制链接">📋</button>
                <button class="btn-icon" @click="showQRForLink(link.shortUrl)" title="查看二维码">📱</button>
                <button class="btn-icon delete" @click="deleteLink(link.id)" title="删除">🗑️</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <QRCodeModal 
      :visible="showQRModal" 
      :url="qrCodeUrl"
      @close="showQRModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import QRCodeModal from '../components/QRCodeModal.vue'

interface ShortLink {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date | string;
}

const originalUrl = ref('')
const newShortLink = ref('')
const loading = ref(false)
const error = ref('')

// QR Code modal state
const showQRModal = ref(false)
const qrCodeUrl = ref('')

// Real short links data from API
const shortLinks = reactive<ShortLink[]>([])

// Fetch short links from API
const fetchShortLinks = async () => {
  try {
    const response = await fetch('/api/shortlink/list')
    const data = await response.json()
    
    if (data.links) {
      shortLinks.splice(0, shortLinks.length, ...data.links.map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt)
      })))
    }
  } catch (err) {
    console.error('Failed to fetch short links:', err)
    error.value = '获取短链接列表失败'
  }
}

const createShortLink = async () => {
  if (!originalUrl.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/shortlink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: originalUrl.value })
    })

    if (!response.ok) {
      throw new Error('创建短链接失败')
    }

    const data = await response.json()
    newShortLink.value = data.shortUrl
    
    // Refresh the list
    await fetchShortLinks()
    
    originalUrl.value = ''
  } catch (err: any) {
    error.value = err.message || '创建短链接失败'
  } finally {
    loading.value = false
  }
}

const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    // You can add toast notification here
  } catch (err: any) {
    console.error('Copy failed:', err)
  }
}

const copyNewLink = () => copyLink(newShortLink.value)

const deleteLink = async (id: string) => {
  if (!confirm('确定要删除这个短链接吗？')) return
  
  try {
    const response = await fetch(`/api/shortlink/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('删除失败')
    }

    // Refresh the list
    await fetchShortLinks()
  } catch (err: any) {
    console.error('Delete failed:', err)
    error.value = '删除短链接失败'
  }
}

const truncateUrl = (url: string, maxLength = 40) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

// QR Code functions
const showQRForNewLink = () => {
  if (newShortLink.value) {
    qrCodeUrl.value = newShortLink.value
    showQRModal.value = true
  }
}

const showQRForLink = (url: string) => {
  qrCodeUrl.value = url
  showQRModal.value = true
}

// Load short links on mount
onMounted(() => {
  fetchShortLinks()
})
</script>

<style scoped>
.shortlink-page {
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

.shortlink-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-form,
.links-list {
  padding: 2rem;
}

.create-form h3,
.links-list h3 {
  margin-bottom: 1.5rem;
  font-size: var(--font-size-lg);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-input {
  flex: 1;
}

.new-link-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 212, 255, 0.1);
  border-radius: var(--radius-md);
}

.new-link-result .label {
  color: var(--color-accent-cyan);
  font-weight: 500;
}

.new-link-result .form-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.links-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 200px 1fr 80px 100px 120px;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.table-header {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.table-row {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.table-row:hover {
  background: rgba(0, 212, 255, 0.05);
}

.short-url {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--color-accent-cyan);
}

.original-url {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clicks {
  text-align: center;
  font-weight: 600;
}

.created {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(255, 0, 110, 0.2);
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 60px 60px;
  }

  .table-header span:nth-child(2),
  .table-row .original-url,
  .table-header span:nth-child(4),
  .table-row .created {
    display: none;
  }
}
</style>
