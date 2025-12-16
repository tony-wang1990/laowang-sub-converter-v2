<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title animate-fade-in">
            <span class="text-gradient">{{ $t('hero.title') }}</span>
          </h1>
          <p class="hero-subtitle animate-fade-in">
            {{ $t('hero.subtitle') }}
          </p>
          <div class="hero-actions animate-fade-in">
            <router-link to="/converter" class="btn btn-primary">
              🚀 {{ $t('hero.start') }}
            </router-link>
            <router-link to="/about" class="btn btn-secondary">
              📖 {{ $t('hero.docs') }}
            </router-link>
          </div>
        </div>

        <div class="hero-visual">
          <div class="glow-orb orb-1"></div>
          <div class="glow-orb orb-2"></div>
          <div class="floating-card card-1">
            <span class="card-icon">🔄</span>
            <span>Config</span>
          </div>
          <div class="floating-card card-2">
            <span class="card-icon">⚡</span>
            <span>Profile</span>
          </div>
          <div class="floating-card card-3">
            <span class="card-icon">🚀</span>
            <span>Link</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title text-center">
          <span class="text-gradient">核心功能</span>
        </h2>
        
        <div class="features-grid">
          <div class="feature-card glass-card">
            <div class="feature-icon">🔄</div>
            <h3>多协议支持</h3>
            <p>支持多种主流网络通讯协议配置与管理</p>
          </div>
          
          <div class="feature-card glass-card">
            <div class="feature-icon">📱</div>
            <h3>多平台适配</h3>
            <p>一键转换为多种桌面及移动端应用兼容的格式</p>
          </div>
          
          <div class="feature-card glass-card">
            <div class="feature-icon">🔗</div>
            <h3>短链接服务</h3>
            <p>生成短链接便于分享，支持访问统计和管理</p>
          </div>
          
          <div class="feature-card glass-card">
            <div class="feature-icon">🌍</div>
            <h3>多语言支持</h3>
            <p>支持中文、英文、俄语、波斯语等多种语言界面</p>
          </div>
          
          <div class="feature-card glass-card">
            <div class="feature-icon">🐳</div>
            <h3>多种部署方式</h3>
            <p>支持 Docker、Cloudflare、Vercel、VPS 等多种部署方式</p>
          </div>
          
          <div class="feature-card glass-card">
            <div class="feature-icon">⚙️</div>
            <h3>高级配置</h3>
            <p>端点过滤、重命名、排序、Emoji 添加等高级功能</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Clients Section -->
    <section class="clients">
      <div class="container">
        <h2 class="section-title text-center">
          <span class="text-gradient">支持的平台</span>
        </h2>
        
        <div class="clients-grid">
          <div class="client-badge" v-for="client in supportedClients" :key="client.name">
            <img :src="client.icon" :alt="client.name" class="client-icon-img" />
            <span class="client-name">{{ client.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-card glass-card">
          <h2>开始使用</h2>
          <p>立即体验专业的配置管理服务</p>
          <router-link to="/converter" class="btn btn-primary">
            🚀 开始转换
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 导入客户端图标
import clashIcon from '@/assets/icons/clients/clash.svg'
import clashmetaIcon from '@/assets/icons/clients/clashmeta.svg'
import surgeIcon from '@/assets/icons/clients/surge.svg'
import quantumultxIcon from '@/assets/icons/clients/quantumultx.svg'
import shadowrocketIcon from '@/assets/icons/clients/shadowrocket.svg'
import loonIcon from '@/assets/icons/clients/loon.svg'
import v2raynIcon from '@/assets/icons/clients/v2rayn.svg'
import v2rayngIcon from '@/assets/icons/clients/v2rayng.svg'
import surfboardIcon from '@/assets/icons/clients/surfboard.svg'
import stashIcon from '@/assets/icons/clients/stash.svg'
import singboxIcon from '@/assets/icons/clients/singbox.svg'

interface Client {
  name: string;
  icon: string;
}

const supportedClients: Client[] = [
  { name: 'Clash', icon: clashIcon },
  { name: 'Clash Meta', icon: clashmetaIcon },
  { name: 'Surge', icon: surgeIcon },
  { name: 'Quantumult X', icon: quantumultxIcon },
  { name: 'Shadowrocket', icon: shadowrocketIcon },
  { name: 'Loon', icon: loonIcon },
  { name: 'V2RayN', icon: v2raynIcon },
  { name: 'V2RayNG', icon: v2rayngIcon },
  { name: 'Surfboard', icon: surfboardIcon },
  { name: 'Stash', icon: stashIcon },
  { name: 'sing-box', icon: singboxIcon }
]
</script>

<style scoped>
.home {
  padding-top: 70px;
}

/* Hero */
.hero {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-visual {
  position: relative;
  height: 400px;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: var(--color-accent-cyan);
  top: 20%;
  left: 10%;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: var(--color-accent-purple);
  bottom: 20%;
  right: 10%;
  animation-delay: -3s;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-weight: 500;
  animation: float 4s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: 20%;
}

.card-2 {
  top: 50%;
  right: 20%;
  animation-delay: -1s;
}

.card-3 {
  bottom: 20%;
  left: 30%;
  animation-delay: -2s;
}

.card-icon {
  font-size: 1.5rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Features */
.features {
  padding: 6rem 0;
}

.section-title {
  font-size: var(--font-size-3xl);
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 2rem;
  text-align: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-glow-cyan);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Clients */
.clients {
  padding: 4rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.clients-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.client-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.client-badge:hover {
  border-color: var(--color-accent-cyan);
  transform: scale(1.05);
}

.client-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* CTA */
.cta {
  padding: 6rem 0;
}

.cta-card {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--gradient-card);
}

.cta-card h2 {
  font-size: var(--font-size-3xl);
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-card p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }
}
</style>
