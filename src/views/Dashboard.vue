<template>
  <div class="modern-dashboard">
    <!-- 浮动装饰元素 -->
    <div class="bg-decoration">
      <div class="blob blob-1 animate-float"></div>
      <div class="blob blob-2 animate-float" style="animation-delay: 1s"></div>
      <div class="blob blob-3 animate-float" style="animation-delay: 2s"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-wrapper">
        <div class="brand">
          <div class="brand-icon">⚡</div>
          <h1 class="brand-name">LaoWang SubConverter V2.0</h1>
        </div>

        <nav class="main-nav">
          <button class="nav-item"  @click="scrollTo('convert')">
            <span class="nav-icon">🔄</span>
            <span class="nav-label">转换</span>
          </button>
          <button class="nav-item" @click="scrollTo('manage')">
            <span class="nav-icon">📋</span>
            <span class="nav-label">管理</span>
          </button>
          <button class="nav-item" @click="scrollTo('tools')">
            <span class="nav-icon">🛠️</span>
            <span class="nav-label">工具</span>
          </button>
        </nav>

        <div class="header-actions">
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- 统计卡片 -->
    <section class="stats-showcase">
      <div class="stats-wrapper">
        <div class="stat-item glass-card animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="stat-header">
            <span class="stat-icon">📊</span>
            <span class="stat-label">订阅总数</span>
          </div>
          <div class="stat-value">{{ stats.totalSubscriptions }}</div>
          <div class="stat-trend">
            <span class="trend-icon">📈</span>
            <span class="trend-text">活跃中</span>
          </div>
        </div>

        <div class="stat-item glass-card animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="stat-header">
            <span class="stat-icon">🔄</span>
            <span class="stat-label">转换次数</span>
          </div>
          <div class="stat-value">{{ stats.conversions }}</div>
          <div class="stat-trend">
            <span class="trend-icon">⚡</span>
            <span class="trend-text">稳定运行</span>
          </div>
        </div>

        <div class="stat-item glass-card animate-fade-in-up" style="animation-delay: 0.3s">
          <div class="stat-header">
            <span class="stat-icon">🔗</span>
            <span class="stat-label">短链数量</span>
          </div>
          <div class="stat-value">{{ stats.onlineNodes }}</div>
          <div class="stat-trend">
            <span class="trend-icon">✅</span>
            <span class="trend-text">可用</span>
          </div>
        </div>

        <div class="stat-item glass-card animate-fade-in-up" style="animation-delay: 0.4s">
          <div class="stat-header">
            <span class="stat-icon">🌐</span>
            <span class="stat-label">支持客户端</span>
          </div>
          <div class="stat-value">{{ stats.clients }}</div>
          <div class="stat-trend">
            <span class="trend-icon">💯</span>
            <span class="trend-text">全面支持</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 主要功能区 -->
    <main class="content-area">
      <!-- 快速转换 -->
      <section id="convert" class="feature-block">
        <div class="block-header">
          <h2 class="block-title">
            <span class="title-icon">🔄</span>
            <span>快速转换</span>
          </h2>
          <p class="block-desc">支持多种客户端格式，一键快速转换</p>
        </div>
        <QuickConvertCard />
      </section>

      <!-- 订阅管理 -->
      <section id="manage" class="feature-block">
        <div class="block-header">
          <h2 class="block-title">
            <span class="title-icon">📋</span>
            <span>订阅管理</span>
          </h2>
          <p class="block-desc">轻松管理你的订阅链接，实时节点测速</p>
        </div>
        <div class="two-col-grid">
          <SubscriptionManageCard />
          <SpeedTestCard />
        </div>
      </section>

      <!-- 实用工具 -->
      <section id="tools" class="feature-block">
        <div class="block-header">
          <h2 class="block-title">
            <span class="title-icon">🛠️</span>
            <span>实用工具</span>
          </h2>
          <p class="block-desc">丰富的辅助工具，提升使用体验</p>
        </div>
        <div class="three-col-grid">
          <ShortLinkCard />
          <QRCodeCard />
          <BatchConvertCard />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import QuickConvertCard from '../components/cards/QuickConvertCard.vue'
import SubscriptionManageCard from '../components/cards/SubscriptionManageCard.vue'
import SpeedTestCard from '../components/cards/SpeedTestCard.vue'
import ShortLinkCard from '../components/cards/ShortLinkCard.vue'
import QRCodeCard from '../components/cards/QRCodeCard.vue'
import BatchConvertCard from '../components/cards/BatchConvertCard.vue'

const stats = ref({
  totalSubscriptions: 0,
  conversions: 0,
  onlineNodes: 0,
  clients: 25
})

onMounted(async () => {
  await loadStats()
  setInterval(loadStats, 30000)
})

async function loadStats() {
  try {
    // Get subscriptions from API
    const subsResponse = await fetch('/api/subscriptions')
    if (subsResponse.ok) {
      const subsData = await subsResponse.json()
      stats.value.totalSubscriptions = subsData.data?.length || 0
    }
    
    // Get conversions from localStorage
    stats.value.conversions = parseInt(localStorage.getItem('conversions') || '0')
    
    // Get short links count
    try {
      const linksResponse = await fetch('/api/shortlink/list')
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        stats.value.onlineNodes = linksData.links?.length || 0
      }
    } catch {
      stats.value.onlineNodes = 0
    }
    
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

function scrollTo(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.modern-dashboard {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* ==== 背景装饰 ==== */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  top: -200px;
  right: -200px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
  bottom: -150px;
  left: -150px;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ==== 顶部导航 ==== */
.top-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.header-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: var(--shadow-md);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.brand-version {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* ==== 统计展示 ==== */
.stats-showcase {
  position: relative;
  z-index: 1;
  padding: 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-item {
  padding: 28px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-full);
  width: fit-content;
}

.trend-icon {
  font-size: 14px;
}

.trend-text {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
}

/* ==== 主要内容 ==== */
.content-area {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 80px;
}

.feature-block {
  margin-bottom: 64px;
}

.block-header {
  margin-bottom: 32px;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.title-icon {
  font-size: 40px;
  filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
}

.block-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.two-col-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.three-col-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.three-col-grid .card {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  min-height: 400px !important;
}

.three-col-grid .card-body {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
}

.three-col-grid .card-body > .btn {
  margin-top: auto !important;
}

.three-col-grid .card-body > .form-group:last-of-type {
  margin-bottom: auto !important;
}

/* ==== 响应式 ==== */
@media (max-width: 1400px) {
  .stats-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .header-wrapper,
  .stats-showcase,
  .content-area {
    padding-left: 28px;
    padding-right: 28px;
  }

  .two-col-grid {
    grid-template-columns: 1fr;
  }

  .three-col-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .stats-wrapper,
  .three-col-grid {
    grid-template-columns: 1fr;
  }

  .block-title {
    font-size: 28px;
  }

  .stat-value {
    font-size: 40px;
  }
}

@media (max-width: 480px) {
  .header-wrapper,
  .stats-showcase,
  .content-area {
    padding-left: 20px;
    padding-right: 20px;
  }

  .brand-icon {
    width: 48px;
    height: 48px;
    font-size: 28px;
  }

  .brand-name {
    font-size: 20px;
  }
}
</style>
