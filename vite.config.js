import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 减小包体积
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true  // 移除 debugger
      }
    },
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的库进行分组
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor-vue'
            }
            if (id.includes('qrcode')) {
              return 'vendor-qrcode'
            }
            return 'vendor-other'
          }
        }
      }
    },
    // chunk size 警告限制
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vue-i18n', 'qrcode']
  }
})
