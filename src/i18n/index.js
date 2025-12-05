import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'
import ruRU from './ru-RU.json'
import faIR from './fa-IR.json'

// 检测浏览器语言
function getDefaultLocale() {
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('ru')) return 'ru-RU'
  if (browserLang.startsWith('fa')) return 'fa-IR'
  return 'en-US'
}

// 从 localStorage 获取保存的语言
function getSavedLocale() {
  return localStorage.getItem('laowang-locale') || getDefaultLocale()
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ru-RU': ruRU,
    'fa-IR': faIR
  }
})

// 切换语言并保存
export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('laowang-locale', locale)
  
  // 处理 RTL 语言
  if (locale === 'fa-IR') {
    document.documentElement.setAttribute('dir', 'rtl')
  } else {
    document.documentElement.setAttribute('dir', 'ltr')
  }
}

// 获取可用语言列表
export const availableLocales = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷' }
]

export default i18n
