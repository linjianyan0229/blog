import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import { useSiteStore } from './stores/site'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化主题、登录态与站点配置（在挂载前完成，避免闪烁）
useThemeStore().init()
useUserStore().init()
useSiteStore().init()

app.mount('#app')
