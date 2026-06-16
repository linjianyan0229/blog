import axios from 'axios'
import { toast } from '@/utils/message'

const TOKEN_KEY = 'blog-token'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 20000,
})

// —— 请求拦截：注入 JWT —— //
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// 401 跳登录（防抖，避免多请求并发重复跳转）
let redirecting = false
async function gotoLogin() {
  if (redirecting) return
  redirecting = true
  localStorage.removeItem(TOKEN_KEY)
  try {
    const { useUserStore } = await import('@/stores/user')
    useUserStore().clear()
    const { default: router } = await import('@/router')
    const cur = router.currentRoute.value
    if (!cur.path.startsWith('/login')) {
      await router.push({ path: '/login', query: { redirect: cur.fullPath } })
    }
  } finally {
    setTimeout(() => (redirecting = false), 800)
  }
}

// —— 响应拦截：解包统一响应 { code, message, data } —— //
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 文件流等非标准响应直接返回
    if (res == null || typeof res !== 'object' || res.code === undefined) {
      return res
    }
    if (res.code === 200) {
      return res.data
    }
    // 业务错误
    const message = res.message || '请求失败'
    switch (res.code) {
      case 401:
        toast.warning('登录已失效，请重新登录')
        gotoLogin()
        break
      case 403:
        toast.error('没有访问权限')
        break
      case 429:
        toast.warning(message || '操作过于频繁，请稍后再试')
        break
      default:
        // 1001~1010 业务错误等，交由调用方决定是否再提示
        if (!response.config?.silent) toast.error(message)
    }
    return Promise.reject(Object.assign(new Error(message), { code: res.code, data: res.data }))
  },
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const status = error.response?.status
    if (status === 401) {
      gotoLogin()
    } else if (status === 403) {
      toast.error('没有访问权限')
    } else if (status === 429) {
      toast.warning('操作过于频繁，请稍后再试')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('请求超时，请检查网络')
    } else {
      toast.error(error.response?.data?.message || '网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
