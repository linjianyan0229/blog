import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 仅在后台用到的 Element Plus 组件按需自动引入
    AutoImport({
      // 样式统一在 main.js 全量引入，这里关闭按需样式以免遗漏
      resolvers: [ElementPlusResolver({ importStyle: false })],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: false })],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 后端接口与上传资源统一走 /api 前缀，代理到 Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
