<template>
  <div class="language-switcher">
    <button class="current-lang" @click="toggleDropdown">
      <span class="flag">{{ currentLocale.flag }}</span>
      <span class="name">{{ currentLocale.name }}</span>
      <svg class="arrow" :class="{ rotated: isOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown">
        <button 
          v-for="locale in availableLocales" 
          :key="locale.code"
          class="dropdown-item"
          :class="{ active: locale.code === currentLocale.code }"
          @click="changeLocale(locale.code)"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="name">{{ locale.name }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, availableLocales } from '../i18n'

const { locale } = useI18n()
const isOpen = ref(false)

const currentLocale = computed(() => {
  return availableLocales.find(l => l.code === locale.value) || availableLocales[0]
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const changeLocale = (code: string) => {
  setLocale(code)
  isOpen.value = false
}

// 点击外部关闭
const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    isOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.current-lang {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.current-lang:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-border-hover);
}

.flag {
  font-size: 1.1rem;
}

.arrow {
  transition: transform var(--transition-fast);
}

.arrow.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 150px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #64748b;  
  font-family: inherit;
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #1e293b;
}

.dropdown-item.active {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  font-weight: 600;
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
