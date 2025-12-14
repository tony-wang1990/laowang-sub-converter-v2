<script setup lang="ts">
// Static footer
</script>

<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-brand">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">LaoWang Sub-converter</span>
      </div>
      
      <div class="footer-links">
        <a href="https://github.com/tony-wang1990/laowang-sub-converter" target="_blank">
          {{ $t('footer.github') }}
        </a>
        <a href="/about">{{ $t('footer.docs') }}</a>
      </div>

      <div class="footer-copyright">
        {{ $t('footer.copyright') }}
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  padding: 3rem 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-accent-cyan);
}

.footer-copyright {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
