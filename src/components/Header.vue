<template>
  <header class="header">
    <div class="container header-container">
      <router-link to="/" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">LaoWang Sub-converter</span>
      </router-link>
      
      <nav class="nav" :class="{ 'nav-open': menuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">
          {{ $t('nav.home') }}
        </router-link>
        <router-link to="/converter" class="nav-link" @click="closeMenu">
          {{ $t('nav.converter') }}
        </router-link>
        <router-link to="/shortlink" class="nav-link" @click="closeMenu">
          {{ $t('nav.shortlink') }}
        </router-link>
        <router-link to="/about" class="nav-link" @click="closeMenu">
          {{ $t('nav.about') }}
        </router-link>
      </nav>

      <div class="header-actions">
        <ThemeSwitcher />
        <LanguageSwitcher />
        <a 
          href="https://github.com/tony-wang1990/laowang-sub-converter" 
          target="_blank" 
          class="github-link"
          title="GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <button class="menu-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: width var(--transition-normal);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text-primary);
}

.nav-link.router-link-active::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.github-link:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text-primary);
  transition: all var(--transition-fast);
}

@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
  }

  .nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
