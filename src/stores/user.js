import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'

const TOKEN_KEY = 'blog-token'

/**
 * 用户 store：JWT、当前用户信息、角色与权限。
 */
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(null)

  const isLogin = computed(() => !!token.value)
  const roles = computed(() => userInfo.value?.roles || [])
  const permissions = computed(() => userInfo.value?.permissions || [])
  const isAdmin = computed(() => roles.value.includes('ADMIN'))

  /** 是否拥有某权限编码（ADMIN 默认全部放行） */
  function hasPerm(code) {
    if (!code) return true
    if (isAdmin.value) return true
    return permissions.value.includes(code)
  }

  function setToken(t) {
    token.value = t
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  }

  function setUserInfo(info) {
    userInfo.value = info
  }

  /** 应用启动时：有 token 则尝试拉取用户信息 */
  async function init() {
    if (token.value) {
      try {
        await fetchInfo()
      } catch {
        // token 失效，清理
        clear()
      }
    }
  }

  async function login(payload) {
    const data = await authApi.login(payload)
    setToken(data.token)
    setUserInfo(data.userInfo)
    return data
  }

  async function fetchInfo() {
    const data = await userApi.getInfo()
    setUserInfo(data)
    return data
  }

  function clear() {
    setToken('')
    setUserInfo(null)
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // 忽略服务端错误，前端直接清理
    }
    clear()
  }

  return {
    token,
    userInfo,
    isLogin,
    roles,
    permissions,
    isAdmin,
    hasPerm,
    setToken,
    setUserInfo,
    init,
    login,
    fetchInfo,
    logout,
    clear,
  }
})
