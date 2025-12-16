<template>
  <div class="client-selector">
    <label class="form-label">{{ $t('converter.targetClient') }}</label>
    
    <div class="client-grid">
      <button
        v-for="client in clients"
        :key="client.id"
        class="client-card"
        :class="{ active: modelValue === client.id }"
        @click="$emit('update:modelValue', client.id)"
      >
        <div class="client-icon">
          <img :src="getIconPath(client.id)" :alt="client.name" />
        </div>
        <div class="client-info">
          <div class="client-name">{{ client.name }}</div>
          <div class="client-platform">{{ client.platform }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入所有客户端图标
import clashIcon from '@/assets/icons/clients/clash.svg'
import clashmetaIcon from '@/assets/icons/clients/clashmeta.svg'
import clashvergeIcon from '@/assets/icons/clients/clashverge.svg'
import karingIcon from '@/assets/icons/clients/karing.svg'
import singboxIcon from '@/assets/icons/clients/singbox.svg'
import nekoboxIcon from '@/assets/icons/clients/nekobox.svg'
import hiddifyIcon from '@/assets/icons/clients/hiddify.svg'
import surgeIcon from '@/assets/icons/clients/surge.svg'
import quantumultxIcon from '@/assets/icons/clients/quantumultx.svg'
import shadowrocketIcon from '@/assets/icons/clients/shadowrocket.svg'
import loonIcon from '@/assets/icons/clients/loon.svg'
import stashIcon from '@/assets/icons/clients/stash.svg'
import v2raynIcon from '@/assets/icons/clients/v2rayn.svg'
import v2rayngIcon from '@/assets/icons/clients/v2rayng.svg'
import v2boxIcon from '@/assets/icons/clients/v2box.svg'
import surfboardIcon from '@/assets/icons/clients/surfboard.svg'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 图标映射
const iconMap: Record<string, string> = {
  clash: clashIcon,
  clashmeta: clashmetaIcon,
  clashverge: clashvergeIcon,
  karing: karingIcon,
  singbox: singboxIcon,
  nekobox: nekoboxIcon,
  hiddify: hiddifyIcon,
  surge: surgeIcon,
  quantumultx: quantumultxIcon,
  shadowrocket: shadowrocketIcon,
  loon: loonIcon,
  stash: stashIcon,
  v2rayn: v2raynIcon,
  v2rayng: v2rayngIcon,
  v2box: v2boxIcon,
  surfboard: surfboardIcon
}

const getIconPath = (clientId: string): string => {
  return iconMap[clientId] || clashIcon
}

const clients = [
  { id: 'clash', name: 'Clash', platform: '全平台' },
  { id: 'clashmeta', name: 'Clash Meta', platform: '全平台' },
  { id: 'clashverge', name: 'Clash Verge', platform: 'PC/Mac' },
  { id: 'karing', name: 'Karing', platform: 'iOS/Android' },
  { id: 'singbox', name: 'sing-box', platform: '全平台' },
  { id: 'nekobox', name: 'NekoBox', platform: 'Android/PC' },
  { id: 'hiddify', name: 'Hiddify', platform: '全平台' },
  { id: 'surge', name: 'Surge', platform: 'iOS/macOS' },
  { id: 'quantumultx', name: 'Quantumult X', platform: 'iOS' },
  { id: 'shadowrocket', name: 'Shadowrocket', platform: 'iOS' },
  { id: 'loon', name: 'Loon', platform: 'iOS' },
  { id: 'stash', name: 'Stash', platform: 'iOS/macOS' },
  { id: 'v2rayn', name: 'V2RayN', platform: 'Windows' },
  { id: 'v2rayng', name: 'V2RayNG', platform: 'Android' },
  { id: 'v2box', name: 'V2Box', platform: 'iOS' },
  { id: 'surfboard', name: 'Surfboard', platform: 'Android' }
]
</script>

<style scoped>
.client-selector {
  margin-bottom: var(--spacing-xl);
}

.client-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-md);
}

.client-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-family: inherit;
  color: var(--color-text-primary);
}

.client-card:hover {
  background: rgba(0, 212, 255, 0.05);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.client-card.active {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--color-accent-cyan);
  box-shadow: var(--shadow-glow-cyan);
}

.client-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.client-platform {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
