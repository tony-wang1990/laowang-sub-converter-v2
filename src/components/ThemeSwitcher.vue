<template>
  <div class="theme-switcher">
    <button class="theme-btn" @click="toggleDropdown" :title="currentTheme.name">
      <span class="theme-label">主题</span>
      <svg class="arrow" :class="{ rotated: isOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown">
        <button 
          v-for="theme in themes" 
          :key="theme.id"
          class="dropdown-item"
          :class="{ active: currentThemeId === theme.id }"
          @click="setTheme(theme.id)"
        >
          <span class="theme-color" :style="{ background: theme.colors.accentCyan }"></span>
          <span class="theme-name">{{ theme.name }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accentCyan: string;
  accentPurple: string;
}

interface Theme {
  id: string;
  name: string;
  icon: string;
  colors: ThemeColors;
}

const themes: Theme[] = [
  { id: 'default', name: '深邃蓝', icon: '🌌', colors: {
    primary: '#0a0a0f', secondary: '#12121a', tertiary: '#1a1a2e',
    accentCyan: '#00d4ff', accentPurple: '#7b2cbf'
  }},
  { id: 'ocean', name: '海洋蓝', icon: '🌊', colors: {
    primary: '#0a1628', secondary: '#0d1f3c', tertiary: '#132744',
    accentCyan: '#00b4d8', accentPurple: '#0077b6'
  }},
  { id: 'forest', name: '森林绿', icon: '🌲', colors: {
    primary: '#0a120a', secondary: '#0f1a0f', tertiary: '#162316',
    accentCyan: '#00ff88', accentPurple: '#2d6a4f'
  }},
  { id: 'sunset', name: '日落橙', icon: '🌅', colors: {
    primary: '#1a0a0a', secondary: '#241212', tertiary: '#2e1a1a',
    accentCyan: '#ff8c00', accentPurple: '#ff006e'
  }},
  { id: 'purple', name: '星空紫', icon: '🔮', colors: {
    primary: '#0f0a1a', secondary: '#150f24', tertiary: '#1e162e',
    accentCyan: '#a855f7', accentPurple: '#7c3aed'
  }},
  { id: 'rose', name: '玫瑰红', icon: '🌹', colors: {
    primary: '#140a10', secondary: '#1c1016', tertiary: '#26161e',
    accentCyan: '#fb7185', accentPurple: '#be123c'
  }},
  { id: 'gold', name: '金色年华', icon: '✨', colors: {
    primary: '#12100a', secondary: '#1a1610', tertiary: '#241e16',
    accentCyan: '#fbbf24', accentPurple: '#b45309'
  }},
  { id: 'mint', name: '薄荷清新', icon: '🍃', colors: {
    primary: '#0a1210', secondary: '#101a16', tertiary: '#16241e',
    accentCyan: '#34d399', accentPurple: '#059669'
  }}
]

const isOpen = ref(false)
const currentThemeId = ref('default')

const currentTheme = computed(() => {
  return themes.find(t => t.id === currentThemeId.value) || themes[0]
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const setTheme = (themeId: string) => {
  currentThemeId.value = themeId
  const theme = themes.find(t => t.id === themeId)
  if (theme) {
    applyTheme(theme.colors)
    localStorage.setItem('laowang-theme', themeId)
  }
  isOpen.value = false
}

const applyTheme = (colors: ThemeColors) => {
  const root = document.documentElement
  root.style.setProperty('--color-bg-primary', colors.primary)
  root.style.setProperty('--color-bg-secondary', colors.secondary)
  root.style.setProperty('--color-bg-tertiary', colors.tertiary)
  root.style.setProperty('--color-accent-cyan', colors.accentCyan)
  root.style.setProperty('--color-accent-purple', colors.accentPurple)
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.accentCyan} 0%, ${colors.accentPurple} 100%)`)
  root.style.setProperty('--gradient-bg', `linear-gradient(180deg, ${colors.primary} 0%, ${colors.tertiary} 100%)`)
  root.style.setProperty('--glass-bg', `rgba(${hexToRgb(colors.tertiary)}, 0.6)`)
  root.style.setProperty('--shadow-glow-cyan', `0 0 30px ${colors.accentCyan}40`)
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '26, 26, 46'
}

// 点击外部关闭
const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.theme-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('laowang-theme')
  if (savedTheme) {
    setTheme(savedTheme)
  }
  window.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  color: #374151;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.theme-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.arrow {
  transition: transform 0.2s ease;
  color: #6b7280;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #374151;
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.dropdown-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  color: #4f46e5;
  font-weight: 600;
}

.theme-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-name {
  flex: 1;
}

/* Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
