import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { publicApi } from '@/api/public'

/**
 * 站点配置 store：启动时从 /public/site-config 拉取 key→value 配置，
 * 应用到 favicon / 站点名，并向各组件提供导航 Logo、首页背景、页脚等可定制项。
 */
export const useSiteStore = defineStore('site', () => {
  const config = ref({})
  const loaded = ref(false)

  /** 取配置值，空则回退 */
  function get(key, fallback = '') {
    const v = config.value?.[key]
    return v === undefined || v === null || v === '' ? fallback : v
  }

  // —— 常用具名项 —— //
  const siteName = computed(() => get('site_name', '蔚蓝博客'))
  const siteIcon = computed(() => get('site_icon'))
  const navTitle = computed(() => get('nav_title'))
  const navLogo = computed(() => get('nav_logo'))
  const homeBackground = computed(() => get('home_background'))
  const homeIntro = computed(() => get('home_intro'))
  const footerText = computed(() => get('footer_text'))

  function applyFavicon() {
    const icon = siteIcon.value
    if (!icon) return
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = icon
  }

  async function init() {
    try {
      const data = await publicApi.getSiteConfig()
      config.value = data && typeof data === 'object' ? data : {}
      loaded.value = true
      applyFavicon()
    } catch {
      // 站点配置不可用时静默降级，使用内置默认
      loaded.value = true
    }
  }

  /** 后台保存后即时刷新前台配置 */
  async function refresh() {
    await init()
  }

  return {
    config,
    loaded,
    get,
    siteName,
    siteIcon,
    navTitle,
    navLogo,
    homeBackground,
    homeIntro,
    footerText,
    init,
    refresh,
  }
})
