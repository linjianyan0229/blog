import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'blog-theme'

/**
 * 主题 store：light / dark 切换，默认跟随系统。
 * 真正的 data-theme 在 index.html 首屏脚本里已先行设置，避免闪烁。
 */
export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')
  // 用户是否手动指定过（未指定则跟随系统变化）
  const userSet = ref(false)

  function apply(val) {
    theme.value = val
    document.documentElement.setAttribute('data-theme', val)
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      userSet.value = true
      apply(saved)
    } else {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      apply(sysDark ? 'dark' : 'light')
    }
    // 系统主题变化时，若用户未手动指定则跟随
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!userSet.value) apply(e.matches ? 'dark' : 'light')
    })
  }

  function toggle() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    userSet.value = true
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }

  function set(val) {
    userSet.value = true
    localStorage.setItem(STORAGE_KEY, val)
    apply(val)
  }

  /** 恢复跟随系统 */
  function followSystem() {
    userSet.value = false
    localStorage.removeItem(STORAGE_KEY)
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(sysDark ? 'dark' : 'light')
  }

  return { theme, userSet, init, toggle, set, followSystem }
})
